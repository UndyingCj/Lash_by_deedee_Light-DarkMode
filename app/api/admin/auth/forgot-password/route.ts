import { NextRequest, NextResponse } from 'next/server'
import { AdminAuthService } from '@/lib/admin-auth'
import { sendEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Generate reset token
    const resetToken = await AdminAuthService.generatePasswordResetToken(email)

    if (!resetToken) {
      // Don't reveal if email exists or not for security
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      })
    }

    // Send reset email
    const resetLink = `${process.env.NEXT_PUBLIC_SITE_URL}/egusi/reset-password?token=${resetToken}`

    try {
      await sendEmail({
        to: email,
        subject: 'Password Reset - Lashed by Deedee Admin',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #ec4899;">Password Reset Request</h2>
            <p>You have requested to reset your admin password for Lashed by Deedee.</p>
            <p>Click the link below to reset your password:</p>
            <a href="${resetLink}" style="display: inline-block; background-color: #ec4899; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">Reset Password</a>
            <p>This link will expire in 1 hour.</p>
            <p>If you did not request this password reset, please ignore this email.</p>
            <hr style="margin: 24px 0;">
            <p style="color: #6b7280; font-size: 14px;">
              This is an automated email from Lashed by Deedee Admin System.
            </p>
          </div>
        `
      })
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError)
      // Still return success to not reveal email existence
    }

    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}