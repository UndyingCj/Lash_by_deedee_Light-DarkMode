import { type NextRequest, NextResponse } from "next/server"
import { resetPasswordWithToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 })
    }

    const result = await resetPasswordWithToken(token, password)

    return NextResponse.json({
      success: result.success,
      message: result.message,
    })
  } catch (error) {
    console.error("Reset password API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
