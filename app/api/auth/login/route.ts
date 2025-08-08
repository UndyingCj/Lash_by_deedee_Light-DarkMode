import { NextRequest, NextResponse } from "next/server"
import { sign } from "jsonwebtoken"
import * as crypto from "crypto"

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'development-password'
const JWT_SECRET = process.env.JWT_SECRET || 'development-secret-key-minimum-32-chars-long'

// Hash password for comparison (in production, use bcrypt)
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { username, password } = body

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "Username and password are required" },
        { status: 400 }
      )
    }

    // Check credentials
    const hashedInputPassword = hashPassword(password)
    const hashedAdminPassword = hashPassword(ADMIN_PASSWORD)

    if (username !== ADMIN_USERNAME || hashedInputPassword !== hashedAdminPassword) {
      // Add delay to prevent brute force attacks
      await new Promise(resolve => setTimeout(resolve, 1000))
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = sign(
      { 
        username: ADMIN_USERNAME,
        role: 'admin',
        iat: Math.floor(Date.now() / 1000),
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    // Create response with secure cookie
    const response = NextResponse.json({
      success: true,
      message: "Authentication successful",
      user: {
        username: ADMIN_USERNAME,
        role: 'admin'
      }
    })

    // Set HTTP-only cookie
    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/'
    })

    console.log("✅ Admin login successful:", username)
    return response

  } catch (error) {
    console.error("❌ Login error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}