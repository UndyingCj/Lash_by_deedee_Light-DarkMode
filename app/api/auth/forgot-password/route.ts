import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { sendPasswordResetEmail } from "@/lib/email"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    console.log("🔑 Password reset request for:", email)

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Get user from database
    const { data: user, error: userError } = await supabaseAdmin
      .from("admin_users")
      .select("*")
      .eq("email", email.toLowerCase())
      .single()

    // Always return success to prevent email enumeration
    if (userError || !user) {
      console.log("❌ User not found for password reset:", email)
      return NextResponse.json({
        success: true,
        message: "If an account with that email exists, a reset link has been sent.",
      })
    }

    // Check rate limiting (max 3 reset requests per hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const { count } = await supabaseAdmin
      .from("password_reset_tokens")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", oneHourAgo.toISOString())

    if (count && count >= 3) {
      console.log("🚫 Rate limit exceeded for password reset:", email)
      return NextResponse.json({
        success: true,
        message: "If an account with that email exists, a reset link has been sent.",
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

    // Send reset email
    try {
      const resetUrl = `https://lashedbydeedee.com/egusi/reset-password?token=${resetToken}`
      await sendPasswordResetEmail(user.email, resetUrl)
      console.log("✅ Password reset email sent to:", email)

      return NextResponse.json({
        success: true,
        message: "If an account with that email exists, a reset link has been sent.",
      })
    } catch (emailError) {
      console.error("❌ Failed to send password reset email:", emailError)
      return NextResponse.json({ error: "Failed to send reset email" }, { status: 500 })
    }
  } catch (error) {
    console.error("❌ Password reset error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
