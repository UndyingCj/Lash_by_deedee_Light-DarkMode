import { type NextRequest, NextResponse } from "next/server"
import { generatePasswordResetToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const result = await generatePasswordResetToken(email)

    return NextResponse.json({
      success: result.success,
      message: result.message,
    })
  } catch (error) {
    console.error("Forgot password API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
