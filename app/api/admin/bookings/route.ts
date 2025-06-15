import { type NextRequest, NextResponse } from "next/server"

// This would typically connect to your database
// For demo purposes, we'll use in-memory storage
const bookings = [
  {
    id: 1,
    clientName: "Sarah Johnson",
    phone: "+234 801 234 5678",
    email: "sarah@email.com",
    service: "Ombré Brows",
    date: "2024-06-15",
    time: "10:00 AM",
    status: "confirmed",
    amount: 45000,
    notes: "First time client",
    createdAt: new Date().toISOString(),
  },
  // Add more sample bookings...
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const date = searchParams.get("date")

    let filteredBookings = bookings

    if (status && status !== "all") {
      filteredBookings = filteredBookings.filter((booking) => booking.status === status)
    }

    if (date) {
      filteredBookings = filteredBookings.filter((booking) => booking.date === date)
    }

    return NextResponse.json({
      success: true,
      data: filteredBookings,
      total: filteredBookings.length,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch bookings" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const newBooking = {
      id: bookings.length + 1,
      ...body,
      createdAt: new Date().toISOString(),
    }

    bookings.push(newBooking)

    return NextResponse.json({
      success: true,
      data: newBooking,
      message: "Booking created successfully",
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to create booking" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    const bookingIndex = bookings.findIndex((booking) => booking.id === id)

    if (bookingIndex === -1) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 })
    }

    bookings[bookingIndex] = {
      ...bookings[bookingIndex],
      ...updateData,
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: bookings[bookingIndex],
      message: "Booking updated successfully",
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update booking" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = Number.parseInt(searchParams.get("id") || "0")

    const bookingIndex = bookings.findIndex((booking) => booking.id === id)

    if (bookingIndex === -1) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 })
    }

    const deletedBooking = bookings.splice(bookingIndex, 1)[0]

    return NextResponse.json({
      success: true,
      data: deletedBooking,
      message: "Booking deleted successfully",
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to delete booking" }, { status: 500 })
  }
}
