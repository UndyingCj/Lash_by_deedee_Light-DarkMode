import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { verifyAuth } from "@/lib/auth"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'
)

export async function GET(request: NextRequest) {
  // Verify authentication
  const authResult = await verifyAuth(request)
  if (!authResult.success) {
    return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")

    console.log("🔍 Fetching availability data", date ? `for date: ${date}` : "for all dates")

    if (date) {
      // Get blocked time slots for specific date
      const { data: blockedSlots, error: blockedError } = await supabase
        .from("blocked_time_slots")
        .select("blocked_time, reason")
        .eq("blocked_date", date)

      if (blockedError) {
        console.error("❌ Error fetching blocked slots:", blockedError)
        return NextResponse.json({ error: "Failed to fetch blocked slots" }, { status: 500 })
      }

      // Get confirmed bookings for specific date
      const { data: bookings, error: bookingsError } = await supabase
        .from("bookings")
        .select("booking_time, client_name, service_name")
        .eq("booking_date", date)
        .eq("status", "confirmed")

      if (bookingsError) {
        console.error("❌ Error fetching bookings:", bookingsError)
        return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 })
      }

      // Combine blocked slots and bookings
      const unavailableSlots = [
        ...(blockedSlots || []).map(slot => ({
          time: slot.blocked_time,
          reason: slot.reason || "Blocked",
          type: "blocked"
        })),
        ...(bookings || []).map(booking => ({
          time: booking.booking_time,
          reason: `Booked by ${booking.client_name} - ${booking.service_name}`,
          type: "booked"
        }))
      ]

      console.log(`✅ Found ${unavailableSlots.length} unavailable slots for ${date}`)

      return NextResponse.json({
        date,
        unavailableSlots,
        totalBlocked: blockedSlots?.length || 0,
        totalBooked: bookings?.length || 0
      })
    } else {
      // Get all availability data for calendar view
      const today = new Date().toISOString().split('T')[0]
      const futureDate = new Date()
      futureDate.setMonth(futureDate.getMonth() + 3)
      const maxDate = futureDate.toISOString().split('T')[0]

      // Get all blocked time slots
      const { data: blockedSlots, error: blockedError } = await supabase
        .from("blocked_time_slots")
        .select("blocked_date, blocked_time, reason")
        .gte("blocked_date", today)
        .lte("blocked_date", maxDate)
        .order("blocked_date", { ascending: true })

      if (blockedError) {
        console.error("❌ Error fetching all blocked slots:", blockedError)
        return NextResponse.json({ error: "Failed to fetch blocked slots" }, { status: 500 })
      }

      // Get all confirmed bookings
      const { data: bookings, error: bookingsError } = await supabase
        .from("bookings")
        .select("booking_date, booking_time, client_name, service_name")
        .gte("booking_date", today)
        .lte("booking_date", maxDate)
        .eq("status", "confirmed")
        .order("booking_date", { ascending: true })

      if (bookingsError) {
        console.error("❌ Error fetching all bookings:", bookingsError)
        return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 })
      }

      // Group by date
      const availabilityByDate: Record<string, any[]> = {}

      // Process blocked slots
      blockedSlots?.forEach(slot => {
        if (!availabilityByDate[slot.blocked_date]) {
          availabilityByDate[slot.blocked_date] = []
        }
        availabilityByDate[slot.blocked_date].push({
          time: slot.blocked_time,
          reason: slot.reason || "Blocked",
          type: "blocked"
        })
      })

      // Process bookings
      bookings?.forEach(booking => {
        if (!availabilityByDate[booking.booking_date]) {
          availabilityByDate[booking.booking_date] = []
        }
        availabilityByDate[booking.booking_date].push({
          time: booking.booking_time,
          reason: `Booked by ${booking.client_name} - ${booking.service_name}`,
          type: "booked"
        })
      })

      console.log(`✅ Found availability data for ${Object.keys(availabilityByDate).length} dates`)

      return NextResponse.json({
        availabilityByDate,
        totalBlockedSlots: blockedSlots?.length || 0,
        totalBookings: bookings?.length || 0,
        dateRange: { from: today, to: maxDate }
      })
    }
  } catch (error) {
    console.error("❌ Availability API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  // Verify authentication
  const authResult = await verifyAuth(request)
  if (!authResult.success) {
    return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { date, time, reason } = body

    console.log("🚫 Blocking time slot:", { date, time, reason })

    if (!date || !time) {
      return NextResponse.json(
        { error: "Date and time are required" },
        { status: 400 }
      )
    }

    // Insert or update blocked time slot
    const { data, error } = await supabase
      .from("blocked_time_slots")
      .upsert({
        blocked_date: date,
        blocked_time: time,
        reason: reason || "Manually blocked"
      }, {
        onConflict: "blocked_date,blocked_time"
      })
      .select()

    if (error) {
      console.error("❌ Error blocking time slot:", error)
      return NextResponse.json(
        { error: "Failed to block time slot" },
        { status: 500 }
      )
    }

    console.log("✅ Time slot blocked successfully")

    return NextResponse.json({
      message: "Time slot blocked successfully",
      data
    })
  } catch (error) {
    console.error("❌ Block time slot error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  // Verify authentication
  const authResult = await verifyAuth(request)
  if (!authResult.success) {
    return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")
    const time = searchParams.get("time")

    console.log("🔓 Unblocking time slot:", { date, time })

    if (!date || !time) {
      return NextResponse.json(
        { error: "Date and time are required" },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from("blocked_time_slots")
      .delete()
      .eq("blocked_date", date)
      .eq("blocked_time", time)

    if (error) {
      console.error("❌ Error unblocking time slot:", error)
      return NextResponse.json(
        { error: "Failed to unblock time slot" },
        { status: 500 }
      )
    }

    console.log("✅ Time slot unblocked successfully")

    return NextResponse.json({
      message: "Time slot unblocked successfully"
    })
  } catch (error) {
    console.error("❌ Unblock time slot error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
