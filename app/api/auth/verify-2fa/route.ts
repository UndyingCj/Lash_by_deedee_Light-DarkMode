import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json({ success: false, error: "Email and code are required" }, { status: 400 })
    }

    // Get the stored 2FA code from database
    const { data: authData, error: authError } = await supabaseAdmin
      .from("admin_auth")
      .select("two_factor_code, two_factor_expires")
      .eq("email", email)
      .single()

    if (authError || !authData) {
      console.error("Error fetching 2FA data:", authError)
      return NextResponse.json({ success: false, error: "Invalid verification attempt" }, { status: 400 })
    }

    // Check if code has expired
    if (new Date() > new Date(authData.two_factor_expires)) {
      return NextResponse.json({ success: false, error: "Verification code has expired" }, { status: 400 })
    }

    // Verify the code
    const isValidCode = await bcrypt.compare(code, authData.two_factor_code)
    if (!isValidCode) {
      return NextResponse.json({ success: false, error: "Invalid verification code" }, { status: 400 })
    }

    // Clear the 2FA code after successful verification
    await supabaseAdmin
      .from("admin_auth")
      .update({
        two_factor_code: null,
        two_factor_expires: null,
        last_login: new Date().toISOString(),
      })
      .eq("email", email)

    return NextResponse.json({ success: true, message: "2FA verification successful" })
  } catch (error) {
    console.error("2FA verification error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
