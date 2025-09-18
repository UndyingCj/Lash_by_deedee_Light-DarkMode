import { NextRequest, NextResponse } from 'next/server'
import { adminAuthMiddleware } from './lib/admin-middleware'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Handle admin routes
  if (pathname.startsWith('/egusi')) {
    return await adminAuthMiddleware(request)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/egusi/:path*'
  ]
}