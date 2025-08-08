import { NextRequest, NextResponse } from "next/server"
import { verify } from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || 'development-secret-key-minimum-32-chars-long'

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('admin-token')?.value

    if (!token) {
      return NextResponse.json(
        { success: false, message: "No token provided" },
        { status: 401 }
      )
    }

    // Verify JWT token
    const decoded = verify(token, JWT_SECRET) as any

    return NextResponse.json({
      success: true,
      user: {
        username: decoded.username,
        role: decoded.role
      }
    })

  } catch (error) {
    console.error("❌ Token verification failed:", error)
    return NextResponse.json(
      { success: false, message: "Invalid token" },
      { status: 401 }
    )
  }
}