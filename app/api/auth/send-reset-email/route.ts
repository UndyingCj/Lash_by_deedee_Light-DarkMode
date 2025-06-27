import { type NextRequest, NextResponse } from "next/server"
import { sendPasswordResetEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { email, token } = await request.json()

    if (!email || !token) {
      return NextResponse.json({ success: false, message: "Email and token are required" }, { status: 400 })
    }

    console.log("📧 Sending password reset email to:", email)

    await sendPasswordResetEmail(email, token)

    console.log("✅ Password reset email sent successfully to:", email)

    return NextResponse.json({
      success: true,
      message: "Password reset email sent successfully",
    })
  } catch (error) {
    console.error("❌ Error sending password reset email:", error)
    return NextResponse.json({ success: false, message: "Failed to send password reset email" }, { status: 500 })
  }
}
