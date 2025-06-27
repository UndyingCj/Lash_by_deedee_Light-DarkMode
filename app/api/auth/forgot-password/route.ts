import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { sendPasswordResetEmail } from "@/lib/email"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 })
    }

    console.log("🔐 Password reset request for:", email)

    // Check if user exists
    const { data: user, error: userError } = await supabaseAdmin
      .from("admin_users")
      .select("*")
      .eq("email", email.toLowerCase())
      .single()

    // Always return success to prevent email enumeration
    if (userError || !user) {
      console.log("❌ User not found:", email)
      return NextResponse.json({
        success: true,
        message: "If the email exists, a reset link has been sent.",
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex")
    const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Save reset token
    const { error: tokenError } = await supabaseAdmin.from("password_reset_tokens").insert({
      user_id: user.id,
      token: resetToken,
      expires_at: tokenExpiry.toISOString(),
    })

    if (tokenError) {
      console.error("❌ Error saving reset token:", tokenError)
      return NextResponse.json({ success: false, message: "Failed to generate reset token" }, { status: 500 })
    }

    // Send reset email
    try {
      await sendPasswordResetEmail(user.email, resetToken)
      console.log("✅ Password reset email sent to:", user.email)
    } catch (emailError) {
      console.error("❌ Error sending reset email:", emailError)
      return NextResponse.json({ success: false, message: "Failed to send reset email" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "If the email exists, a reset link has been sent.",
    })
  } catch (error) {
    console.error("❌ Password reset error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
