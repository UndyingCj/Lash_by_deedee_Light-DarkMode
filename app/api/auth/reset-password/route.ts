import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    console.log("🔑 Password reset attempt with token:", token?.substring(0, 8) + "...")

    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 })
    }

    // Find valid reset token
    const { data: resetToken, error: tokenError } = await supabaseAdmin
      .from("password_reset_tokens")
      .select("*")
      .eq("token", token)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .single()

    if (tokenError || !resetToken) {
      console.log("❌ Invalid or expired reset token")
      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 })
    }

    // Get user
    const { data: user, error: userError } = await supabaseAdmin
      .from("admin_users")
      .select("*")
      .eq("id", resetToken.user_id)
      .single()

    if (userError || !user) {
      console.log("❌ User not found for reset token")
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 12)

    // Update user password
    const { error: updateError } = await supabaseAdmin
      .from("admin_users")
      .update({
        password_hash: passwordHash,
        password_changed_at: new Date().toISOString(),
        failed_login_attempts: 0,
        locked_until: null,
      })
      .eq("id", user.id)

    if (updateError) {
      console.error("❌ Failed to update password:", updateError)
      return NextResponse.json({ error: "Failed to update password" }, { status: 500 })
    }

    // Mark token as used
    await supabaseAdmin
      .from("password_reset_tokens")
      .update({
        used: true,
        used_at: new Date().toISOString(),
      })
      .eq("id", resetToken.id)

    // Invalidate all existing sessions for this user
    await supabaseAdmin.from("admin_sessions").delete().eq("user_id", user.id)

    console.log("✅ Password reset successful for:", user.email)

    return NextResponse.json({
      success: true,
      message: "Password reset successful",
    })
  } catch (error) {
    console.error("❌ Password reset error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
