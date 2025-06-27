import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("admin_session")?.value

    if (sessionToken) {
      // Delete session from database
      await supabaseAdmin.from("admin_sessions").delete().eq("session_token", sessionToken)
      console.log("✅ Session deleted:", sessionToken.substring(0, 8) + "...")
    }

    // Clear session cookie
    const response = NextResponse.json({ success: true, message: "Logged out successfully" })

    response.cookies.set("admin_session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    })

    return response
  } catch (error) {
    console.error("❌ Logout error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
