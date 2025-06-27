import { type NextRequest, NextResponse } from "next/server"
import { authenticateAdmin } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    const result = await authenticateAdmin(username, password)

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 401 })
    }

    const response = NextResponse.json({
      success: true,
      requiresTwoFactor: result.requiresTwoFactor,
      user: result.user,
      message: result.message,
    })

    // Set session cookie if login is complete (no 2FA required)
    if (result.sessionToken) {
      response.cookies.set("admin-session", result.sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60, // 24 hours
      })
    }

    return response
  } catch (error) {
    console.error("Login API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
