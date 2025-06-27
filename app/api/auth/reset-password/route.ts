import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { supabaseAdmin } from "@/lib/supabase-admin"

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

    console.log("🔐 Password reset attempt with token:", token.substring(0, 10) + "...")

    // Find user with valid reset token
    const { data: user, error: userError } = await supabaseAdmin
      .from("admin_users")
      .select("*")
      .eq("reset_token", token)
      .single()

    if (userError || !user) {
      console.log("❌ Invalid reset token:", token.substring(0, 10) + "...")
      return NextResponse.json({ success: false, message: "Invalid or expired reset token" }, { status: 401 })
    }

    // Check if token is expired
    if (!user.reset_token_expires || new Date(user.reset_token_expires) < new Date()) {
      console.log("❌ Expired reset token for:", user.email)
      return NextResponse.json({ success: false, message: "Reset token has expired" }, { status: 401 })
    }

    // Hash new password
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Update password and clear reset token
    const { error: updateError } = await supabaseAdmin
      .from("admin_users")
      .update({
        password_hash: passwordHash,
        reset_token: null,
        reset_token_expires: null,
        failed_attempts: 0,
        locked_until: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (updateError) {
      console.error("❌ Failed to update password:", updateError)
      return NextResponse.json({ success: false, message: "Failed to update password" }, { status: 500 })
    }

    // Clear all existing sessions for security
    await supabaseAdmin.from("admin_sessions").delete().eq("user_id", user.id)

    console.log("✅ Password reset successful for:", user.email)

    return NextResponse.json({
      success: true,
      message: "Password has been reset successfully. You can now log in with your new password.",
    })
  } catch (error) {
    console.error("❌ Password reset error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
