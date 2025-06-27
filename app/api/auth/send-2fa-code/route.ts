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
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #e91e63; margin: 0;">Lashed by Deedee</h1>
            <p style="color: #666; margin: 5px 0;">Admin Panel</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;">
            <h2 style="color: #333; margin-bottom: 20px;">Your 2FA Code</h2>
            <p style="color: #666; margin-bottom: 30px;">
              Use this code to complete your login to the admin panel:
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #e91e63;">
              <div style="font-size: 32px; font-weight: bold; color: #e91e63; letter-spacing: 8px; font-family: monospace;">
                ${code}
              </div>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              This code will expire in 10 minutes for security reasons.
            </p>
          </div>
          
          <div style="margin-top: 30px; padding: 20px; background: #fff3cd; border-radius: 8px; border: 1px solid #ffeaa7;">
            <p style="margin: 0; color: #856404; font-size: 14px;">
              <strong>Security Notice:</strong> If you didn't request this code, please ignore this email and contact support immediately.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
            <p>This is an automated message from Lashed by Deedee Admin Panel.</p>
          </div>
        </div>
      `,
    })

    if (error) {
      console.error("Failed to send 2FA code:", error)
      return NextResponse.json({ error: "Failed to send 2FA code" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Send 2FA code API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
