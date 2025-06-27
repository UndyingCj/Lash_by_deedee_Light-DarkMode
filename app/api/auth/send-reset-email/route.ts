import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { sendPasswordResetEmail } from "@/lib/email"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Get user from database
    const { data: user, error: userError } = await supabaseAdmin
      .from("admin_users")
      .select("*")
      .eq("email", email)
      .single()

    if (userError || !user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json({ success: true, message: "Reset email sent if account exists" })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Save token to database
    await supabaseAdmin
      .from("admin_users")
      .update({
        reset_token: resetToken,
        reset_expires: expiresAt.toISOString(),
      })
      .eq("id", user.id)

    // Send reset email
    const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/egusi/reset-password?token=${resetToken}`
    await sendPasswordResetEmail(email, resetUrl, user.name)

    return NextResponse.json({ success: true, message: "Reset email sent if account exists" })
  } catch (error) {
    console.error("Send reset email error:", error)
    return NextResponse.json({ error: "Failed to send reset email" }, { status: 500 })
  }
}
