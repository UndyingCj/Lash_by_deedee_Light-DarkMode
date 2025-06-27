import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { sendTwoFactorCode } from "@/lib/email"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
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

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const hashedCode = await bcrypt.hash(code, 10)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Save code to database
    await supabaseAdmin
      .from("admin_users")
      .update({
        two_factor_code: hashedCode,
        two_factor_expires: expiresAt.toISOString(),
      })
      .eq("id", user.id)

    // Send email
    await sendTwoFactorCode(email, code)

    return NextResponse.json({ success: true, message: "2FA code sent" })
  } catch (error) {
    console.error("Send 2FA code error:", error)
    return NextResponse.json({ error: "Failed to send 2FA code" }, { status: 500 })
  }
}
