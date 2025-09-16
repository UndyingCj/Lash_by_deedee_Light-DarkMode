import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")

    if (!date) {
      return NextResponse.json({ error: "Date parameter is required" }, { status: 400 })
    }

    console.log("🗓️ Checking availability for date:", date)

    // Check if the date is blocked
    const { data: blockedDates, error: blockedDatesError } = await supabase
      .from("blocked_dates")
      .select("*")
      .eq("blocked_date", date)

    if (blockedDatesError) {
      console.error("❌ Error checking blocked dates:", blockedDatesError)
      return NextResponse.json({ error: "Failed to check blocked dates" }, { status: 500 })
    }

    if (blockedDates && blockedDates.length > 0) {
      console.log("🚫 Date is completely blocked:", date)
      return NextResponse.json({
        available: false,
        reason: "Date is not available",
        blockedDate: blockedDates[0],
        availableSlots: []
      })
    }

    // Get blocked time slots for this date
    const { data: blockedTimeSlots, error: blockedTimeSlotsError } = await supabase
      .from("blocked_time_slots")
      .select("*")
      .eq("blocked_date", date)

    if (blockedTimeSlotsError) {
      console.error("❌ Error checking blocked time slots:", blockedTimeSlotsError)
      return NextResponse.json({ error: "Failed to check blocked time slots" }, { status: 500 })
    }

    // Get existing bookings for this date
    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("booking_time, status")
      .eq("booking_date", date)
      .neq("status", "cancelled")

    if (bookingsError) {
      console.error("❌ Error checking bookings:", bookingsError)
      return NextResponse.json({ error: "Failed to check bookings" }, { status: 500 })
    }

    // Define available time slots (9 AM to 6 PM)
    const allTimeSlots = [
      "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
      "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
      "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM", "6:00 PM"
    ]

    // Get blocked times
    const blockedTimes = new Set([
      ...(blockedTimeSlots?.map(slot => slot.blocked_time) || []),
      ...(bookings?.map(booking => booking.booking_time) || [])
    ])

    // Filter available slots
    const availableSlots = allTimeSlots.filter(slot => !blockedTimes.has(slot))

    console.log("✅ Availability check completed:", {
      date,
      totalSlots: allTimeSlots.length,
      blockedSlots: blockedTimes.size,
      availableSlots: availableSlots.length
    })

    return NextResponse.json({
      available: availableSlots.length > 0,
      date,
      availableSlots,
      blockedSlots: Array.from(blockedTimes),
      totalSlots: allTimeSlots.length
    })

  } catch (error) {
    console.error("❌ Availability check error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, date, time, reason } = body

    console.log("🔧 Availability management action:", { action, date, time, reason })

    if (action === "block_date") {
      if (!date) {
        return NextResponse.json({ error: "Date is required" }, { status: 400 })
      }

      const { data, error } = await supabase
        .from("blocked_dates")
        .upsert({
          blocked_date: date,
          reason: reason || "Blocked by admin",
          created_at: new Date().toISOString()
        }, {
          onConflict: "blocked_date"
        })
        .select()
        .single()

      if (error) {
        console.error("❌ Error blocking date:", error)
        return NextResponse.json({ error: "Failed to block date" }, { status: 500 })
      }

      console.log("✅ Date blocked successfully:", date)
      return NextResponse.json({ success: true, data })

    } else if (action === "unblock_date") {
      if (!date) {
        return NextResponse.json({ error: "Date is required" }, { status: 400 })
      }

      const { error } = await supabase
        .from("blocked_dates")
        .delete()
        .eq("blocked_date", date)

      if (error) {
        console.error("❌ Error unblocking date:", error)
        return NextResponse.json({ error: "Failed to unblock date" }, { status: 500 })
      }

      console.log("✅ Date unblocked successfully:", date)
      return NextResponse.json({ success: true })

    } else if (action === "block_time") {
      if (!date || !time) {
        return NextResponse.json({ error: "Date and time are required" }, { status: 400 })
      }

      const { data, error } = await supabase
        .from("blocked_time_slots")
        .upsert({
          blocked_date: date,
          blocked_time: time,
          reason: reason || "Blocked by admin",
          created_at: new Date().toISOString()
        }, {
          onConflict: "blocked_date,blocked_time"
        })
        .select()
        .single()

      if (error) {
        console.error("❌ Error blocking time slot:", error)
        return NextResponse.json({ error: "Failed to block time slot" }, { status: 500 })
      }

      console.log("✅ Time slot blocked successfully:", { date, time })
      return NextResponse.json({ success: true, data })

    } else if (action === "unblock_time") {
      if (!date || !time) {
        return NextResponse.json({ error: "Date and time are required" }, { status: 400 })
      }

      const { error } = await supabase
        .from("blocked_time_slots")
        .delete()
        .eq("blocked_date", date)
        .eq("blocked_time", time)

      if (error) {
        console.error("❌ Error unblocking time slot:", error)
        return NextResponse.json({ error: "Failed to unblock time slot" }, { status: 500 })
      }

      console.log("✅ Time slot unblocked successfully:", { date, time })
      return NextResponse.json({ success: true })

    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

  } catch (error) {
    console.error("❌ Availability management error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
