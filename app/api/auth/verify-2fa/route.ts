import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { generateSecureToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json({ success: false, message: "Email and verification code are required" }, { status: 400 })
    }

    console.log("🔐 2FA verification attempt for:", email)

    // Get user from database
    const { data: user, error: userError } = await supabaseAdmin
      .from("admin_users")
      .select("*")
      .eq("email", email.toLowerCase())
      .single()

    if (userError || !user) {
      console.log("❌ User not found:", email)
      return NextResponse.json({ success: false, message: "Invalid verification attempt" }, { status: 401 })
    }

    // Check if 2FA code is valid and not expired
    if (!user.two_factor_code || user.two_factor_code !== code) {
      console.log("❌ Invalid 2FA code for:", email)
      return NextResponse.json({ success: false, message: "Invalid verification code" }, { status: 401 })
    }

    if (!user.two_factor_expires || new Date(user.two_factor_expires) < new Date()) {
      console.log("❌ Expired 2FA code for:", email)
      return NextResponse.json({ success: false, message: "Verification code has expired" }, { status: 401 })
    }

    // Clear 2FA code
    await supabaseAdmin
      .from("admin_users")
      .update({
        two_factor_code: null,
        two_factor_expires: null,
        last_login: new Date().toISOString(),
      })
      .eq("id", user.id)

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

    console.log("✅ 2FA verification successful for:", email)

    const response = NextResponse.json({
      success: true,
      message: "Verification successful",
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
    console.error("❌ 2FA verification error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
