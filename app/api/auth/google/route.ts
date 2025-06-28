import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: "Google token is required" }, { status: 400 })
    }

    // Verify Google token
    const googleTokenResponse = await fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token}`)
    const googleUser = await googleTokenResponse.json()

    if (!googleTokenResponse.ok || !googleUser.email) {
      return NextResponse.json({ error: "Invalid Google token" }, { status: 401 })
    }

    // Check if this is an authorized admin email
    const authorizedEmails = ["lashedbydeedeee@gmail.com", "deedee@lashedbydeedee.com"]

    if (!authorizedEmails.includes(googleUser.email.toLowerCase())) {
      return NextResponse.json({ error: "Unauthorized email address" }, { status: 403 })
    }

    // Check if user exists in admin_users table
    let { data: user, error: userError } = await supabase
      .from("admin_users")
      .select("*")
      .eq("email", googleUser.email.toLowerCase())
      .single()

    // If user doesn't exist, create them
    if (userError || !user) {
      const { data: newUser, error: createError } = await supabase
        .from("admin_users")
        .insert({
          email: googleUser.email.toLowerCase(),
          name: googleUser.name || "Admin User",
          username: googleUser.email.split("@")[0],
          password_hash: "", // No password needed for Google auth
          is_active: true,
          two_factor_enabled: false,
          auth_provider: "google",
          google_id: googleUser.user_id,
        })
        .select()
        .single()

      if (createError) {
        console.error("Error creating Google user:", createError)
        return NextResponse.json({ error: "Failed to create user account" }, { status: 500 })
      }

      user = newUser
    }

    // Create session token
    const sessionToken = require("crypto").randomBytes(32).toString("hex")
    const sessionExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    await supabase.from("admin_sessions").insert({
      user_id: user.id,
      session_token: sessionToken,
      expires_at: sessionExpiry.toISOString(),
      ip_address: request.headers.get("x-forwarded-for") || "unknown",
      user_agent: request.headers.get("user-agent") || "unknown",
    })

    // Update last login
    await supabase.from("admin_users").update({ last_login: new Date().toISOString() }).eq("id", user.id)

    console.log("✅ Google login successful for:", googleUser.email)

    const jsonResponse = NextResponse.json({
      success: true,
      message: "Google login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    })

    // Set secure session cookie
    jsonResponse.cookies.set("admin_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
      path: "/",
    })

    return jsonResponse
  } catch (error) {
    console.error("❌ Google login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
