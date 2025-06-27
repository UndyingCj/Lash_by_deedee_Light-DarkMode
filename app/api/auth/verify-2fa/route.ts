import { type NextRequest, NextResponse } from "next/server"
import { verifyTwoFactorCode } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { userId, code } = await request.json()

    if (!userId || !code) {
      return NextResponse.json({ error: "User ID and code are required" }, { status: 400 })
    }

    console.log("2FA verification attempt for user:", userId)

    const result = await verifyTwoFactorCode(userId, code)

    if (!result.success) {
      console.log("2FA verification failed:", result.message)
      return NextResponse.json({ error: result.message }, { status: 401 })
    }

    console.log("2FA verification successful for user:", userId)

    // Set session cookie
    const response = NextResponse.json({
      success: true,
      message: "2FA verification successful",
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
    console.error("2FA verification API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
