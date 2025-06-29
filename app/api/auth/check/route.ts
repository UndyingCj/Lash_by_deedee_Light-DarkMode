import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get session token from cookie
    const sessionToken = request.cookies.get("admin_session")?.value

    if (!sessionToken) {
      return NextResponse.json({ error: "No session token" }, { status: 401 })
    }

    // Validate session
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

    // Update last activity
    await supabase
      .from("admin_sessions")
      .update({ last_activity: new Date().toISOString() })
      .eq("session_token", sessionToken)

    return NextResponse.json({
      success: true,
      user: session.admin_users,
    })
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
