import { type NextRequest, NextResponse } from "next/server"
import { sendTwoFactorCode } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json({ success: false, message: "Email and code are required" }, { status: 400 })
    }

    console.log("📧 Sending 2FA code to:", email)

    await sendTwoFactorCode(email, code)

    console.log("✅ 2FA code sent successfully to:", email)

    return NextResponse.json({
      success: true,
      message: "Verification code sent successfully",
    })
  } catch (error) {
    console.error("❌ Error sending 2FA code:", error)
    return NextResponse.json({ success: false, message: "Failed to send verification code" }, { status: 500 })
  }
}
