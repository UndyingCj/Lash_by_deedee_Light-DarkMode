import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    // Check if we have the required environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.log("⚠️ Supabase credentials not available, returning empty data")
      return NextResponse.json({
        blockedDates: [],
        bookedSlots: [],
        settings: {
          businessHoursStart: "09:00",
          businessHoursEnd: "18:00",
          bookingAdvanceDays: 30,
        },
      })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get blocked dates
    const { data: blockedDates, error: blockedError } = await supabase
      .from("blocked_dates")
      .select("date, reason")
      .order("date")

    if (blockedError) {
      console.error("Error fetching blocked dates:", blockedError)
    }

    // Get booked slots
    const { data: bookedSlots, error: bookedError } = await supabase
      .from("bookings")
      .select("appointment_date, appointment_time")
      .eq("status", "confirmed")
      .order("appointment_date")

    if (bookedError) {
      console.error("Error fetching booked slots:", bookedError)
    }

    // Get settings
    const { data: settings, error: settingsError } = await supabase.from("settings").select("key, value")

    if (settingsError) {
      console.error("Error fetching settings:", settingsError)
    }

    // Convert settings array to object
    const settingsObj =
      settings?.reduce((acc, setting) => {
        acc[setting.key] = setting.value
        return acc
      }, {}) || {}

    return NextResponse.json({
      blockedDates: blockedDates || [],
      bookedSlots: bookedSlots || [],
      settings: {
        businessHoursStart: settingsObj.business_hours_start || "09:00",
        businessHoursEnd: settingsObj.business_hours_end || "18:00",
        bookingAdvanceDays: Number.parseInt(settingsObj.booking_advance_days) || 30,
      },
    })
  } catch (error) {
    console.error("Availability API error:", error)

    // Return empty data instead of error to prevent 500 errors
    return NextResponse.json({
      blockedDates: [],
      bookedSlots: [],
      settings: {
        businessHoursStart: "09:00",
        businessHoursEnd: "18:00",
        bookingAdvanceDays: 30,
      },
    })
  }
}

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    const { date, reason } = await request.json()

    const { data, error } = await supabase.from("blocked_dates").insert({ date, reason }).select().single()

    if (error) {
      console.error("Error blocking date:", error)
      return NextResponse.json({ error: "Failed to block date" }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Block date API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
