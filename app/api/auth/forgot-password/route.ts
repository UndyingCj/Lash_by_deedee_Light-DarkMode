import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { generateSecureToken } from "@/lib/auth"
import { sendPasswordResetEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 })
    }

    console.log("🔐 Password reset request for:", email)

    // Get user from database
    const { data: user, error: userError } = await supabaseAdmin
      .from("admin_users")
      .select("*")
      .eq("email", email.toLowerCase())
      .single()

    if (userError || !user) {
      console.log("❌ User not found:", email)
      // Don't reveal if user exists or not for security
      return NextResponse.json({
        success: true,
        message: "If an account with that email exists, a reset link has been sent.",
      })
    }

    // Generate reset token
    const resetToken = generateSecureToken()
    const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await supabaseAdmin
      .from("admin_users")
      .update({
        reset_token: resetToken,
        reset_token_expires: tokenExpiry.toISOString(),
      })
      .eq("id", user.id)

    // Send reset email
    try {
      await sendPasswordResetEmail(user.email, resetToken)
      console.log("✅ Password reset email sent to:", user.email)
    } catch (emailError) {
      console.error("❌ Failed to send reset email:", emailError)
      return NextResponse.json(
        { success: false, message: "Failed to send reset email. Please try again." },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "If an account with that email exists, a reset link has been sent.",
    })
  } catch (error) {
    console.error("❌ Password reset request error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
