import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { sendTwoFactorCode } from "@/lib/email"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 })
    }

    // Generate a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    // Hash the code before storing
    const hashedCode = await bcrypt.hash(code, 10)

    // Set expiration time (10 minutes from now)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    // Store the hashed code in database
    const { error: updateError } = await supabaseAdmin
      .from("admin_auth")
      .update({
        two_factor_code: hashedCode,
        two_factor_expires: expiresAt,
      })
      .eq("email", email)

    if (updateError) {
      console.error("Error storing 2FA code:", updateError)
      return NextResponse.json({ success: false, error: "Failed to generate verification code" }, { status: 500 })
    }

    // Send the code via email
    try {
      await sendTwoFactorCode(email, code)
      return NextResponse.json({ success: true, message: "Verification code sent successfully" })
    } catch (emailError) {
      console.error("Error sending 2FA email:", emailError)
      return NextResponse.json({ success: false, error: "Failed to send verification code" }, { status: 500 })
    }
  } catch (error) {
    console.error("Send 2FA code error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
