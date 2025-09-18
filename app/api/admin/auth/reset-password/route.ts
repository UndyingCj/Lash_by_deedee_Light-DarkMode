import { NextRequest, NextResponse } from 'next/server'
import { AdminAuthService } from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Reset password and get admin data
    const admin = await AdminAuthService.resetPasswordAndGetAdmin(token, password)

    if (!admin) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    // Get client info for session
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const ipAddress = forwardedFor?.split(',')[0] || realIp || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Create session for automatic login
    const sessionToken = await AdminAuthService.createSession(
      admin.id,
      ipAddress,
      userAgent
    )

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Password reset successful, but failed to create session. Please login manually.' },
        { status: 500 }
      )
    }

    // Create response with session cookie and admin data
    const response = NextResponse.json({
      success: true,
      message: 'Password has been reset successfully',
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email
      }
    })

    // Set secure HTTP-only cookie for automatic login
    response.cookies.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: '/'
    })

    return response
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}