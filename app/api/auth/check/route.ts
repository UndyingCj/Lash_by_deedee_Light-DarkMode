import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const sessionToken = cookieStore.get("admin_session")?.value

    if (!sessionToken) {
      return NextResponse.json({ error: "No session found" }, { status: 401 })
    }

    // Get session from database
    const { data: session, error: sessionError } = await supabase
      .from("admin_sessions")
      .select(`
        *,
        admin_users (
          id,
          email,
          name,
          is_active
        )
      `)
      .eq("session_token", sessionToken)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    // Check if session is expired
    if (new Date(session.expires_at) < new Date()) {
      // Delete expired session
      await supabase.from("admin_sessions").delete().eq("session_token", sessionToken)

      return NextResponse.json({ error: "Session expired" }, { status: 401 })
    }

    // Check if user is still active
    if (!session.admin_users?.is_active) {
      return NextResponse.json({ error: "User account is inactive" }, { status: 401 })
    }

    // Update last activity
    await supabase
      .from("admin_sessions")
      .update({ last_activity: new Date().toISOString() })
      .eq("session_token", sessionToken)

    return NextResponse.json({
      success: true,
      user: {
        id: session.admin_users.id,
        email: session.admin_users.email,
        name: session.admin_users.name,
      },
    })
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
