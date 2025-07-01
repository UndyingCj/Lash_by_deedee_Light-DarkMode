import { type NextRequest, NextResponse } from "next/server"
import { sendEmail } from "@/lib/email"
import { TwoFactorEmail } from "@/components/emails/two-factor-email"

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json({ error: "Missing email or code" }, { status: 400 })
    }

    await sendEmail({
      to: email,
      subject: "Your Two-Factor Authentication Code",
      react: TwoFactorEmail({ code }),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending 2FA code:", error)
    return NextResponse.json({ error: "Failed to send code" }, { status: 500 })
  }
}
