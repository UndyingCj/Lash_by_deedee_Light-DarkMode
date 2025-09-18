import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")

    // If no date provided, return all calendar data for the frontend
    if (!date) {
      console.log("📅 Loading all calendar data for admin panel")

      // Get all blocked dates
      let blockedDates = []
      try {
        const { data, error: blockedDatesError } = await supabase
          .from("blocked_dates")
          .select("*")
          .order("blocked_date", { ascending: true })

        if (blockedDatesError) {
          console.log("📋 blocked_dates table doesn't exist, assuming no blocked dates")
          blockedDates = []
        } else {
          blockedDates = data || []
        }
      } catch (error) {
        console.log("📋 blocked_dates table access failed, assuming no blocked dates")
        blockedDates = []
      }

      // Get all blocked time slots
      let blockedSlots = []
      try {
        const { data, error: blockedSlotsError } = await supabase
          .from("blocked_time_slots")
          .select("*")
          .order("blocked_date", { ascending: true })

        if (blockedSlotsError) {
          console.log("📋 blocked_time_slots table doesn't exist, assuming no blocked time slots")
          blockedSlots = []
        } else {
          blockedSlots = data || []
        }
      } catch (error) {
        console.log("📋 blocked_time_slots table access failed, assuming no blocked time slots")
        blockedSlots = []
      }

      console.log("✅ Calendar data loaded:", {
        blockedDates: blockedDates.length,
        blockedSlots: blockedSlots.length
      })

      // Return data in the format expected by the calendar frontend
      return NextResponse.json({
        success: true,
        blockedDates: blockedDates,
        blockedSlots: blockedSlots,
        message: "Calendar data loaded successfully"
      })
    }

    console.log("🗓️ Checking availability for date:", date)

    // Check if the date is blocked (with fallback for missing table)
    let blockedDates = []
    try {
      const { data, error: blockedDatesError } = await supabase
        .from("blocked_dates")
        .select("*")
        .eq("blocked_date", date)

      if (blockedDatesError) {
        console.log("📋 blocked_dates table doesn't exist, assuming no blocked dates")
        blockedDates = []
      } else {
        blockedDates = data || []
      }
    } catch (error) {
      console.log("📋 blocked_dates table access failed, assuming no blocked dates")
      blockedDates = []
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

    // Get blocked time slots for this date (with fallback for missing table)
    let blockedTimeSlots = []
    try {
      const { data, error: blockedTimeSlotsError } = await supabase
        .from("blocked_time_slots")
        .select("*")
        .eq("blocked_date", date)

      if (blockedTimeSlotsError) {
        console.log("📋 blocked_time_slots table doesn't exist, assuming no blocked time slots")
        blockedTimeSlots = []
      } else {
        blockedTimeSlots = data || []
      }
    } catch (error) {
      console.log("📋 blocked_time_slots table access failed, assuming no blocked time slots")
      blockedTimeSlots = []
    }

    // Get existing bookings for this date (with graceful error handling)
    let bookings = []
    try {
      const { data, error: bookingsError } = await supabase
        .from("bookings")
        .select("booking_time, status")
        .eq("booking_date", date)
        .neq("status", "cancelled")

      if (bookingsError) {
        console.log("📋 Error fetching bookings (table may not exist), assuming no bookings:", bookingsError.message)
        bookings = []
      } else {
        bookings = data || []
      }
    } catch (error) {
      console.log("📋 Bookings table access failed, assuming no bookings")
      bookings = []
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
    const { action, type, date, time, reason } = body

    console.log("🔧 Availability management action:", { action, type, date, time, reason })

    // Handle the new format from calendar frontend
    let actualAction = action
    if (type && action) {
      if (type === "date") {
        actualAction = action === "block" ? "block_date" : "unblock_date"
      } else if (type === "slot") {
        actualAction = action === "block" ? "block_time" : "unblock_time"
      }
    }

    if (actualAction === "block_date") {
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

    } else if (actualAction === "unblock_date") {
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

    } else if (actualAction === "block_time") {
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

    } else if (actualAction === "unblock_time") {
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
