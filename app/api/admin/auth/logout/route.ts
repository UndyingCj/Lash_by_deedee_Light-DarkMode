import { NextRequest, NextResponse } from 'next/server'
import { AdminAuthService } from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('admin_session')?.value

    if (sessionToken) {
      await AdminAuthService.destroySession(sessionToken)
    }

    // Create response and clear cookie
    const response = NextResponse.json({ success: true })
    response.cookies.delete('admin_session')

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}