import { NextResponse } from "next/server"
import { createBooking } from "@/lib/supabase"
import { sendBookingConfirmation, sendBookingNotificationToAdmin } from "@/lib/email"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { firstName, lastName, email, phone, date, time, selectedServices, totalPrice, notes } = body

    if (!firstName || !lastName || !email || !phone || !date || !time || !selectedServices || !totalPrice) {
      return new NextResponse("Missing fields", { status: 400 })
    }

    // Convert selectedServices array of objects to array of IDs
    const serviceIds = selectedServices.map((service: { id: string }) => service.id)

    // Create booking data in the format expected by createBooking
    const bookingData = {
      client_name: `${firstName} ${lastName}`,
      client_email: email,
      client_phone: phone,
      phone: phone,
      email: email,
      service_name: selectedServices.map((s: any) => s.name).join(", "),
      service: selectedServices.map((s: any) => s.name).join(", "),
      booking_date: date,
      booking_time: time,
      total_amount: totalPrice,
      amount: totalPrice,
      deposit_amount: Math.round(totalPrice * 0.5), // 50% deposit
      payment_status: "pending",
      payment_reference: `LBD_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
      special_notes: notes,
      notes: notes,
      status: "pending",
    }

    const { data: booking, error } = await createBooking(bookingData)

    if (error) {
      console.error("Supabase error creating booking:", error)
      return new NextResponse("Failed to create booking", { status: 500 })
    }

    if (!booking) {
      return new NextResponse("Failed to create booking, no data returned", { status: 500 })
    }

    // Send confirmation emails via Zoho
    try {
      const emailBookingDetails = {
        customerName: `${firstName} ${lastName}`,
        customerEmail: email,
        customerPhone: phone,
        serviceName: selectedServices.map((s: any) => s.name).join(", "),
        bookingDate: date,
        bookingTime: time,
        totalAmount: totalPrice,
        depositAmount: Math.round(totalPrice * 0.5), // 50% deposit
        paymentReference: bookingData.payment_reference,
        notes: notes,
      }

      // Send customer confirmation
      const customerEmailResult = await sendBookingConfirmation(emailBookingDetails)

      // Send admin notification
      const adminEmailResult = await sendBookingNotificationToAdmin(emailBookingDetails)

      console.log("📧 Zoho email results:", {
        customer: customerEmailResult.success ? "✅ Sent" : "❌ Failed",
        admin: adminEmailResult.success ? "✅ Sent" : "❌ Failed",
      })
    } catch (emailError) {
      console.error("📧 Zoho email sending failed:", emailError)
      // Don't fail the booking if emails fail - booking is still created
    }

    return NextResponse.json(booking)
  } catch (error) {
    console.log("[BOOKING_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function GET() {
  try {
    // This would typically fetch bookings from the database
    // For now, return an empty array
    return NextResponse.json([])
  } catch (error) {
    console.log("[BOOKING_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
