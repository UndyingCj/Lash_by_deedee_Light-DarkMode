import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const date = searchParams.get("date")
    const limit = searchParams.get("limit")

    console.log("📋 Fetching bookings with filters:", { status, date, limit })

    let query = supabase.from("bookings").select("*").order("created_at", { ascending: false })

    // Apply filters
    if (status && status !== "all") {
      query = query.eq("status", status)
    }

    if (date) {
      query = query.eq("booking_date", date)
    }

    if (limit) {
      query = query.limit(Number.parseInt(limit))
    }

    const { data: bookings, error } = await query

    if (error) {
      console.error("❌ Error fetching bookings:", error)
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch bookings",
          error: error.message,
        },
        { status: 500 },
      )
    }

    console.log(`✅ Found ${bookings?.length || 0} bookings`)

    return NextResponse.json({
      success: true,
      message: "Bookings fetched successfully",
      data: bookings || [],
      count: bookings?.length || 0,
    })
  } catch (error) {
    console.error("❌ Bookings fetch error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch bookings",
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      customerName,
      customerEmail,
      customerPhone,
      services,
      date,
      time,
      totalAmount,
      depositAmount,
      notes,
      paymentStatus = "pending",
      paymentReference,
    } = body

    console.log("📝 Creating new booking:", {
      customerName,
      customerEmail,
      services,
      date,
      time,
    })

    // Validate required fields
    if (!customerName || !customerEmail || !customerPhone || !services || !date || !time || !totalAmount) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
        },
        { status: 400 },
      )
    }

    // Check if time slot is available
    const { data: existingBooking } = await supabase
      .from("bookings")
      .select("id")
      .eq("booking_date", date)
      .eq("booking_time", time)
      .neq("status", "cancelled")
      .single()

    if (existingBooking) {
      return NextResponse.json(
        {
          success: false,
          message: "Time slot is already booked",
        },
        { status: 400 },
      )
    }

    // Check if time slot is blocked
    const { data: blockedSlot } = await supabase
      .from("blocked_time_slots")
      .select("id")
      .eq("blocked_date", date)
      .eq("blocked_time", time)
      .single()

    if (blockedSlot) {
      return NextResponse.json(
        {
          success: false,
          message: "Time slot is blocked",
        },
        { status: 400 },
      )
    }

    // Check if entire date is blocked
    const { data: blockedDate } = await supabase.from("blocked_dates").select("id").eq("blocked_date", date).single()

    if (blockedDate) {
      return NextResponse.json(
        {
          success: false,
          message: "Date is fully booked",
        },
        { status: 400 },
      )
    }

    // Create booking record
    const bookingData = {
      client_name: customerName,
      client_email: customerEmail,
      client_phone: customerPhone,
      phone: customerPhone,
      email: customerEmail,
      service_name: Array.isArray(services) ? services.join(", ") : services,
      service: Array.isArray(services) ? services.join(", ") : services,
      booking_date: date,
      booking_time: time,
      total_amount: totalAmount,
      amount: totalAmount,
      deposit_amount: depositAmount || Math.floor(totalAmount / 2),
      payment_status: paymentStatus,
      payment_reference: paymentReference || null,
      special_notes: notes || "",
      notes: notes || "",
      status: paymentStatus === "paid" ? "confirmed" : "pending",
    }

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert([bookingData])
      .select()
      .single()

    if (bookingError) {
      console.error("❌ Error creating booking:", bookingError)
      return NextResponse.json(
        {
          success: false,
          message: "Failed to create booking",
          error: bookingError.message,
        },
        { status: 500 },
      )
    }

    console.log("✅ Booking created successfully:", booking.id)

    return NextResponse.json({
      success: true,
      message: "Booking created successfully",
      data: booking,
    })
  } catch (error) {
    console.error("❌ Booking creation error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create booking",
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    console.log("📝 Updating booking:", id, updates)

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking ID is required",
        },
        { status: 400 },
      )
    }

    // Update booking
    const { data: booking, error: updateError } = await supabase
      .from("bookings")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (updateError) {
      console.error("❌ Error updating booking:", updateError)
      return NextResponse.json(
        {
          success: false,
          message: "Failed to update booking",
          error: updateError.message,
        },
        { status: 500 },
      )
    }

    console.log("✅ Booking updated successfully:", booking.id)

    return NextResponse.json({
      success: true,
      message: "Booking updated successfully",
      data: booking,
    })
  } catch (error) {
    console.error("❌ Booking update error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update booking",
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    console.log("🗑️ Deleting booking:", id)

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking ID is required",
        },
        { status: 400 },
      )
    }

    // Get booking details before deletion
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select("booking_date, booking_time")
      .eq("id", id)
      .single()

    if (fetchError) {
      console.error("❌ Error fetching booking for deletion:", fetchError)
      return NextResponse.json(
        {
          success: false,
          message: "Booking not found",
          error: fetchError.message,
        },
        { status: 404 },
      )
    }

    // Delete booking
    const { error: deleteError } = await supabase.from("bookings").delete().eq("id", id)

    if (deleteError) {
      console.error("❌ Error deleting booking:", deleteError)
      return NextResponse.json(
        {
          success: false,
          message: "Failed to delete booking",
          error: deleteError.message,
        },
        { status: 500 },
      )
    }

    // Remove blocked time slot if it exists
    try {
      await supabase
        .from("blocked_time_slots")
        .delete()
        .eq("blocked_date", booking.booking_date)
        .eq("blocked_time", booking.booking_time)
    } catch (unblockError) {
      console.warn("⚠️ Could not unblock time slot:", unblockError)
      // Don't fail the deletion if unblocking fails
    }

    console.log("✅ Booking deleted successfully")

    return NextResponse.json({
      success: true,
      message: "Booking deleted successfully",
    })
  } catch (error) {
    console.error("❌ Booking deletion error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete booking",
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
