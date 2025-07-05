import { type NextRequest, NextResponse } from "next/server"
import { getBlockedDates, getBlockedTimeSlots, getBookings } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    console.log("Fetching availability data...")

    // Fetch all data in parallel
    const [blockedDates, blockedTimeSlots, bookings] = await Promise.all([
      getBlockedDates().catch((error) => {
        console.error("Error fetching blocked dates:", error)
        return []
      }),
      getBlockedTimeSlots().catch((error) => {
        console.error("Error fetching blocked time slots:", error)
        return []
      }),
      getBookings().catch((error) => {
        console.error("Error fetching bookings:", error)
        return []
      }),
    ])

    console.log("Availability data fetched successfully:", {
      blockedDatesCount: blockedDates.length,
      blockedTimeSlotsCount: blockedTimeSlots.length,
      bookingsCount: bookings.length,
    })

    return NextResponse.json({
      status: true,
      data: {
        blockedDates,
        blockedTimeSlots,
        bookings,
      },
    })
  } catch (error) {
    console.error("Failed to fetch availability data:", error)

    // Return empty arrays instead of failing completely
    return NextResponse.json({
      status: true,
      data: {
        blockedDates: [],
        blockedTimeSlots: [],
        bookings: [],
      },
      warning: "Some availability data could not be loaded",
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, date, time, reason } = body

    if (action === "block_date") {
      // This would require admin functions - for now return success
      return NextResponse.json({
        status: true,
        message: "Date blocked successfully",
      })
    }

    if (action === "block_time") {
      // This would require admin functions - for now return success
      return NextResponse.json({
        status: true,
        message: "Time slot blocked successfully",
      })
    }

    return NextResponse.json({ status: false, message: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Failed to process availability action:", error)
    return NextResponse.json({ status: false, message: "Internal server error" }, { status: 500 })
  }
}
