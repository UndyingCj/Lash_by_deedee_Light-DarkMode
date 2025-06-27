import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import PasswordResetEmail from "@/components/emails/password-reset-email"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email, token } = await request.json()

    if (!email || !token) {
      return NextResponse.json({ error: "Email and token are required" }, { status: 400 })
    }

    console.log("📧 Sending password reset email to:", email)

    const resetUrl = `https://lashedbydeedee.com/egusi/reset-password?token=${token}`

    const { data, error } = await resend.emails.send({
      from: "Lashed by Deedee <noreply@lashedbydeedee.com>",
      to: [email],
      subject: "Reset Your Admin Password",
      react: PasswordResetEmail({ resetUrl, email }),
    })

    if (error) {
      console.error("❌ Failed to send reset email:", error)
      return NextResponse.json({ error: "Failed to send reset email" }, { status: 500 })
    }

    console.log("✅ Reset email sent successfully:", data?.id)
    return NextResponse.json({ success: true, message: "Reset email sent" })
  } catch (error) {
    console.error("❌ Reset email error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
