import { NextResponse } from "next/server"
import { getBlockedDates, getBlockedTimeSlots, getBookings } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("Fetching availability data...")

    // Fetch all data with error handling for each
    let blockedDates: any[] = []
    let blockedTimeSlots: any[] = []
    let bookings: any[] = []

    try {
      blockedDates = await getBlockedDates()
      console.log("Blocked dates fetched:", blockedDates.length)
    } catch (error) {
      console.error("Error fetching blocked dates:", error)
      // Continue with empty array
    }

    try {
      blockedTimeSlots = await getBlockedTimeSlots()
      console.log("Blocked time slots fetched:", blockedTimeSlots.length)
    } catch (error) {
      console.error("Error fetching blocked time slots:", error)
      // Continue with empty array
    }

    try {
      bookings = await getBookings()
      console.log("Bookings fetched:", bookings.length)
    } catch (error) {
      console.error("Error fetching bookings:", error)
      // Continue with empty array
    }

    return NextResponse.json({
      blockedDates,
      blockedTimeSlots,
      bookings,
    })
  } catch (error) {
    console.error("Availability API error:", error)

    // Return empty data instead of failing
    return NextResponse.json({
      blockedDates: [],
      blockedTimeSlots: [],
      bookings: [],
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
