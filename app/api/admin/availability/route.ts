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
    console.log("🔍 Availability API: Fetching data from database...")

    // If env-vars are missing, this will throw – we trap it below.
    try {
      const [blockedDates, blockedSlots] = await Promise.all([getBlockedDates(), getBlockedTimeSlots()])

      console.log("📊 Raw blocked dates from DB:", blockedDates)

      // CRITICAL FIX: Return dates exactly as stored, no timezone conversion
      const processedBlockedDates = (blockedDates || []).map((item) => ({
        ...item,
        blocked_date: item.blocked_date, // Keep exact format from database
      }))

      const processedBlockedSlots = (blockedSlots || []).map((item) => ({
        ...item,
        blocked_date: item.blocked_date, // Keep exact format from database
      }))

      const response = {
        success: true,
        blockedDates: processedBlockedDates,
        blockedSlots: processedBlockedSlots,
        timestamp: new Date().toISOString(),
        debug: {
          totalBlockedDates: processedBlockedDates.length,
          totalBlockedSlots: processedBlockedSlots.length,
          rawDates: blockedDates?.map((d) => d.blocked_date),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      }

      console.log("📤 Final API response:", response)

      return NextResponse.json(response, {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })
    } catch (error) {
      // Graceful fallback so that the booking page doesn't hard-fail
      console.warn("⚠️  Availability API fallback – returning empty arrays. " + "Original error:", error)

      return NextResponse.json(
        {
          success: false,
          blockedDates: [],
          blockedSlots: [],
          message: "Availability temporarily unavailable – using fallback response",
        },
        { status: 200 }, // ← still 200 so the client won't treat it as fatal
      )
    }
  } catch (error) {
    console.error("❌ Error fetching availability:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch availability data",
        blockedDates: [],
        blockedSlots: [],
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, date, time, reason, action } = body

    console.log("🔄 Availability API: Processing update:", { type, date, time, action })

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
        console.log("🚫 Blocking date:", date)
        const result = await addBlockedDate(date, reason || "Blocked by admin")
        console.log("✅ Date blocked successfully:", result)
        return NextResponse.json({
          success: true,
          message: "Date blocked successfully",
          data: result,
        })
      } else if (action === "unblock") {
        console.log("✅ Unblocking date:", date)
        const result = await removeBlockedDate(date)
        console.log("✅ Date unblocked successfully:", result)
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
        console.log("🚫 Blocking time slot:", time, "on", date)
        const result = await addBlockedTimeSlot(date, time, reason || "Blocked by admin")
        console.log("✅ Time slot blocked successfully:", result)
        return NextResponse.json({
          success: true,
          message: "Time slot blocked successfully",
          data: result,
        })
      } else if (action === "unblock") {
        console.log("✅ Unblocking time slot:", time, "on", date)
        const result = await removeBlockedTimeSlot(date, time)
        console.log("✅ Time slot unblocked successfully:", result)
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
    console.error("❌ Error updating availability:", error)

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

    // Graceful fallback so that the booking page doesn't hard-fail
    console.warn("⚠️  Availability API fallback – returning empty arrays. " + "Original error:", error)

    return NextResponse.json(
      {
        success: false,
        blockedDates: [],
        blockedSlots: [],
        message: "Availability temporarily unavailable – using fallback response",
      },
      { status: 200 }, // ← still 200 so the client won't treat it as fatal
    )
  }
}
