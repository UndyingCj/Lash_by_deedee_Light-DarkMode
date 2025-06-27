import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("admin_session")?.value

    if (sessionToken) {
      // Delete session from database
      await supabaseAdmin.from("admin_sessions").delete().eq("session_token", sessionToken)
    }

    // Clear session cookie
    const response = NextResponse.json({ success: true, message: "Logged out successfully" })
    response.cookies.delete("admin_session")

    return response
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 })
  }
}
