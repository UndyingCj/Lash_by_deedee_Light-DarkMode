import { type NextRequest, NextResponse } from "next/server"
import { sendEmail } from "@/lib/email"
import { PasswordResetEmail } from "@/components/emails/password-reset-email"

export async function POST(request: NextRequest) {
  try {
    const { email, token } = await request.json()

    if (!email || !token) {
      return NextResponse.json({ error: "Missing email or token" }, { status: 400 })
    }

    const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/egusi/reset-password?token=${token}`

    await sendEmail({
      to: email,
      subject: "Reset Your Password - Lashed by Deedee",
      react: PasswordResetEmail({ resetUrl }),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending reset email:", error)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}
