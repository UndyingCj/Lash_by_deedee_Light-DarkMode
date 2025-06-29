import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: NextRequest) {
  try {
    // Check if we have the required environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.log("⚠️ Supabase credentials not available, returning empty data")
      return NextResponse.json({
        blockedDates: [],
        blockedTimeSlots: [],
        businessHours: {
          monday: { start: "09:00", end: "17:00", enabled: true },
          tuesday: { start: "09:00", end: "17:00", enabled: true },
          wednesday: { start: "09:00", end: "17:00", enabled: true },
          thursday: { start: "09:00", end: "17:00", enabled: true },
          friday: { start: "09:00", end: "17:00", enabled: true },
          saturday: { start: "10:00", end: "16:00", enabled: true },
          sunday: { start: "10:00", end: "16:00", enabled: false },
        },
      })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get blocked dates
    const { data: blockedDates, error: datesError } = await supabase
      .from("blocked_dates")
      .select("*")
      .order("date", { ascending: true })

    // Get blocked time slots
    const { data: blockedTimeSlots, error: slotsError } = await supabase
      .from("blocked_time_slots")
      .select("*")
      .order("date", { ascending: true })

    // Get business hours
    const { data: businessHours, error: hoursError } = await supabase
      .from("business_hours")
      .select("*")
      .limit(1)
      .single()

    // If any query fails, return empty data instead of error
    if (datesError || slotsError || hoursError) {
      console.log("⚠️ Some queries failed, returning default data")
      return NextResponse.json({
        blockedDates: [],
        blockedTimeSlots: [],
        businessHours: {
          monday: { start: "09:00", end: "17:00", enabled: true },
          tuesday: { start: "09:00", end: "17:00", enabled: true },
          wednesday: { start: "09:00", end: "17:00", enabled: true },
          thursday: { start: "09:00", end: "17:00", enabled: true },
          friday: { start: "09:00", end: "17:00", enabled: true },
          saturday: { start: "10:00", end: "16:00", enabled: true },
          sunday: { start: "10:00", end: "16:00", enabled: false },
        },
      })
    }

    // Format business hours
    const formattedBusinessHours = businessHours
      ? {
          monday: {
            start: businessHours.monday_start || "09:00",
            end: businessHours.monday_end || "17:00",
            enabled: businessHours.monday_enabled ?? true,
          },
          tuesday: {
            start: businessHours.tuesday_start || "09:00",
            end: businessHours.tuesday_end || "17:00",
            enabled: businessHours.tuesday_enabled ?? true,
          },
          wednesday: {
            start: businessHours.wednesday_start || "09:00",
            end: businessHours.wednesday_end || "17:00",
            enabled: businessHours.wednesday_enabled ?? true,
          },
          thursday: {
            start: businessHours.thursday_start || "09:00",
            end: businessHours.thursday_end || "17:00",
            enabled: businessHours.thursday_enabled ?? true,
          },
          friday: {
            start: businessHours.friday_start || "09:00",
            end: businessHours.friday_end || "17:00",
            enabled: businessHours.friday_enabled ?? true,
          },
          saturday: {
            start: businessHours.saturday_start || "10:00",
            end: businessHours.saturday_end || "16:00",
            enabled: businessHours.saturday_enabled ?? true,
          },
          sunday: {
            start: businessHours.sunday_start || "10:00",
            end: businessHours.sunday_end || "16:00",
            enabled: businessHours.sunday_enabled ?? false,
          },
        }
      : {
          monday: { start: "09:00", end: "17:00", enabled: true },
          tuesday: { start: "09:00", end: "17:00", enabled: true },
          wednesday: { start: "09:00", end: "17:00", enabled: true },
          thursday: { start: "09:00", end: "17:00", enabled: true },
          friday: { start: "09:00", end: "17:00", enabled: true },
          saturday: { start: "10:00", end: "16:00", enabled: true },
          sunday: { start: "10:00", end: "16:00", enabled: false },
        }

    return NextResponse.json({
      blockedDates: blockedDates || [],
      blockedTimeSlots: blockedTimeSlots || [],
      businessHours: formattedBusinessHours,
    })
  } catch (error) {
    console.error("❌ Availability API error:", error)
    // Return empty data instead of error to prevent 500
    return NextResponse.json({
      blockedDates: [],
      blockedTimeSlots: [],
      businessHours: {
        monday: { start: "09:00", end: "17:00", enabled: true },
        tuesday: { start: "09:00", end: "17:00", enabled: true },
        wednesday: { start: "09:00", end: "17:00", enabled: true },
        thursday: { start: "09:00", end: "17:00", enabled: true },
        friday: { start: "09:00", end: "17:00", enabled: true },
        saturday: { start: "10:00", end: "16:00", enabled: true },
        sunday: { start: "10:00", end: "16:00", enabled: false },
      },
    })
  }
}
