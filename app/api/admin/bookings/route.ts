import { type NextRequest, NextResponse } from "next/server"
import { getBookings, createBooking, updateBooking, deleteBooking } from "@/lib/supabase"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const date = searchParams.get("date")

    const filters: any = {}
    if (status) filters.status = status
    if (date) filters.date = date

    const bookings = await getBookings(filters)

    return NextResponse.json({
      success: true,
      data: bookings,
      total: bookings.length,
    })
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch bookings",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Test connection first
    const connectionTest = await testConnection()
    if (!connectionTest) {
      return NextResponse.json(
        {
          success: false,
          error: "Database connection failed",
        },
        { status: 500 },
      )
    }
    const body = await request.json()
    console.log("Received booking data:", body)

    // Validate required fields
    if (!body.clientName || !body.phone || !body.email || !body.service || !body.date || !body.time || !body.amount) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 },
      )
    }

    // Validate amount is a valid number
    const amount = Number.parseFloat(body.amount)
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid amount",
        },
        { status: 400 },
      )
    }

    // Validate date format
    const bookingDate = new Date(body.date)
    if (isNaN(bookingDate.getTime())) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid date format",
        },
        { status: 400 },
      )
    }

    console.log("Environment check:")
    console.log("NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Missing")
    console.log("SUPABASE_SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "Set" : "Missing")

    const newBooking = await createBooking({
      client_name: body.clientName.trim(),
      phone: body.phone.trim(),
      email: body.email.trim().toLowerCase(),
      service: body.service,
      booking_date: body.date,
      booking_time: body.time,
      status: body.status || "pending",
      amount: amount,
      notes: body.notes?.trim() || "",
    })

    console.log("Created booking:", newBooking)

    return NextResponse.json({
      success: true,
      data: newBooking,
      message: "Booking created successfully",
    })
  } catch (error) {
    console.error("Error creating booking:", error)

    // More detailed error handling
    let errorMessage = "Failed to create booking"
    if (error instanceof Error) {
      errorMessage = error.message

      // Handle specific database errors
      if (error.message.includes("duplicate key")) {
        errorMessage = "A booking with this information already exists"
      } else if (error.message.includes("foreign key")) {
        errorMessage = "Invalid reference data"
      } else if (error.message.includes("not null")) {
        errorMessage = "Missing required information"
      } else if (error.message.includes("invalid input")) {
        errorMessage = "Invalid data format"
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Booking ID is required",
        },
        { status: 400 },
      )
    }

    // Convert camelCase to snake_case for database
    const dbUpdateData: any = {}
    if (updateData.clientName) dbUpdateData.client_name = updateData.clientName.trim()
    if (updateData.phone) dbUpdateData.phone = updateData.phone.trim()
    if (updateData.email) dbUpdateData.email = updateData.email.trim().toLowerCase()
    if (updateData.service) dbUpdateData.service = updateData.service
    if (updateData.date) dbUpdateData.booking_date = updateData.date
    if (updateData.time) dbUpdateData.booking_time = updateData.time
    if (updateData.status) dbUpdateData.status = updateData.status
    if (updateData.amount) {
      const amount = Number.parseFloat(updateData.amount)
      if (isNaN(amount) || amount <= 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid amount",
          },
          { status: 400 },
        )
      }
      dbUpdateData.amount = amount
    }
    if (updateData.notes !== undefined) dbUpdateData.notes = updateData.notes?.trim() || ""

    const updatedBooking = await updateBooking(id, dbUpdateData)

    return NextResponse.json({
      success: true,
      data: updatedBooking,
      message: "Booking updated successfully",
    })
  } catch (error) {
    console.error("Error updating booking:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update booking",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = Number.parseInt(searchParams.get("id") || "0")

    if (!id || id <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Valid booking ID is required",
        },
        { status: 400 },
      )
    }

    const deletedBooking = await deleteBooking(id)

    return NextResponse.json({
      success: true,
      data: deletedBooking,
      message: "Booking deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting booking:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete booking",
      },
      { status: 500 },
    )
  }
}

async function testConnection() {
  try {
    await supabaseAdmin.from("bookings").select("*").limit(1)
    return true
  } catch (error) {
    console.error("Database connection test failed:", error)
    return false
  }
}
