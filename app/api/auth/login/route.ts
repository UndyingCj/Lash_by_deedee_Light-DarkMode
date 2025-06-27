import { type NextRequest, NextResponse } from "next/server"
import { authenticateAdmin } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    console.log("Login attempt for email:", email)

    const result = await authenticateAdmin(email, password)

    if (!result.success) {
      console.log("Login failed:", result.message)
      return NextResponse.json({ error: result.message }, { status: 401 })
    }

    if (result.requiresTwoFactor) {
      console.log("2FA required for user:", email)
      return NextResponse.json({
        success: true,
        requiresTwoFactor: true,
        userId: result.user?.id,
        message: result.message,
      })
    }

    console.log("Login successful for user:", email)

    // Set session cookie
    const response = NextResponse.json({
      success: true,
      user: result.user,
      message: "Login successful",
    })

    if (result.sessionToken) {
      response.cookies.set("admin_session", result.sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60, // 24 hours
        path: "/",
      })
    }

    return response
  } catch (error) {
    console.error("Login API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
