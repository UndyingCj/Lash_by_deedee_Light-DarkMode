import { type NextRequest, NextResponse } from "next/server"
import { generatePasswordResetToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    console.log("Password reset requested for email:", email)

    const result = await generatePasswordResetToken(email)

    if (!result.success) {
      console.log("Password reset failed:", result.message)
      return NextResponse.json({ error: result.message }, { status: 400 })
    }

    console.log("Password reset token generated successfully")

    return NextResponse.json({
      success: true,
      message: result.message,
    })
  } catch (error) {
    console.error("Forgot password API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
