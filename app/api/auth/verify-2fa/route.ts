import { type NextRequest, NextResponse } from "next/server"
import { verifyTwoFactorCode } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { userId, code } = await request.json()

    if (!userId || !code) {
      return NextResponse.json({ error: "Missing userId or code" }, { status: 400 })
    }

    const result = await verifyTwoFactorCode(userId, code)

    if (!result.success) {
      return NextResponse.json({ error: result.message || "Verification failed" }, { status: 400 })
    }

    // Set session cookie
    const response = NextResponse.json({
      success: true,
      message: "Verification successful",
    })

    if (result.sessionToken) {
      response.cookies.set("admin_session", result.sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60, // 24 hours
      })
    }

    return response
  } catch (error) {
    console.error("2FA verification error:", error)
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }
}
