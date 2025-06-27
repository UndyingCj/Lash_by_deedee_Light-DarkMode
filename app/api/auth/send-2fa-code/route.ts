import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { sendTwoFactorCode } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 })
    }

    console.log("📧 Sending 2FA code to:", email)

    // Get user from database
    const { data: user, error: userError } = await supabaseAdmin
      .from("admin_users")
      .select("*")
      .eq("email", email.toLowerCase())
      .single()

    if (userError || !user) {
      console.log("❌ User not found:", email)
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    // Generate new 2FA code
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
      console.log("✅ 2FA code sent successfully to:", user.email)
    } catch (emailError) {
      console.error("❌ Failed to send 2FA code:", emailError)
      return NextResponse.json(
        { success: false, message: "Failed to send verification code. Please try again." },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Verification code sent to your email",
    })
  } catch (error) {
    console.error("❌ Send 2FA code error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
