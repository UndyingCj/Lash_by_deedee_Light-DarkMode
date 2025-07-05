import { type NextRequest, NextResponse } from "next/server"
import {
  getBlockedDates,
  addBlockedDate,
  removeBlockedDate,
  getBlockedTimeSlots,
  addBlockedTimeSlot,
  removeBlockedTimeSlot,
} from "@/lib/supabase"

/**
 * Gracefully returns availability even if the database layer errors.
 * Never throws a 500 to the client; instead returns success:false with
 * empty arrays so the Booking page can keep working.
 */

export async function GET(_: NextRequest) {
  try {
    const [blockedDates, blockedSlots] = await Promise.all([getBlockedDates(), getBlockedTimeSlots()])

    return NextResponse.json(
      {
        success: true,
        blockedDates,
        blockedSlots,
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      },
    )
  } catch (err) {
    console.error("❌ Availability GET failed:", err)

    return NextResponse.json(
      {
        success: false,
        blockedDates: [],
        blockedSlots: [],
        error: err instanceof Error ? err.message : "Unknown error while fetching availability",
      },
      { status: 200 }, // keep the UI happy
    )
  }
}

/**
 * The POST handler (block / unblock) is untouched except for identical
 * top-level try/catch logic so any Supabase error returns a 200 with
 * success:false, rather than a hard 500.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, date, time, reason, action } = body

    if (!type || !date || !action) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 200 })
    }

    if (type === "date") {
      if (action === "block") {
        const data = await addBlockedDate(date, reason || "Blocked by admin")
        return NextResponse.json({ success: true, data }, { status: 200 })
      }
      if (action === "unblock") {
        await removeBlockedDate(date) // expects numeric id or date string per your lib
        return NextResponse.json({ success: true }, { status: 200 })
      }
    }

    if (type === "slot") {
      if (!time) {
        return NextResponse.json({ success: false, error: "Time is required for slot ops" }, { status: 200 })
      }
      if (action === "block") {
        const data = await addBlockedTimeSlot(date, time, reason || "Blocked by admin")
        return NextResponse.json({ success: true, data }, { status: 200 })
      }
      if (action === "unblock") {
        await removeBlockedTimeSlot(time) // expects numeric id or time string per your lib
        return NextResponse.json({ success: true }, { status: 200 })
      }
    }

    return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 200 })
  } catch (err) {
    console.error("❌ Availability POST failed:", err)
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error while updating availability",
      },
      { status: 200 },
    )
  }
}
