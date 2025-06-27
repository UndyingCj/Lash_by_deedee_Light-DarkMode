import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import TwoFactorEmail from "@/components/emails/two-factor-email"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json({ error: "Email and code are required" }, { status: 400 })
    }

    console.log("📧 Sending 2FA code to:", email)

    const { data, error } = await resend.emails.send({
      from: "Lashed by Deedee <noreply@lashedbydeedee.com>",
      to: [email],
      subject: "Your Admin Login Verification Code",
      react: TwoFactorEmail({ code }),
    })

    if (error) {
      console.error("❌ Failed to send 2FA email:", error)
      return NextResponse.json({ error: "Failed to send verification code" }, { status: 500 })
    }

    console.log("✅ 2FA email sent successfully:", data?.id)
    return NextResponse.json({ success: true, message: "Verification code sent" })
  } catch (error) {
    console.error("❌ 2FA email error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
