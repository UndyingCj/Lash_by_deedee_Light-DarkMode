import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"
import crypto from "crypto"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export interface AdminUser {
  id: string
  username: string
  email: string
  is_active: boolean
  two_factor_enabled: boolean
  last_login?: string
  failed_login_attempts: number
  locked_until?: string
}

export interface LoginResult {
  success: boolean
  user?: AdminUser
  requiresTwoFactor?: boolean
  message?: string
  sessionToken?: string
}

export interface TwoFactorResult {
  success: boolean
  message?: string
  sessionToken?: string
}

// Generate 6-digit 2FA code
export function generateTwoFactorCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Generate secure session token
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Authenticate admin user
export async function authenticateAdmin(username: string, password: string): Promise<LoginResult> {
  try {
    // Get user from database
    const { data: user, error } = await supabase
      .from("admin_users")
      .select("*")
      .eq("username", username)
      .eq("is_active", true)
      .single()

    if (error || !user) {
      return { success: false, message: "Invalid credentials" }
    }

    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      return { success: false, message: "Account is temporarily locked. Please try again later." }
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash)

    if (!isValidPassword) {
      // Increment failed attempts
      const failedAttempts = user.failed_login_attempts + 1
      const lockUntil = failedAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null // Lock for 15 minutes after 5 failed attempts

      await supabase
        .from("admin_users")
        .update({
          failed_login_attempts: failedAttempts,
          locked_until: lockUntil?.toISOString(),
        })
        .eq("id", user.id)

      return { success: false, message: "Invalid credentials" }
    }

    // Reset failed attempts on successful password verification
    await supabase
      .from("admin_users")
      .update({
        failed_login_attempts: 0,
        locked_until: null,
      })
      .eq("id", user.id)

    // Check if 2FA is enabled
    if (user.two_factor_enabled) {
      // Generate and send 2FA code
      const code = generateTwoFactorCode()
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

      await supabase.from("two_factor_codes").insert({
        user_id: user.id,
        code,
        expires_at: expiresAt.toISOString(),
      })

      // Send 2FA code via email
      await sendTwoFactorCode(user.email, code)

      return {
        success: true,
        requiresTwoFactor: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          is_active: user.is_active,
          two_factor_enabled: user.two_factor_enabled,
          last_login: user.last_login,
          failed_login_attempts: user.failed_login_attempts,
          locked_until: user.locked_until,
        },
        message: "2FA code sent to your email",
      }
    }

    // Create session
    const sessionToken = generateSessionToken()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    await supabase.from("admin_sessions").insert({
      user_id: user.id,
      session_token: sessionToken,
      expires_at: expiresAt.toISOString(),
    })

    // Update last login
    await supabase.from("admin_users").update({ last_login: new Date().toISOString() }).eq("id", user.id)

    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        is_active: user.is_active,
        two_factor_enabled: user.two_factor_enabled,
        last_login: user.last_login,
        failed_login_attempts: user.failed_login_attempts,
        locked_until: user.locked_until,
      },
      sessionToken,
    }
  } catch (error) {
    console.error("Authentication error:", error)
    return { success: false, message: "Authentication failed" }
  }
}

// Verify 2FA code
export async function verifyTwoFactorCode(userId: string, code: string): Promise<TwoFactorResult> {
  try {
    // Get valid code
    const { data: twoFactorCode, error } = await supabase
      .from("two_factor_codes")
      .select("*")
      .eq("user_id", userId)
      .eq("code", code)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .single()

    if (error || !twoFactorCode) {
      return { success: false, message: "Invalid or expired code" }
    }

    // Mark code as used
    await supabase.from("two_factor_codes").update({ used: true }).eq("id", twoFactorCode.id)

    // Create session
    const sessionToken = generateSessionToken()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    await supabase.from("admin_sessions").insert({
      user_id: userId,
      session_token: sessionToken,
      expires_at: expiresAt.toISOString(),
    })

    // Update last login
    await supabase.from("admin_users").update({ last_login: new Date().toISOString() }).eq("id", userId)

    return { success: true, sessionToken }
  } catch (error) {
    console.error("2FA verification error:", error)
    return { success: false, message: "Verification failed" }
  }
}

// Validate session
export async function validateSession(sessionToken: string): Promise<AdminUser | null> {
  try {
    const { data: session, error } = await supabase
      .from("admin_sessions")
      .select(`
        *,
        admin_users (*)
      `)
      .eq("session_token", sessionToken)
      .gt("expires_at", new Date().toISOString())
      .single()

    if (error || !session || !session.admin_users) {
      return null
    }

    const user = Array.isArray(session.admin_users) ? session.admin_users[0] : session.admin_users

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      is_active: user.is_active,
      two_factor_enabled: user.two_factor_enabled,
      last_login: user.last_login,
      failed_login_attempts: user.failed_login_attempts,
      locked_until: user.locked_until,
    }
  } catch (error) {
    console.error("Session validation error:", error)
    return null
  }
}

// Generate password reset token
export async function generatePasswordResetToken(email: string): Promise<{ success: boolean; message: string }> {
  try {
    // Get user by email
    const { data: user, error } = await supabase
      .from("admin_users")
      .select("*")
      .eq("email", email)
      .eq("is_active", true)
      .single()

    if (error || !user) {
      // Don't reveal if email exists or not
      return { success: true, message: "If the email exists, a reset link has been sent." }
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await supabase.from("password_reset_tokens").insert({
      user_id: user.id,
      token,
      expires_at: expiresAt.toISOString(),
    })

    // Send reset email
    await sendPasswordResetEmail(user.email, token)

    return { success: true, message: "If the email exists, a reset link has been sent." }
  } catch (error) {
    console.error("Password reset token generation error:", error)
    return { success: false, message: "Failed to generate reset token" }
  }
}

// Reset password with token
export async function resetPasswordWithToken(
  token: string,
  newPassword: string,
): Promise<{ success: boolean; message: string }> {
  try {
    // Validate token
    const { data: resetToken, error } = await supabase
      .from("password_reset_tokens")
      .select("*")
      .eq("token", token)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .single()

    if (error || !resetToken) {
      return { success: false, message: "Invalid or expired reset token" }
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword)

    // Update password
    await supabase
      .from("admin_users")
      .update({
        password_hash: passwordHash,
        password_changed_at: new Date().toISOString(),
      })
      .eq("id", resetToken.user_id)

    // Mark token as used
    await supabase.from("password_reset_tokens").update({ used: true }).eq("id", resetToken.id)

    // Invalidate all sessions for this user
    await supabase.from("admin_sessions").delete().eq("user_id", resetToken.user_id)

    return { success: true, message: "Password reset successfully" }
  } catch (error) {
    console.error("Password reset error:", error)
    return { success: false, message: "Failed to reset password" }
  }
}

// Send 2FA code via email
async function sendTwoFactorCode(email: string, code: string): Promise<void> {
  try {
    const response = await fetch("/api/auth/send-2fa-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    })

    if (!response.ok) {
      throw new Error("Failed to send 2FA code")
    }
  } catch (error) {
    console.error("Error sending 2FA code:", error)
    throw error
  }
}

// Send password reset email
async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  try {
    const response = await fetch("/api/auth/send-reset-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, token }),
    })

    if (!response.ok) {
      throw new Error("Failed to send reset email")
    }
  } catch (error) {
    console.error("Error sending reset email:", error)
    throw error
  }
}

// Logout (invalidate session)
export async function logout(sessionToken: string): Promise<void> {
  try {
    await supabase.from("admin_sessions").delete().eq("session_token", sessionToken)
  } catch (error) {
    console.error("Logout error:", error)
  }
}
