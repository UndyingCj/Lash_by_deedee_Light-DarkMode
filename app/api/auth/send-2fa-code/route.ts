import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json()

    console.log("📱 Sending 2FA code to:", email)

    if (!email || !code) {
      return NextResponse.json({ error: "Email and code are required" }, { status: 400 })
    }

    const { data, error } = await resend.emails.send({
      from: "Lashed by Deedee <noreply@lashedbydeedee.com>",
      to: [email],
      subject: "Your Admin Login Code - Lashed by Deedee",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Login Verification Code</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #ec4899 0%, #be185d 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Login Verification</h1>
              <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Lashed by Deedee Admin Panel</p>
            </div>
            
            <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <h2 style="color: #1f2937; margin-bottom: 20px;">Your Verification Code</h2>
              
              <p style="margin-bottom: 30px; color: #6b7280;">
                Use this code to complete your login to the admin panel:
              </p>
              
              <div style="text-align: center; margin: 40px 0;">
                <div style="background: #f3f4f6; border: 2px dashed #d1d5db; border-radius: 8px; padding: 20px; display: inline-block;">
                  <span style="font-size: 32px; font-weight: bold; color: #1f2937; letter-spacing: 4px; font-family: monospace;">
                    ${code}
                  </span>
                </div>
              </div>
              
              <p style="color: #ef4444; font-weight: bold; text-align: center; margin: 20px 0;">
                This code expires in 10 minutes
              </p>
              
              <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 30px 0;">
                <p style="margin: 0; color: #92400e; font-size: 14px;">
                  <strong>Security Notice:</strong> If you didn't request this code, please ignore this email and contact support immediately.
                </p>
              </div>
              
              <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                  © 2024 Lashed by Deedee. All rights reserved.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error("❌ Failed to send 2FA code:", error)
      return NextResponse.json({ error: "Failed to send verification code" }, { status: 500 })
    }

    console.log("✅ 2FA code sent successfully")
    return NextResponse.json({ success: true, message: "Verification code sent" })
  } catch (error) {
    console.error("❌ Send 2FA code error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
