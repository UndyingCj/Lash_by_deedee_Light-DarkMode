import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { sendPasswordResetEmail } from "@/lib/email"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    console.log("📧 Sending reset email to:", email)

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Get user from database
    const { data: user, error: userError } = await supabaseAdmin
      .from("admin_users")
      .select("*")
      .eq("email", email.toLowerCase())
      .single()

    if (userError || !user) {
      console.log("❌ User not found:", email)
      // Return success to prevent email enumeration
      return NextResponse.json({
        success: true,
        message: "Reset email sent if account exists",
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Store reset token
    await supabaseAdmin.from("password_reset_tokens").insert({
      user_id: user.id,
      token: resetToken,
      expires_at: expiresAt.toISOString(),
    })

    // Send reset email with production URL
    const resetUrl = `https://lashedbydeedee.com/egusi/reset-password?token=${resetToken}`
    await sendPasswordResetEmail(user.email, resetUrl)

    console.log("✅ Reset email sent to:", email)

    return NextResponse.json({
      success: true,
      message: "Reset email sent if account exists",
    })
  } catch (error) {
    console.error("❌ Send reset email error:", error)
    return NextResponse.json({ error: "Failed to send reset email" }, { status: 500 })
  }
}
