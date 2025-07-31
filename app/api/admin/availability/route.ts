import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Create Supabase client with proper error handling
function createSupabaseClient() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase configuration")
    }

    return createClient(supabaseUrl, supabaseKey)
  } catch (error) {
    console.error("❌ Failed to create Supabase client:", error)
    throw error
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Checking availability...")

    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")

    if (!date) {
      return NextResponse.json(
        {
          error: "Date parameter is required",
          message: "Please provide a date in YYYY-MM-DD format",
        },
        { status: 400 },
      )
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        {
          error: "Invalid date format",
          message: "Date must be in YYYY-MM-DD format",
        },
        { status: 400 },
      )
    }

    console.log(`📅 Checking availability for date: ${date}`)

    const supabase = createSupabaseClient()

    // Check if the entire date is blocked
    const { data: blockedDates, error: blockedDatesError } = await supabase
      .from("blocked_dates")
      .select("*")
      .eq("blocked_date", date)

    if (blockedDatesError) {
      console.error("❌ Error fetching blocked dates:", blockedDatesError)
      return NextResponse.json(
        {
          error: "Database error",
          message: "Failed to check blocked dates",
          details: blockedDatesError.message,
        },
        { status: 500 },
      )
    }

    // If the entire date is blocked, return no available slots
    if (blockedDates && blockedDates.length > 0) {
      console.log(`🚫 Date ${date} is completely blocked:`, blockedDates[0].reason)
      return NextResponse.json({
        date,
        isBlocked: true,
        reason: blockedDates[0].reason || "Date is not available",
        availableSlots: [],
        bookedSlots: [],
        blockedSlots: [],
      })
    }

    // Get blocked time slots for this date
    const { data: blockedTimeSlots, error: blockedTimeSlotsError } = await supabase
      .from("blocked_time_slots")
      .select("*")
      .eq("blocked_date", date)

    if (blockedTimeSlotsError) {
      console.error("❌ Error fetching blocked time slots:", blockedTimeSlotsError)
      return NextResponse.json(
        {
          error: "Database error",
          message: "Failed to check blocked time slots",
          details: blockedTimeSlotsError.message,
        },
        { status: 500 },
      )
    }

    // Get existing bookings for this date
    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("booking_time, status")
      .eq("booking_date", date)
      .neq("status", "cancelled")

    if (bookingsError) {
      console.error("❌ Error fetching bookings:", bookingsError)
      return NextResponse.json(
        {
          error: "Database error",
          message: "Failed to check existing bookings",
          details: bookingsError.message,
        },
        { status: 500 },
      )
    }

    // Define all possible time slots
    const allTimeSlots = [
      "9:00 AM",
      "10:00 AM",
      "11:00 AM",
      "12:00 PM",
      "1:00 PM",
      "2:00 PM",
      "3:00 PM",
      "4:00 PM",
      "5:00 PM",
      "6:00 PM",
    ]

    // Get booked time slots
    const bookedSlots = bookings?.map((booking) => booking.booking_time) || []

    // Get blocked time slots
    const blockedSlots = blockedTimeSlots?.map((slot) => slot.blocked_time) || []

    // Calculate available slots
    const unavailableSlots = [...bookedSlots, ...blockedSlots]
    const availableSlots = allTimeSlots.filter((slot) => !unavailableSlots.includes(slot))

    console.log(`✅ Availability check complete for ${date}:`, {
      total: allTimeSlots.length,
      available: availableSlots.length,
      booked: bookedSlots.length,
      blocked: blockedSlots.length,
    })

    return NextResponse.json({
      date,
      isBlocked: false,
      availableSlots,
      bookedSlots,
      blockedSlots,
      totalSlots: allTimeSlots.length,
      summary: {
        available: availableSlots.length,
        booked: bookedSlots.length,
        blocked: blockedSlots.length,
      },
    })
  } catch (error) {
    console.error("❌ Availability check error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to check availability",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("🔧 Managing availability...")

    const body = await request.json()
    const { action, date, time, reason } = body

    if (!action || !date) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          message: "Action and date are required",
        },
        { status: 400 },
      )
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        {
          error: "Invalid date format",
          message: "Date must be in YYYY-MM-DD format",
        },
        { status: 400 },
      )
    }

    const supabase = createSupabaseClient()

    switch (action) {
      case "block_date":
        console.log(`🚫 Blocking entire date: ${date}`)
        const { data: blockedDate, error: blockDateError } = await supabase
          .from("blocked_dates")
          .upsert([{ blocked_date: date, reason: reason || "Date blocked by admin" }], {
            onConflict: "blocked_date",
          })
          .select()
          .single()

        if (blockDateError) {
          console.error("❌ Error blocking date:", blockDateError)
          return NextResponse.json(
            {
              error: "Database error",
              message: "Failed to block date",
              details: blockDateError.message,
            },
            { status: 500 },
          )
        }

        return NextResponse.json({
          success: true,
          message: `Date ${date} has been blocked`,
          data: blockedDate,
        })

      case "unblock_date":
        console.log(`✅ Unblocking date: ${date}`)
        const { error: unblockDateError } = await supabase.from("blocked_dates").delete().eq("blocked_date", date)

        if (unblockDateError) {
          console.error("❌ Error unblocking date:", unblockDateError)
          return NextResponse.json(
            {
              error: "Database error",
              message: "Failed to unblock date",
              details: unblockDateError.message,
            },
            { status: 500 },
          )
        }

        return NextResponse.json({
          success: true,
          message: `Date ${date} has been unblocked`,
        })

      case "block_time":
        if (!time) {
          return NextResponse.json(
            {
              error: "Missing time",
              message: "Time is required for blocking time slots",
            },
            { status: 400 },
          )
        }

        console.log(`🚫 Blocking time slot: ${date} at ${time}`)
        const { data: blockedTimeSlot, error: blockTimeError } = await supabase
          .from("blocked_time_slots")
          .upsert([{ blocked_date: date, blocked_time: time, reason: reason || "Time slot blocked by admin" }], {
            onConflict: "blocked_date,blocked_time",
          })
          .select()
          .single()

        if (blockTimeError) {
          console.error("❌ Error blocking time slot:", blockTimeError)
          return NextResponse.json(
            {
              error: "Database error",
              message: "Failed to block time slot",
              details: blockTimeError.message,
            },
            { status: 500 },
          )
        }

        return NextResponse.json({
          success: true,
          message: `Time slot ${time} on ${date} has been blocked`,
          data: blockedTimeSlot,
        })

      case "unblock_time":
        if (!time) {
          return NextResponse.json(
            {
              error: "Missing time",
              message: "Time is required for unblocking time slots",
            },
            { status: 400 },
          )
        }

        console.log(`✅ Unblocking time slot: ${date} at ${time}`)
        const { error: unblockTimeError } = await supabase
          .from("blocked_time_slots")
          .delete()
          .eq("blocked_date", date)
          .eq("blocked_time", time)

        if (unblockTimeError) {
          console.error("❌ Error unblocking time slot:", unblockTimeError)
          return NextResponse.json(
            {
              error: "Database error",
              message: "Failed to unblock time slot",
              details: unblockTimeError.message,
            },
            { status: 500 },
          )
        }

        return NextResponse.json({
          success: true,
          message: `Time slot ${time} on ${date} has been unblocked`,
        })

      default:
        return NextResponse.json(
          {
            error: "Invalid action",
            message: "Action must be one of: block_date, unblock_date, block_time, unblock_time",
          },
          { status: 400 },
        )
    }
  } catch (error) {
    console.error("❌ Availability management error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to manage availability",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
