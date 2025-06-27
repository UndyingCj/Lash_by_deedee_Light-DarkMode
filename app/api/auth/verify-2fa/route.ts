import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function POST(request: NextRequest) {
  try {
    const { userId, code } = await request.json()

    console.log("🔐 2FA verification attempt for user:", userId)

    if (!userId || !code) {
      return NextResponse.json({ error: "User ID and code are required" }, { status: 400 })
    }

    // Get the most recent unused 2FA code for this user
    const { data: twoFactorCode, error: codeError } = await supabaseAdmin
      .from("two_factor_codes")
      .select("*")
      .eq("user_id", userId)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (codeError || !twoFactorCode) {
      console.log("❌ No valid 2FA code found for user:", userId)
      return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 401 })
    }

    // Verify the code
    if (twoFactorCode.code !== code) {
      console.log("❌ Invalid 2FA code for user:", userId)
      return NextResponse.json({ error: "Invalid verification code" }, { status: 401 })
    }

    // Mark code as used
    await supabaseAdmin
      .from("two_factor_codes")
      .update({
        used: true,
        used_at: new Date().toISOString(),
      })
      .eq("id", twoFactorCode.id)

    // Get user details
    const { data: user, error: userError } = await supabaseAdmin
      .from("admin_users")
      .select("*")
      .eq("id", userId)
      .single()

    if (userError || !user) {
      console.log("❌ User not found:", userId)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Create session
    const sessionToken = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    await supabaseAdmin.from("admin_sessions").insert({
      user_id: user.id,
      session_token: sessionToken,
      expires_at: expiresAt.toISOString(),
    })

    console.log("✅ 2FA verification successful for:", user.email)

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
    console.error("❌ 2FA verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
