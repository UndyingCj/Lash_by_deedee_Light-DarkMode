import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Your actual credentials
const supabaseUrl = "https://cqnfxvgdamevrvlniryr.supabase.co"
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbmZ4dmdkYW1ldnJ2bG5pcnlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTMyNzEwMSwiZXhwIjoyMDY0OTAzMTAxfQ.T0TUi8QEh-d7L-P4lCqHoX7l7rVS99SNaoTomqInJyI"

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET() {
  try {
    console.log("🔍 API: Fetching availability data...")

    // Fetch blocked dates
    const { data: blockedDates, error: datesError } = await supabase
      .from("blocked_dates")
      .select("*")
      .order("blocked_date")

    if (datesError) {
      console.error("❌ API: Error fetching blocked dates:", datesError)
      return NextResponse.json({ success: false, error: `Database error: ${datesError.message}` }, { status: 500 })
    }

    // Fetch blocked time slots
    const { data: blockedSlots, error: slotsError } = await supabase
      .from("blocked_time_slots")
      .select("*")
      .order("blocked_date")
      .order("blocked_time")

    if (slotsError) {
      console.error("❌ API: Error fetching blocked slots:", slotsError)
      return NextResponse.json({ success: false, error: `Database error: ${slotsError.message}` }, { status: 500 })
    }

    console.log("✅ API: Successfully fetched availability data:", {
      blockedDatesCount: blockedDates?.length || 0,
      blockedSlotsCount: blockedSlots?.length || 0,
      sampleDate: blockedDates?.[0]?.blocked_date || "none",
    })

    return NextResponse.json({
      success: true,
      blockedDates: blockedDates || [],
      blockedSlots: blockedSlots || [],
      timestamp: new Date().toISOString(),
      debug: {
        blockedDatesCount: blockedDates?.length || 0,
        blockedSlotsCount: blockedSlots?.length || 0,
        sampleBlockedDate: blockedDates?.[0]?.blocked_date || "none",
      },
    })
  } catch (error) {
    console.error("💥 API: Unexpected error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("📝 API: Received POST request:", body)

    const { type, date, time, action, reason } = body

    if (type === "date") {
      // Block/unblock entire date
      if (action === "block") {
        console.log(`🚫 API: Blocking date ${date}`)
        const { data, error } = await supabase
          .from("blocked_dates")
          .upsert([{ blocked_date: date, reason: reason || "Blocked by admin" }])
          .select()

        if (error) {
          console.error("❌ API: Error blocking date:", error)
          return NextResponse.json({ success: false, error: error.message }, { status: 500 })
        }

        console.log("✅ API: Date blocked successfully:", data)
        return NextResponse.json({ success: true, data })
      } else if (action === "unblock") {
        console.log(`✅ API: Unblocking date ${date}`)
        const { data, error } = await supabase.from("blocked_dates").delete().eq("blocked_date", date).select()

        if (error) {
          console.error("❌ API: Error unblocking date:", error)
          return NextResponse.json({ success: false, error: error.message }, { status: 500 })
        }

        console.log("✅ API: Date unblocked successfully:", data)
        return NextResponse.json({ success: true, data })
      }
    } else if (type === "slot") {
      // Block/unblock specific time slot
      if (action === "block") {
        console.log(`🚫 API: Blocking time slot ${time} on ${date}`)
        const { data, error } = await supabase
          .from("blocked_time_slots")
          .upsert([
            {
              blocked_date: date,
              blocked_time: time,
              reason: reason || "Blocked by admin",
            },
          ])
          .select()

        if (error) {
          console.error("❌ API: Error blocking time slot:", error)
          return NextResponse.json({ success: false, error: error.message }, { status: 500 })
        }

        console.log("✅ API: Time slot blocked successfully:", data)
        return NextResponse.json({ success: true, data })
      } else if (action === "unblock") {
        console.log(`✅ API: Unblocking time slot ${time} on ${date}`)
        const { data, error } = await supabase
          .from("blocked_time_slots")
          .delete()
          .eq("blocked_date", date)
          .eq("blocked_time", time)
          .select()

        if (error) {
          console.error("❌ API: Error unblocking time slot:", error)
          return NextResponse.json({ success: false, error: error.message }, { status: 500 })
        }

        console.log("✅ API: Time slot unblocked successfully:", data)
        return NextResponse.json({ success: true, data })
      }
    }

    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 })
  } catch (error) {
    console.error("💥 API: POST error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
