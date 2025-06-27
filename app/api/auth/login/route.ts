import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { sendTwoFactorCode } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    console.log("🔐 Login attempt for:", email)

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Get user from database
    const { data: user, error: userError } = await supabaseAdmin
      .from("admin_users")
      .select("*")
      .eq("email", email.toLowerCase())
      .single()

    if (userError || !user) {
      console.log("❌ User not found:", email)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      console.log("🔒 Account locked until:", user.locked_until)
      return NextResponse.json({ error: "Account is temporarily locked" }, { status: 423 })
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash)

    if (!isPasswordValid) {
      console.log("❌ Invalid password for:", email)

      // Increment failed login attempts
      const failedAttempts = (user.failed_login_attempts || 0) + 1
      const lockUntil = failedAttempts >= 5 ? new Date(Date.now() + 30 * 60 * 1000) : null // 30 minutes

      await supabaseAdmin
        .from("admin_users")
        .update({
          failed_login_attempts: failedAttempts,
          locked_until: lockUntil?.toISOString(),
        })
        .eq("id", user.id)

      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Reset failed login attempts on successful password verification
    await supabaseAdmin
      .from("admin_users")
      .update({
        failed_login_attempts: 0,
        locked_until: null,
        last_login: new Date().toISOString(),
      })
      .eq("id", user.id)

    // Check if 2FA is enabled
    if (user.two_factor_enabled) {
      console.log("📱 2FA required for:", email)

      // Generate and send 2FA code
      const twoFactorCode = Math.floor(100000 + Math.random() * 900000).toString()
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

      // Store 2FA code
      await supabaseAdmin.from("two_factor_codes").insert({
        user_id: user.id,
        code: twoFactorCode,
        expires_at: expiresAt.toISOString(),
      })

      // Send 2FA code via email
      try {
        await sendTwoFactorCode(user.email, twoFactorCode)
        console.log("✅ 2FA code sent to:", email)
      } catch (emailError) {
        console.error("❌ Failed to send 2FA code:", emailError)
        return NextResponse.json({ error: "Failed to send verification code" }, { status: 500 })
      }

      return NextResponse.json({
        requiresTwoFactor: true,
        userId: user.id,
        message: "Verification code sent to your email",
      })
    }

    // Create session for non-2FA login
    const sessionToken = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    await supabaseAdmin.from("admin_sessions").insert({
      user_id: user.id,
      session_token: sessionToken,
      expires_at: expiresAt.toISOString(),
    })

    console.log("✅ Login successful for:", email)

    // Set session cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    })

    response.cookies.set("admin_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
      path: "/",
    })

    return response
  } catch (error) {
    console.error("❌ Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
