import { type NextRequest, NextResponse } from "next/server"
import {
  getBlockedDates,
  addBlockedDate,
  removeBlockedDate,
  getBlockedTimeSlots,
  addBlockedTimeSlot,
  removeBlockedTimeSlot,
} from "@/lib/database-operations"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") // 'dates' or 'timeslots'

    if (type === "timeslots") {
      const blockedTimeSlots = await getBlockedTimeSlots()
      return NextResponse.json({
        success: true,
        data: blockedTimeSlots,
      })
    } else {
      const blockedDates = await getBlockedDates()
      return NextResponse.json({
        success: true,
        data: blockedDates,
      })
    }
  } catch (error) {
    console.error("Error fetching calendar data:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch calendar data" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, date, time, reason } = body

    if (type === "timeslot") {
      const result = await addBlockedTimeSlot(date, time, reason)
      return NextResponse.json({
        success: true,
        data: result,
        message: "Time slot blocked successfully",
      })
    } else {
      const result = await addBlockedDate(date, reason)
      return NextResponse.json({
        success: true,
        data: result,
        message: "Date blocked successfully",
      })
    }
  } catch (error) {
    console.error("Error blocking date/time:", error)
    return NextResponse.json({ success: false, error: "Failed to block date/time" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const date = searchParams.get("date")
    const time = searchParams.get("time")

    if (type === "timeslot" && date && time) {
      const result = await removeBlockedTimeSlot(date, time)
      return NextResponse.json({
        success: true,
        data: result,
        message: "Time slot unblocked successfully",
      })
    } else if (date) {
      const result = await removeBlockedDate(date)
      return NextResponse.json({
        success: true,
        data: result,
        message: "Date unblocked successfully",
      })
    } else {
      return NextResponse.json({ success: false, error: "Missing required parameters" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error unblocking date/time:", error)
    return NextResponse.json({ success: false, error: "Failed to unblock date/time" }, { status: 500 })
  }
}
