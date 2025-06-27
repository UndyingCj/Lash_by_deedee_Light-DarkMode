import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json()

    console.log("📧 Sending 2FA code to:", email)

    if (!email || !code) {
      return NextResponse.json({ error: "Email and code are required" }, { status: 400 })
    }

    const { data, error } = await resend.emails.send({
      from: "Lashed by Deedee <noreply@lashedbydeedee.com>",
      to: [email],
      subject: "Your Admin Login Verification Code",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verification Code</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #ec4899 0%, #be185d 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Admin Login Verification</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hello,</p>
            
            <p style="font-size: 16px; margin-bottom: 25px;">
              You're attempting to log into your Lashed by Deedee admin panel. Please use the verification code below:
            </p>
            
            <div style="background: white; border: 2px solid #ec4899; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
              <div style="font-size: 32px; font-weight: bold; color: #ec4899; letter-spacing: 8px; font-family: monospace;">
                ${code}
              </div>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-bottom: 20px;">
              This code will expire in 10 minutes for security reasons.
            </p>
            
            <p style="font-size: 14px; color: #666; margin-bottom: 20px;">
              If you didn't request this code, please ignore this email or contact support if you have concerns.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e9ecef; margin: 25px 0;">
            
            <div style="text-align: center; color: #666; font-size: 12px;">
              <p>Lashed by Deedee Admin Panel</p>
              <p>This is an automated message, please do not reply.</p>
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
