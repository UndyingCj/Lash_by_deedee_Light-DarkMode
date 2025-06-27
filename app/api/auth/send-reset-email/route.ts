import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { sendPasswordResetEmail } from "@/lib/email"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 })
    }

    // Check if admin exists
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from("admin_auth")
      .select("id, email, name")
      .eq("email", email)
      .single()

    if (adminError || !adminData) {
      return NextResponse.json({ success: true, message: "If an account exists, a reset link has been sent" })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000).toISOString()

    // Store reset token
    const { error: updateError } = await supabaseAdmin
      .from("admin_auth")
      .update({
        reset_token: resetToken,
        reset_expires: resetExpires,
      })
      .eq("email", email)

    if (updateError) {
      console.error("Error storing reset token:", updateError)
      return NextResponse.json({ success: false, error: "Failed to generate reset link" }, { status: 500 })
    }

    // Send reset email
    try {
      const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/egusi/reset-password?token=${resetToken}`
      await sendPasswordResetEmail(email, resetUrl, adminData.name || "Admin")
      return NextResponse.json({ success: true, message: "Password reset link sent successfully" })
    } catch (emailError) {
      console.error("Error sending reset email:", emailError)
      return NextResponse.json({ success: false, error: "Failed to send reset email" }, { status: 500 })
    }
  } catch (error) {
    console.error("Send reset email error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
