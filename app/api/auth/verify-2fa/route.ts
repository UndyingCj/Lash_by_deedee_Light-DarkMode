import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json({ error: "Email and code are required" }, { status: 400 })
    }

    // Get user from database
    const { data: user, error: userError } = await supabaseAdmin
      .from("admin_users")
      .select("*")
      .eq("email", email)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if code is valid and not expired
    if (!user.two_factor_code || !user.two_factor_expires) {
      return NextResponse.json({ error: "No 2FA code found" }, { status: 400 })
    }

    const now = new Date()
    const expiresAt = new Date(user.two_factor_expires)

    if (now > expiresAt) {
      return NextResponse.json({ error: "2FA code has expired" }, { status: 400 })
    }

    // Verify the code
    const isValidCode = await bcrypt.compare(code, user.two_factor_code)

    if (!isValidCode) {
      return NextResponse.json({ error: "Invalid 2FA code" }, { status: 400 })
    }

    // Clear 2FA code and create session
    const sessionToken = crypto.randomUUID()
    const expiresIn = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Update user and create session
    await supabaseAdmin
      .from("admin_users")
      .update({
        two_factor_code: null,
        two_factor_expires: null,
        last_login: new Date().toISOString(),
      })
      .eq("id", user.id)

    await supabaseAdmin.from("admin_sessions").insert({
      user_id: user.id,
      session_token: sessionToken,
      expires_at: expiresIn.toISOString(),
    })

    // Set session cookie
    const response = NextResponse.json({ success: true, user: { id: user.id, email: user.email, name: user.name } })
    response.cookies.set("admin_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresIn,
    })

    return response
  } catch (error) {
    console.error("2FA verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
