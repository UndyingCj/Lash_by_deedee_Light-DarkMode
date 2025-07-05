import { NextResponse } from "next/server"
import { getBlockedDates, getBlockedTimeSlots, getBookings } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("Fetching availability data...")

    // Fetch all availability data with error handling
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

    // Process the data to return availability information
    const response = {
      blockedDates: blockedDates.map((date) => ({
        id: date.id,
        date: date.blocked_date,
        reason: date.reason,
      })),
      blockedTimeSlots: blockedTimeSlots.map((slot) => ({
        id: slot.id,
        date: slot.blocked_date,
        time: slot.blocked_time,
        reason: slot.reason,
      })),
      bookedSlots: bookings
        .filter((booking) => booking.status !== "cancelled")
        .map((booking) => ({
          date: booking.booking_date,
          time: booking.booking_time,
          status: booking.status,
        })),
    }

    console.log("Availability data processed successfully")
    return NextResponse.json(response)
  } catch (error) {
    console.error("Error in availability API:", error)

    // Return empty data instead of failing
    return NextResponse.json({
      blockedDates: [],
      blockedTimeSlots: [],
      bookedSlots: [],
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
