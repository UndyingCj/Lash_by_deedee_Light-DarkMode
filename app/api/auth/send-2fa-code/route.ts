import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { sendTwoFactorCode } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    console.log("📱 Resending 2FA code for user:", userId)

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Get user details
    const { data: user, error: userError } = await supabaseAdmin
      .from("admin_users")
      .select("*")
      .eq("id", userId)
      .single()

    if (userError || !user) {
      console.log("❌ User not found:", userId)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check rate limiting (max 3 codes per 15 minutes)
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000)
    const { count } = await supabaseAdmin
      .from("two_factor_codes")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", fifteenMinutesAgo.toISOString())

    if (count && count >= 3) {
      console.log("🚫 Rate limit exceeded for user:", userId)
      return NextResponse.json({ error: "Too many requests. Please wait 15 minutes." }, { status: 429 })
    }

    // Generate new 2FA code
    const twoFactorCode = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Store 2FA code
    await supabaseAdmin.from("two_factor_codes").insert({
      user_id: user.id,
      code: twoFactorCode,
      expires_at: expiresAt.toISOString(),
    })

    // Send 2FA code via email
    try {
      await sendTwoFactorCode(user.email, twoFactorCode)
      console.log("✅ 2FA code resent to:", user.email)

      return NextResponse.json({
        success: true,
        message: "Verification code sent to your email",
      })
    } catch (emailError) {
      console.error("❌ Failed to send 2FA code:", emailError)
      return NextResponse.json({ error: "Failed to send verification code" }, { status: 500 })
    }
  } catch (error) {
    console.error("❌ Send 2FA code error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
