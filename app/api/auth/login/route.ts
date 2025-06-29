import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    console.log("🔐 Login attempt for:", email)

    // Check if we have the required environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error("❌ Missing Supabase credentials")
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get user from database
    const { data: user, error: userError } = await supabase
      .from("admin_users")
      .select("*")
      .eq("email", email.toLowerCase())
      .single()

    if (userError || !user) {
      console.log("❌ User not found:", email, userError?.message)
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    console.log("✅ User found:", user.email)

    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      const lockTime = Math.ceil((new Date(user.locked_until).getTime() - Date.now()) / (1000 * 60))
      return NextResponse.json({ error: `Account locked. Try again in ${lockTime} minutes.` }, { status: 423 })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash)

    if (!isValidPassword) {
      console.log("❌ Invalid password for:", email)

      // Increment failed attempts
      const failedAttempts = (user.failed_attempts || 0) + 1
      const lockUntil = failedAttempts >= 5 ? new Date(Date.now() + 30 * 60 * 1000) : null

      await supabase
        .from("admin_users")
        .update({
          failed_attempts: failedAttempts,
          locked_until: lockUntil?.toISOString(),
          last_failed_login: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (lockUntil) {
        return NextResponse.json({ error: "Too many failed attempts. Account locked for 30 minutes." }, { status: 423 })
      }

      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    console.log("✅ Password verified successfully")

    // Reset failed attempts on successful password verification
    await supabase
      .from("admin_users")
      .update({
        failed_attempts: 0,
        locked_until: null,
        last_login: new Date().toISOString(),
      })
      .eq("id", user.id)

    // Create session token
    const sessionToken = require("crypto").randomBytes(32).toString("hex")
    const sessionExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    const { error: sessionError } = await supabase.from("admin_sessions").insert({
      user_id: user.id,
      session_token: sessionToken,
      expires_at: sessionExpiry.toISOString(),
      ip_address: request.headers.get("x-forwarded-for") || "unknown",
      user_agent: request.headers.get("user-agent") || "unknown",
    })

    if (sessionError) {
      console.error("❌ Failed to create session:", sessionError)
      return NextResponse.json({ error: "Failed to create session" }, { status: 500 })
    }

    console.log("✅ Login successful for:", email)

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    })

    // Set secure session cookie
    response.cookies.set("admin_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
      path: "/",
    })

    return response
  } catch (error) {
    console.error("❌ Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
