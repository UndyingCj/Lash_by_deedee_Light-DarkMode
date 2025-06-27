import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function POST(request: NextRequest) {
  try {
    const { userId, code } = await request.json()

    console.log("🔐 2FA verification attempt for user:", userId)

    if (!userId || !code) {
      return NextResponse.json({ error: "User ID and code are required" }, { status: 400 })
    }

    // Find valid 2FA code
    const { data: twoFactorCode, error: codeError } = await supabaseAdmin
      .from("two_factor_codes")
      .select("*")
      .eq("user_id", userId)
      .eq("code", code)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .single()

    if (codeError || !twoFactorCode) {
      console.log("❌ Invalid or expired 2FA code")
      return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 })
    }

    // Mark code as used
    await supabaseAdmin
      .from("two_factor_codes")
      .update({ used: true, used_at: new Date().toISOString() })
      .eq("id", twoFactorCode.id)

    // Create session
    const sessionToken = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    await supabaseAdmin.from("admin_sessions").insert({
      user_id: userId,
      session_token: sessionToken,
      expires_at: expiresAt.toISOString(),
    })

    // Update last login
    await supabaseAdmin.from("admin_users").update({ last_login: new Date().toISOString() }).eq("id", userId)

    console.log("✅ 2FA verification successful")

    // Set session cookie
    const response = NextResponse.json({
      success: true,
      message: "Verification successful",
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
    console.error("❌ 2FA verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
