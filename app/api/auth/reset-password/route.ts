import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { hashPassword } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({ success: false, message: "Token and password are required" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 8 characters long" },
        { status: 400 },
      )
    }

    console.log("🔐 Resetting password with token:", token.substring(0, 8) + "...")

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
      return NextResponse.json({ success: false, message: "Invalid or expired reset token" }, { status: 400 })
    }

    // Hash new password
    const passwordHash = await hashPassword(password)

    // Update user password
    const { error: updateError } = await supabaseAdmin
      .from("admin_users")
      .update({
        password_hash: passwordHash,
        password_changed_at: new Date().toISOString(),
        failed_attempts: 0,
        locked_until: null,
      })
      .eq("id", resetToken.user_id)

    if (updateError) {
      console.error("❌ Failed to update password:", updateError)
      return NextResponse.json({ success: false, message: "Failed to update password" }, { status: 500 })
    }

    // Mark token as used
    await supabaseAdmin
      .from("password_reset_tokens")
      .update({ used: true, used_at: new Date().toISOString() })
      .eq("id", resetToken.id)

    // Invalidate all existing sessions for this user
    await supabaseAdmin.from("admin_sessions").delete().eq("user_id", resetToken.user_id)

    console.log("✅ Password reset successfully for user:", resetToken.user_id)

    return NextResponse.json({
      success: true,
      message: "Password reset successfully",
    })
  } catch (error) {
    console.error("❌ Password reset error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
