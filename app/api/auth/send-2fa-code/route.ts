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
      subject: "Your Admin Login Code",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Admin Login Code</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #ec4899, #be185d); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Admin Login Code</h1>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
              <h2 style="color: #333; margin-top: 0;">Your Verification Code</h2>
              
              <p>Hello,</p>
              
              <p>You're trying to log into your Lashed by Deedee admin panel. Here's your verification code:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <div style="background: #fff; border: 2px solid #ec4899; padding: 20px; border-radius: 10px; display: inline-block;">
                  <span style="font-size: 32px; font-weight: bold; color: #ec4899; letter-spacing: 8px; font-family: monospace;">${code}</span>
                </div>
              </div>
              
              <p><strong>Important:</strong></p>
              <ul style="color: #666;">
                <li>This code expires in 10 minutes</li>
                <li>Don't share this code with anyone</li>
                <li>If you didn't request this code, please ignore this email</li>
              </ul>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              
              <p style="color: #666; font-size: 14px; text-align: center;">
                This is an automated message from Lashed by Deedee Admin System<br>
                Please do not reply to this email.
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

    return NextResponse.json({ success: true, messageId: data?.id })
  } catch (error) {
    console.error("Send 2FA code API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
