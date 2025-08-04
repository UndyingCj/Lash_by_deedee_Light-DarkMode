import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")

    console.log("🔍 Fetching availability data", date ? `for date: ${date}` : "for all dates")

    if (date) {
      // Get availability for a specific date
      const [blockedDatesResult, blockedSlotsResult, bookingsResult] = await Promise.all([
        supabase
          .from("blocked_dates")
          .select("*")
          .eq("blocked_date", date),
        supabase
          .from("blocked_time_slots")
          .select("*")
          .eq("blocked_date", date),
        supabase
          .from("bookings")
          .select("booking_time")
          .eq("booking_date", date)
          .eq("status", "confirmed")
      ])

      if (blockedDatesResult.error) {
        console.error("❌ Error fetching blocked dates:", blockedDatesResult.error)
        return NextResponse.json({ error: "Failed to fetch blocked dates" }, { status: 500 })
      }

      if (blockedSlotsResult.error) {
        console.error("❌ Error fetching blocked slots:", blockedSlotsResult.error)
        return NextResponse.json({ error: "Failed to fetch blocked slots" }, { status: 500 })
      }

      if (bookingsResult.error) {
        console.error("❌ Error fetching bookings:", bookingsResult.error)
        return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 })
      }

      const isDateBlocked = blockedDatesResult.data.length > 0
      const blockedTimes = [
        ...blockedSlotsResult.data.map(slot => slot.blocked_time),
        ...bookingsResult.data.map(booking => booking.booking_time)
      ]

      return NextResponse.json({
        date,
        isDateBlocked,
        blockedTimes,
        availableSlots: isDateBlocked ? [] : ["9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM"].filter(
          time => !blockedTimes.includes(time)
        )
      })
    } else {
      // Get all availability data for the booking page
      const [blockedDatesResult, blockedSlotsResult, bookingsResult] = await Promise.all([
        supabase
          .from("blocked_dates")
          .select("*")
          .order("blocked_date", { ascending: true }),
        supabase
          .from("blocked_time_slots")
          .select("*")
          .order("blocked_date", { ascending: true }),
        supabase
          .from("bookings")
          .select("booking_date, booking_time")
          .eq("status", "confirmed")
          .order("booking_date", { ascending: true })
      ])

      if (blockedDatesResult.error) {
        console.error("❌ Error fetching blocked dates:", blockedDatesResult.error)
        return NextResponse.json({ error: "Failed to fetch blocked dates" }, { status: 500 })
      }

      if (blockedSlotsResult.error) {
        console.error("❌ Error fetching blocked slots:", blockedSlotsResult.error)
        return NextResponse.json({ error: "Failed to fetch blocked slots" }, { status: 500 })
      }

      if (bookingsResult.error) {
        console.error("❌ Error fetching bookings:", bookingsResult.error)
        return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 })
      }

      // Combine blocked slots and confirmed bookings
      const allBlockedSlots = [
        ...blockedSlotsResult.data,
        ...bookingsResult.data.map(booking => ({
          blocked_date: booking.booking_date,
          blocked_time: booking.booking_time,
          reason: "Booked"
        }))
      ]

      console.log("📊 Availability data:", {
        blockedDates: blockedDatesResult.data.length,
        blockedSlots: allBlockedSlots.length
      })

      return NextResponse.json({
        blockedDates: blockedDatesResult.data,
        blockedSlots: allBlockedSlots
      })
    }
  } catch (error) {
    console.error("❌ Error in availability API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, date, time, reason } = body

    console.log("📝 Creating blocked slot:", { type, date, time, reason })

    if (type === "date") {
      // Block entire date
      const { data, error } = await supabase
        .from("blocked_dates")
        .insert([{ blocked_date: date, reason }])
        .select()
        .single()

      if (error) {
        console.error("❌ Error blocking date:", error)
        return NextResponse.json({ error: "Failed to block date" }, { status: 500 })
      }

      return NextResponse.json({ success: true, data })
    } else if (type === "time") {
      // Block specific time slot
      const { data, error } = await supabase
        .from("blocked_time_slots")
        .insert([{ blocked_date: date, blocked_time: time, reason }])
        .select()
        .single()

      if (error) {
        console.error("❌ Error blocking time slot:", error)
        return NextResponse.json({ error: "Failed to block time slot" }, { status: 500 })
      }

      return NextResponse.json({ success: true, data })
    } else {
      return NextResponse.json({ error: "Invalid type. Must be 'date' or 'time'" }, { status: 400 })
    }
  } catch (error) {
    console.error("❌ Error in availability POST:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const id = searchParams.get("id")

    if (!type || !id) {
      return NextResponse.json({ error: "Type and ID are required" }, { status: 400 })
    }

    console.log("🗑️ Deleting blocked slot:", { type, id })

    if (type === "date") {
      const { error } = await supabase
        .from("blocked_dates")
        .delete()
        .eq("id", id)

      if (error) {
        console.error("❌ Error deleting blocked date:", error)
        return NextResponse.json({ error: "Failed to delete blocked date" }, { status: 500 })
      }
    } else if (type === "time") {
      const { error } = await supabase
        .from("blocked_time_slots")
        .delete()
        .eq("id", id)

      if (error) {
        console.error("❌ Error deleting blocked time slot:", error)
        return NextResponse.json({ error: "Failed to delete blocked time slot" }, { status: 500 })
      }
    } else {
      return NextResponse.json({ error: "Invalid type. Must be 'date' or 'time'" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("❌ Error in availability DELETE:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
