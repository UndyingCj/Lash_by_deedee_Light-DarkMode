import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// ─────────────────────────────────────────────
// Server-side Supabase client (service-role key)
// ─────────────────────────────────────────────
function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing Supabase environment variables")
    console.error("SUPABASE_URL:", supabaseUrl ? "✅ Set" : "❌ Missing")
    console.error("SUPABASE_SERVICE_ROLE_KEY:", supabaseKey ? "✅ Set" : "❌ Missing")
    throw new Error("Supabase configuration missing")
  }

  return createClient(supabaseUrl, supabaseKey)
}

/**
 * GET /api/admin/availability
 *
 * - ?date=YYYY-MM-DD → single-day summary for admin tools
 * - (no query)       → full availability list for /book page
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    const { searchParams } = new URL(req.url)
    const dateParam = searchParams.get("date")?.trim()

    /* ──────────────────────────────
     * 1. PER-DAY VIEW  (admin usage)
     * ────────────────────────────── */
    if (dateParam) {
      // fetch booked slots for that specific date
      const { data: bookings, error } = await supabase
        .from("bookings")
        .select("booking_time")
        .eq("booking_date", dateParam)

      if (error) throw error

      return NextResponse.json({
        date: dateParam,
        bookedSlots: (bookings ?? []).map((b) => b.booking_time),
      })
    }

    /* ─────────────────────────────────────────────
     * 2. FULL DUMP  (public booking page expects)
     * ───────────────────────────────────────────── */
    const [
      { data: blockedDatesRaw, error: blockedDatesErr },
      { data: blockedSlotsRaw, error: blockedSlotsErr },
      { data: bookingsRaw, error: bookingsErr },
    ] = await Promise.all([
      supabase.from("blocked_dates").select("blocked_date"),
      supabase.from("blocked_time_slots").select("blocked_date, blocked_time"),
      supabase.from("bookings").select("booking_date, booking_time"),
    ])

    if (blockedDatesErr) throw blockedDatesErr
    if (blockedSlotsErr) throw blockedSlotsErr
    if (bookingsErr) throw bookingsErr

    const blockedDates = (blockedDatesRaw ?? []).map((d) => d.blocked_date)

    const blockedSlots =
      blockedSlotsRaw?.map((s) => ({
        date: s.blocked_date,
        time: s.blocked_time,
      })) ?? []

    const bookedSlots =
      bookingsRaw?.map((b) => ({
        date: b.booking_date,
        time: b.booking_time,
      })) ?? []

    return NextResponse.json({ blockedDates, blockedSlots, bookedSlots })
  } catch (err) {
    console.error("❌ Availability API error:", err)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
