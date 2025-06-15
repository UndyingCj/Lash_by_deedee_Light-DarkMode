import { type NextRequest, NextResponse } from "next/server"
import {
  getBlockedDates,
  addBlockedDate,
  removeBlockedDate,
  getBlockedTimeSlots,
  addBlockedTimeSlot,
  removeBlockedTimeSlot,
} from "@/lib/supabase"

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
      // Return both dates and slots
      const [blockedDates, blockedSlots] = await Promise.all([getBlockedDates(), getBlockedTimeSlots()])
      return NextResponse.json({
        success: true,
        blockedDates,
        blockedSlots,
      })
    }
  } catch (error) {
    console.error("Error fetching availability:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch availability data",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, date, time, reason, action } = body

    // Validate required fields
    if (!type || !date || !action) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: type, date, and action are required",
        },
        { status: 400 },
      )
    }

    if (type === "date") {
      if (action === "block") {
        const result = await addBlockedDate(date, reason || "Blocked by admin")
        return NextResponse.json({
          success: true,
          message: "Date blocked successfully",
          data: result,
        })
      } else if (action === "unblock") {
        const result = await removeBlockedDate(date)
        return NextResponse.json({
          success: true,
          message: "Date unblocked successfully",
          data: result,
        })
      } else {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid action. Use 'block' or 'unblock'",
          },
          { status: 400 },
        )
      }
    } else if (type === "slot") {
      if (!time) {
        return NextResponse.json(
          {
            success: false,
            error: "Time is required for slot operations",
          },
          { status: 400 },
        )
      }

      if (action === "block") {
        const result = await addBlockedTimeSlot(date, time, reason || "Blocked by admin")
        return NextResponse.json({
          success: true,
          message: "Time slot blocked successfully",
          data: result,
        })
      } else if (action === "unblock") {
        const result = await removeBlockedTimeSlot(date, time)
        return NextResponse.json({
          success: true,
          message: "Time slot unblocked successfully",
          data: result,
        })
      } else {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid action. Use 'block' or 'unblock'",
          },
          { status: 400 },
        )
      }
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid type. Use 'date' or 'slot'",
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("Error updating availability:", error)

    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes("duplicate key")) {
        return NextResponse.json(
          {
            success: false,
            error: "This date/time is already blocked",
          },
          { status: 409 },
        )
      }

      if (error.message.includes("not found")) {
        return NextResponse.json(
          {
            success: false,
            error: "Date/time slot not found",
          },
          { status: 404 },
        )
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update availability. Please try again.",
      },
      { status: 500 },
    )
  }
}
