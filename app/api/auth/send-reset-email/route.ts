import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email, token } = await request.json()

    if (!email || !token) {
      return NextResponse.json({ error: "Email and token are required" }, { status: 400 })
    }

    const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/egusi/reset-password?token=${token}`

    const { data, error } = await resend.emails.send({
      from: "Lashed by Deedee <noreply@lashedbydeedee.com>",
      to: [email],
      subject: "Reset Your Admin Password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #ec4899; margin: 0;">Lashed by Deedee</h1>
            <p style="color: #666; margin: 5px 0;">Admin Panel Password Reset</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px;">
            <h2 style="color: #333; margin-bottom: 20px;">Reset Your Password</h2>
            <p style="color: #666; margin-bottom: 25px;">
              You requested to reset your admin panel password. Click the button below to create a new password.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background: #ec4899; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 25px;">
              This link will expire in 1 hour. If you didn't request this reset, please ignore this email.
            </p>
            
            <div style="background: #fff; padding: 15px; border-radius: 6px; margin-top: 20px; border-left: 4px solid #ec4899;">
              <p style="color: #666; font-size: 12px; margin: 0;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <span style="word-break: break-all; color: #ec4899;">${resetUrl}</span>
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px;">
              This email was sent from Lashed by Deedee Admin System
            </p>
          </div>
        </div>
      `,
    })

    if (error) {
      console.error("Resend error:", error)
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
    }

    return NextResponse.json({ success: true, messageId: data?.id })
  } catch (error) {
    console.error("Send reset email API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
