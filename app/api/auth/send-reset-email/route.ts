import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email, token } = await request.json()

    if (!email || !token) {
      return NextResponse.json({ error: "Email and token are required" }, { status: 400 })
    }

    // Use production URL instead of localhost
    const resetUrl = `https://lashedbydeedee.com/egusi/reset-password?token=${token}`

    const { data, error } = await resend.emails.send({
      from: "Lashed by Deedee <noreply@lashedbydeedee.com>",
      to: [email],
      subject: "Reset Your Admin Password - Lashed by Deedee",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset - Lashed by Deedee</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
            <div style="background: linear-gradient(135deg, #ec4899, #be185d); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🔑 Password Reset</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Lashed by Deedee Admin Panel</p>
            </div>
            
            <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-top: 0; font-size: 24px;">Reset Your Admin Password</h2>
              
              <p style="font-size: 16px; margin-bottom: 20px;">Hello,</p>
              
              <p style="font-size: 16px; margin-bottom: 30px;">You've requested to reset your password for your Lashed by Deedee admin account. Click the button below to create a new password:</p>
              
              <div style="text-align: center; margin: 40px 0;">
                <a href="${resetUrl}" style="background: #ec4899; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px; box-shadow: 0 2px 4px rgba(236,72,153,0.3); transition: all 0.3s ease;">
                  Reset Password Now
                </a>
              </div>
              
              <div style="background: #f1f3f4; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <p style="margin: 0 0 10px 0; font-weight: bold; color: #333;">Or copy and paste this link:</p>
                <p style="margin: 0; word-break: break-all; font-family: monospace; font-size: 14px; color: #ec4899;">${resetUrl}</p>
              </div>
              
              <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 30px 0;">
                <p style="margin: 0 0 15px 0; font-weight: bold; color: #856404;">⚠️ Important Security Information:</p>
                <ul style="color: #856404; margin: 0; padding-left: 20px;">
                  <li>This link expires in 1 hour for your security</li>
                  <li>If you didn't request this reset, please ignore this email</li>
                  <li>Your current password remains active until you create a new one</li>
                  <li>Only use this link from a secure device</li>
                </ul>
              </div>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 40px 0;">
              
              <div style="text-align: center;">
                <p style="color: #666; font-size: 14px; margin: 0;">
                  This is an automated security message from<br>
                  <strong>Lashed by Deedee Admin System</strong><br>
                  Please do not reply to this email.
                </p>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
              <p style="color: #999; font-size: 12px;">
                © 2024 Lashed by Deedee. All rights reserved.
              </p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error("Resend error:", error)
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
    }

    console.log("Password reset email sent successfully to:", email)
    return NextResponse.json({ success: true, messageId: data?.id })
  } catch (error) {
    console.error("Send reset email API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
