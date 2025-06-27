import { type NextRequest, NextResponse } from "next/server"
import { logout } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("admin-session")?.value

    if (sessionToken) {
      await logout(sessionToken)
    }

    const response = NextResponse.json({ success: true })
    response.cookies.delete("admin-session")

    return response
  } catch (error) {
    console.error("Logout API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
