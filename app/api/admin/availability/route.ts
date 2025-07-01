import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")

    if (!date) {
      return NextResponse.json({ error: "Date parameter is required" }, { status: 400 })
    }

    // Check if date is blocked
    const { data: blockedDate } = await supabase.from("blocked_dates").select("*").eq("date", date).single()

    if (blockedDate) {
      return NextResponse.json({
        available: false,
        reason: blockedDate.reason || "Date is not available",
        timeSlots: [],
      })
    }

    // Get blocked time slots for this date
    const { data: blockedSlots } = await supabase.from("blocked_time_slots").select("time_slot").eq("date", date)

    // Get existing bookings for this date
    const { data: bookings } = await supabase
      .from("bookings")
      .select("booking_time")
      .eq("booking_date", date)
      .neq("status", "cancelled")

    // Generate available time slots (9 AM to 6 PM)
    const allTimeSlots = []
    for (let hour = 9; hour < 18; hour++) {
      allTimeSlots.push(`${hour.toString().padStart(2, "0")}:00`)
      allTimeSlots.push(`${hour.toString().padStart(2, "0")}:30`)
    }

    // Filter out blocked and booked slots
    const blockedTimes = new Set([
      ...(blockedSlots?.map((slot) => slot.time_slot) || []),
      ...(bookings?.map((booking) => booking.booking_time) || []),
    ])

    const availableSlots = allTimeSlots.filter((slot) => !blockedTimes.has(slot))

    return NextResponse.json({
      available: true,
      timeSlots: availableSlots,
      date,
    })
  } catch (error) {
    console.error("Availability check error:", error)
    return NextResponse.json({ error: "Failed to check availability" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { date, timeSlot, reason, action } = await request.json()

    if (action === "block") {
      if (timeSlot) {
        // Block specific time slot
        const { error } = await supabase.from("blocked_time_slots").insert({
          date,
          time_slot: timeSlot,
          reason: reason || "Blocked by admin",
        })

        if (error) {
          return NextResponse.json({ error: "Failed to block time slot" }, { status: 500 })
        }
      } else {
        // Block entire date
        const { error } = await supabase.from("blocked_dates").insert({
          date,
          reason: reason || "Blocked by admin",
        })

        if (error) {
          return NextResponse.json({ error: "Failed to block date" }, { status: 500 })
        }
      }

      return NextResponse.json({ success: true, message: "Successfully blocked" })
    } else if (action === "unblock") {
      if (timeSlot) {
        // Unblock specific time slot
        const { error } = await supabase.from("blocked_time_slots").delete().eq("date", date).eq("time_slot", timeSlot)

        if (error) {
          return NextResponse.json({ error: "Failed to unblock time slot" }, { status: 500 })
        }
      } else {
        // Unblock entire date
        const { error } = await supabase.from("blocked_dates").delete().eq("date", date)

        if (error) {
          return NextResponse.json({ error: "Failed to unblock date" }, { status: 500 })
        }
      }

      return NextResponse.json({ success: true, message: "Successfully unblocked" })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Availability update error:", error)
    return NextResponse.json({ error: "Failed to update availability" }, { status: 500 })
  }
}
