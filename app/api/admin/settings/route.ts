import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET() {
  try {
    // Get business settings
    const { data: businessSettings, error: businessError } = await supabaseAdmin
      .from("business_settings")
      .select("*")
      .single()

    // Get notification settings
    const { data: notificationSettings, error: notificationError } = await supabaseAdmin
      .from("notification_settings")
      .select("*")
      .single()

    // Get payment settings
    const { data: paymentSettings, error: paymentError } = await supabaseAdmin
      .from("payment_settings")
      .select("*")
      .single()

    // If no settings exist, create default ones
    if (businessError || !businessSettings) {
      const { data: newBusinessSettings } = await supabaseAdmin
        .from("business_settings")
        .insert({
          businessName: "Lashed by Deedee",
          businessEmail: "lashedbydeedeee@gmail.com",
          businessPhone: "+234 123 456 7890",
          businessAddress: "Lagos, Nigeria",
        })
        .select()
        .single()
    }

    if (notificationError || !notificationSettings) {
      await supabaseAdmin.from("notification_settings").insert({}).select().single()
    }

    if (paymentError || !paymentSettings) {
      await supabaseAdmin
        .from("payment_settings")
        .insert({
          paystackPublicKey: "pk_live_edddbd4959b95ee7d1eebe12b71b68f8ce5ff0a7",
          paystackSecretKey: "sk_live_f3437bf92100d5b73c6aa72e78d7db300d9029bb",
        })
        .select()
        .single()
    }

    // Fetch again after creating defaults
    const { data: finalBusinessSettings } = await supabaseAdmin.from("business_settings").select("*").single()
    const { data: finalNotificationSettings } = await supabaseAdmin.from("notification_settings").select("*").single()
    const { data: finalPaymentSettings } = await supabaseAdmin.from("payment_settings").select("*").single()

    return NextResponse.json({
      success: true,
      data: {
        business: finalBusinessSettings,
        notifications: finalNotificationSettings,
        payments: finalPaymentSettings,
      },
    })
  } catch (error) {
    console.error("Settings fetch error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { type, data } = await request.json()

    let result
    switch (type) {
      case "business":
        result = await supabaseAdmin.from("business_settings").update(data).eq("id", data.id).select().single()
        break
      case "notifications":
        result = await supabaseAdmin.from("notification_settings").update(data).eq("id", data.id).select().single()
        break
      case "payments":
        result = await supabaseAdmin.from("payment_settings").update(data).eq("id", data.id).select().single()
        break
      default:
        return NextResponse.json({ success: false, error: "Invalid settings type" }, { status: 400 })
    }

    if (result.error) {
      console.error("Settings update error:", result.error)
      return NextResponse.json({ success: false, error: "Failed to update settings" }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: result.data })
  } catch (error) {
    console.error("Settings update error:", error)
    return NextResponse.json({ success: false, error: "Failed to update settings" }, { status: 500 })
  }
}
