import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    console.log("🔑 Password reset request for:", email)

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Check if user exists
    const { data: user, error: userError } = await supabaseAdmin
      .from("admin_users")
      .select("*")
      .eq("email", email.toLowerCase())
      .eq("is_active", true)
      .single()

    if (userError || !user) {
      console.log("❌ User not found:", email)
      // Don't reveal if email exists for security
      return NextResponse.json({
        success: true,
        message: "If the email exists, a reset link has been sent.",
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Store reset token
    const { error: tokenError } = await supabaseAdmin.from("password_reset_tokens").insert({
      user_id: user.id,
      token: resetToken,
      expires_at: expiresAt.toISOString(),
    })

    if (tokenError) {
      console.error("❌ Failed to store reset token:", tokenError)
      return NextResponse.json({ error: "Failed to generate reset token" }, { status: 500 })
    }

    // Send reset email
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/send-reset-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          token: resetToken,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send reset email")
      }

      console.log("✅ Reset email sent successfully")
    } catch (emailError) {
      console.error("❌ Failed to send reset email:", emailError)
      return NextResponse.json({ error: "Failed to send reset email" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "If the email exists, a reset link has been sent.",
    })
  } catch (error) {
    console.error("❌ Forgot password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
