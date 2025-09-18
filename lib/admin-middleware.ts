import { NextRequest, NextResponse } from 'next/server'
import { AdminAuthService } from './admin-auth'

export async function adminAuthMiddleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Skip authentication for login and password reset pages
  if (
    pathname === '/egusi' ||
    pathname === '/egusi/forgot-password' ||
    pathname === '/egusi/reset-password' ||
    pathname.startsWith('/api/admin/auth/')
  ) {
    return NextResponse.next()
  }

  // Check for admin session
  const sessionToken = request.cookies.get('admin_session')?.value

  if (!sessionToken) {
    return NextResponse.redirect(new URL('/egusi', request.url))
  }

  // Validate session
  const admin = await AdminAuthService.validateSession(sessionToken)
  if (!admin) {
    // Clear invalid session cookie and redirect
    const response = NextResponse.redirect(new URL('/egusi', request.url))
    response.cookies.delete('admin_session')
    return response
  }

  // Add admin info to headers for use in components
  const response = NextResponse.next()
  response.headers.set('x-admin-id', admin.id)
  response.headers.set('x-admin-username', admin.username)
  response.headers.set('x-admin-email', admin.email)

  return response
}

// Helper function to get admin from request headers (for use in server components)
export function getAdminFromHeaders(headers: Headers) {
  const adminId = headers.get('x-admin-id')
  const username = headers.get('x-admin-username')
  const email = headers.get('x-admin-email')

  if (!adminId || !username || !email) {
    return null
  }

  return {
    id: adminId,
    username,
    email
  }
}