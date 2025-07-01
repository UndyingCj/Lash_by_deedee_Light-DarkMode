import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = Number.parseInt(searchParams.get("offset") || "0")
    const status = searchParams.get("status")
    const date = searchParams.get("date")

    let query = supabase.from("bookings").select("*").order("created_at", { ascending: false })

    if (status) {
      query = query.eq("status", status)
    }

    if (date) {
      query = query.eq("booking_date", date)
    }

    if (limit > 0) {
      query = query.range(offset, offset + limit - 1)
    }

    const { data: bookings, error } = await query

    if (error) {
      console.error("Bookings fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 })
    }

    // Get total count for pagination
    const { count: totalCount } = await supabase.from("bookings").select("*", { count: "exact", head: true })

    return NextResponse.json({
      bookings: bookings || [],
      total: totalCount || 0,
      limit,
      offset,
    })
  } catch (error) {
    console.error("Bookings API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const bookingData = await request.json()

    const { data: booking, error } = await supabase.from("bookings").insert(bookingData).select().single()

    if (error) {
      console.error("Booking creation error:", error)
      return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
    }

    return NextResponse.json({ booking })
  } catch (error) {
    console.error("Booking creation API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
