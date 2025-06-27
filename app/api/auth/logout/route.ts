import { type NextRequest, NextResponse } from "next/server"
import { logout } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("admin-session")?.value

    if (sessionToken) {
      await logout(sessionToken)
    }

    const response = NextResponse.json({ success: true })

    // Clear the session cookie
    response.cookies.set("admin-session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
    })

    return response
  } catch (error) {
    console.error("Logout API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
