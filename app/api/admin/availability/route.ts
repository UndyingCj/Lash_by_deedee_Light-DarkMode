import { type NextRequest, NextResponse } from "next/server"
import {
  getBlockedDates,
  addBlockedDate,
  removeBlockedDate,
  getBlockedTimeSlots,
  addBlockedTimeSlot,
  removeBlockedTimeSlot,
} from "@/lib/supabase"
import { createNotification } from "@/lib/settings"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    if (type === "dates") {
      const blockedDates = await getBlockedDates()
      return NextResponse.json(blockedDates)
    } else if (type === "slots") {
      const blockedSlots = await getBlockedTimeSlots()
      return NextResponse.json(blockedSlots)
    } else {
      const [blockedDates, blockedSlots] = await Promise.all([getBlockedDates(), getBlockedTimeSlots()])
      return NextResponse.json({ blockedDates, blockedSlots })
    }
  } catch (error) {
    console.error("Error fetching availability:", error)
    return NextResponse.json({ error: "Failed to fetch availability" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { type, date, time, reason, action } = await request.json()

    if (type === "date") {
      if (action === "block") {
        await addBlockedDate(date, reason)
        await createNotification(
          "Date Blocked",
          `${new Date(date).toLocaleDateString()} has been blocked for bookings`,
          "info",
          24,
        )
      } else {
        await removeBlockedDate(date)
        await createNotification(
          "Date Unblocked",
          `${new Date(date).toLocaleDateString()} is now available for bookings`,
          "success",
          24,
        )
      }
    } else if (type === "slot") {
      if (action === "block") {
        await addBlockedTimeSlot(date, time, reason)
        await createNotification(
          "Time Slot Blocked",
          `${time} on ${new Date(date).toLocaleDateString()} has been blocked`,
          "info",
          24,
        )
      } else {
        await removeBlockedTimeSlot(date, time)
        await createNotification(
          "Time Slot Unblocked",
          `${time} on ${new Date(date).toLocaleDateString()} is now available`,
          "success",
          24,
        )
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating availability:", error)
    return NextResponse.json({ error: "Failed to update availability" }, { status: 500 })
  }
}
