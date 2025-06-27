import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json({ error: "Email and code are required" }, { status: 400 })
    }

    const { data, error } = await resend.emails.send({
      from: "Lashed by Deedee <noreply@lashedbydeedee.com>",
      to: [email],
      subject: "Your 2FA Code - Lashed by Deedee Admin",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>2FA Code - Lashed by Deedee</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
            <div style="background: linear-gradient(135deg, #ec4899, #be185d); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Two-Factor Authentication</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Lashed by Deedee Admin Panel</p>
            </div>
            
            <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-top: 0; font-size: 24px;">Your Verification Code</h2>
              
              <p style="font-size: 16px; margin-bottom: 30px;">
                Use this code to complete your login to the Lashed by Deedee admin panel:
              </p>
              
              <div style="background: #f8f9fa; border: 2px solid #ec4899; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
                <div style="font-size: 36px; font-weight: bold; color: #ec4899; letter-spacing: 8px; font-family: monospace;">
                  ${code}
                </div>
              </div>
              
              <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 30px 0;">
                <p style="margin: 0 0 15px 0; font-weight: bold; color: #856404;">⏰ Important:</p>
                <ul style="color: #856404; margin: 0; padding-left: 20px;">
                  <li>This code expires in 10 minutes</li>
                  <li>Use it only on the official admin login page</li>
                  <li>Don't share this code with anyone</li>
                  <li>If you didn't request this, contact support immediately</li>
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
      return NextResponse.json({ error: "Failed to send 2FA code" }, { status: 500 })
    }

    console.log("2FA code sent successfully to:", email)
    return NextResponse.json({ success: true, messageId: data?.id })
  } catch (error) {
    console.error("Send 2FA code API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
