import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { generateSecureToken } from "@/lib/auth"
import { sendTwoFactorCode } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ success: false, message: "Email and password are required" }, { status: 400 })
    }

    console.log("🔐 Login attempt for:", email)

    // Get user from database
    const { data: user, error: userError } = await supabaseAdmin
      .from("admin_users")
      .select("*")
      .eq("email", email.toLowerCase())
      .single()

    if (userError || !user) {
      console.log("❌ User not found:", email)
      return NextResponse.json({ success: false, message: "Invalid email or password" }, { status: 401 })
    }

    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      const lockTime = Math.ceil((new Date(user.locked_until).getTime() - Date.now()) / (1000 * 60))
      return NextResponse.json(
        { success: false, message: `Account locked. Try again in ${lockTime} minutes.` },
        { status: 423 },
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash)

    if (!isValidPassword) {
      console.log("❌ Invalid password for:", email)

      // Increment failed attempts
      const failedAttempts = (user.failed_attempts || 0) + 1
      const lockUntil = failedAttempts >= 5 ? new Date(Date.now() + 30 * 60 * 1000) : null

      await supabaseAdmin
        .from("admin_users")
        .update({
          failed_attempts: failedAttempts,
          locked_until: lockUntil?.toISOString(),
          last_failed_login: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (lockUntil) {
        return NextResponse.json(
          { success: false, message: "Too many failed attempts. Account locked for 30 minutes." },
          { status: 423 },
        )
      }

      return NextResponse.json({ success: false, message: "Invalid email or password" }, { status: 401 })
    }

    // Reset failed attempts on successful password verification
    await supabaseAdmin
      .from("admin_users")
      .update({
        failed_attempts: 0,
        locked_until: null,
        last_login: new Date().toISOString(),
      })
      .eq("id", user.id)

    // Check if 2FA is enabled
    if (user.two_factor_enabled) {
      // Generate and send 2FA code
      const twoFactorCode = Math.floor(100000 + Math.random() * 900000).toString()
      const codeExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

      await supabaseAdmin
        .from("admin_users")
        .update({
          two_factor_code: twoFactorCode,
          two_factor_expires: codeExpiry.toISOString(),
        })
        .eq("id", user.id)

      // Send 2FA code via email
      try {
        await sendTwoFactorCode(user.email, twoFactorCode)
        console.log("✅ 2FA code sent to:", user.email)
      } catch (emailError) {
        console.error("❌ Failed to send 2FA code:", emailError)
        return NextResponse.json(
          { success: false, message: "Failed to send verification code. Please try again." },
          { status: 500 },
        )
      }

      return NextResponse.json({
        success: true,
        requiresTwoFactor: true,
        message: "Verification code sent to your email",
      })
    }

    // Create session
    const sessionToken = generateSecureToken()
    const sessionExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    await supabaseAdmin.from("admin_sessions").insert({
      user_id: user.id,
      session_token: sessionToken,
      expires_at: sessionExpiry.toISOString(),
      ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
      user_agent: request.headers.get("user-agent") || "unknown",
    })

    console.log("✅ Login successful for:", email)

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    })

    // Set secure session cookie
    response.cookies.set("admin_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
      path: "/egusi",
    })

    return response
  } catch (error) {
    console.error("❌ Login error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
