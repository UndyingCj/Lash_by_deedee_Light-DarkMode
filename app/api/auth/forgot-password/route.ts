import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { generateSecureToken } from "@/lib/auth"
import { Resend } from "resend"
import PasswordResetEmail from "@/components/emails/password-reset-email"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 })
    }

    console.log("🔐 Password reset request for:", email)

    // Check if user exists
    const { data: user, error: userError } = await supabaseAdmin
      .from("admin_users")
      .select("*")
      .eq("email", email.toLowerCase())
      .single()

    if (userError || !user) {
      console.log("❌ User not found for password reset:", email)
      // Don't reveal if email exists for security
      return NextResponse.json({
        success: true,
        message: "If the email exists, a reset link has been sent.",
      })
    }

    // Generate reset token
    const resetToken = generateSecureToken()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Save reset token
    const { error: tokenError } = await supabaseAdmin.from("password_reset_tokens").insert({
      user_id: user.id,
      token: resetToken,
      expires_at: expiresAt.toISOString(),
      used: false,
    })

    if (tokenError) {
      console.error("❌ Failed to save reset token:", tokenError)
      return NextResponse.json({ success: false, message: "Failed to generate reset token" }, { status: 500 })
    }

    // Send reset email
    const resetUrl = `https://lashedbydeedee.com/egusi/reset-password?token=${resetToken}`

    try {
      const { data, error: emailError } = await resend.emails.send({
        from: "Lashed by Deedee <noreply@lashedbydeedee.com>",
        to: [email],
        subject: "Reset Your Admin Password",
        react: PasswordResetEmail({ resetUrl, email }),
      })

      if (emailError) {
        console.error("❌ Failed to send reset email:", emailError)
        return NextResponse.json({ success: false, message: "Failed to send reset email" }, { status: 500 })
      }

      console.log("✅ Password reset email sent successfully:", data?.id)
    } catch (emailError) {
      console.error("❌ Email sending error:", emailError)
      return NextResponse.json({ success: false, message: "Failed to send reset email" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "If the email exists, a reset link has been sent.",
    })
  } catch (error) {
    console.error("❌ Password reset error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
