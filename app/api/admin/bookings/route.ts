import { type NextRequest, NextResponse } from "next/server"
import { getBookings, createBooking, updateBooking, deleteBooking } from "@/lib/supabase"

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
    return NextResponse.json({ success: false, error: "Failed to fetch bookings" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const newBooking = await createBooking({
      client_name: body.clientName,
      phone: body.phone,
      email: body.email,
      service: body.service,
      booking_date: body.date,
      booking_time: body.time,
      status: body.status || "pending",
      amount: Number.parseFloat(body.amount),
      notes: body.notes || "",
    })

    return NextResponse.json({
      success: true,
      data: newBooking,
      message: "Booking created successfully",
    })
  } catch (error) {
    console.error("Error creating booking:", error)
    return NextResponse.json({ success: false, error: "Failed to create booking" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    // Convert camelCase to snake_case for database
    const dbUpdateData: any = {}
    if (updateData.clientName) dbUpdateData.client_name = updateData.clientName
    if (updateData.phone) dbUpdateData.phone = updateData.phone
    if (updateData.email) dbUpdateData.email = updateData.email
    if (updateData.service) dbUpdateData.service = updateData.service
    if (updateData.date) dbUpdateData.booking_date = updateData.date
    if (updateData.time) dbUpdateData.booking_time = updateData.time
    if (updateData.status) dbUpdateData.status = updateData.status
    if (updateData.amount) dbUpdateData.amount = Number.parseFloat(updateData.amount)
    if (updateData.notes !== undefined) dbUpdateData.notes = updateData.notes

    const updatedBooking = await updateBooking(id, dbUpdateData)

    return NextResponse.json({
      success: true,
      data: updatedBooking,
      message: "Booking updated successfully",
    })
  } catch (error) {
    console.error("Error updating booking:", error)
    return NextResponse.json({ success: false, error: "Failed to update booking" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = Number.parseInt(searchParams.get("id") || "0")

    const deletedBooking = await deleteBooking(id)

    return NextResponse.json({
      success: true,
      data: deletedBooking,
      message: "Booking deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting booking:", error)
    return NextResponse.json({ success: false, error: "Failed to delete booking" }, { status: 500 })
  }
}
