import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({ success: false, error: "Token and password are required" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters long" },
        { status: 400 },
      )
    }

    // Find admin with valid reset token
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from("admin_auth")
      .select("id, email, reset_expires")
      .eq("reset_token", token)
      .single()

    if (adminError || !adminData) {
      return NextResponse.json({ success: false, error: "Invalid or expired reset token" }, { status: 400 })
    }

    // Check if token has expired
    if (new Date() > new Date(adminData.reset_expires)) {
      return NextResponse.json({ success: false, error: "Reset token has expired" }, { status: 400 })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Update password and clear reset token
    const { error: updateError } = await supabaseAdmin
      .from("admin_auth")
      .update({
        password: hashedPassword,
        reset_token: null,
        reset_expires: null,
        updated_at: new Date().toISOString(),
      })
      .eq("reset_token", token)

    if (updateError) {
      console.error("Error updating password:", updateError)
      return NextResponse.json({ success: false, error: "Failed to reset password" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Password reset successfully" })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
