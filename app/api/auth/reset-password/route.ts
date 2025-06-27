import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    console.log("🔑 Password reset attempt with token")

    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 })
    }

    // Validate reset token
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

    console.log("✅ Valid reset token found")

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
      .eq("id", resetToken.user_id)

    if (updateError) {
      console.error("❌ Failed to update password:", updateError)
      return NextResponse.json({ error: "Failed to reset password" }, { status: 500 })
    }

    // Mark token as used
    await supabaseAdmin
      .from("password_reset_tokens")
      .update({ used: true, used_at: new Date().toISOString() })
      .eq("id", resetToken.id)

    // Invalidate all existing sessions for this user
    await supabaseAdmin.from("admin_sessions").delete().eq("user_id", resetToken.user_id)

    console.log("✅ Password reset successfully")

    return NextResponse.json({
      success: true,
      message: "Password reset successfully",
    })
  } catch (error) {
    console.error("❌ Reset password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
