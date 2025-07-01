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

    const { data: booking, error } = await createBooking({
      firstName,
      lastName,
      email,
      phone,
      date,
      time,
      service_ids: serviceIds, // Use service_ids here
      totalPrice,
      notes,
    })

    if (error) {
      console.error("Supabase error creating booking:", error)
      return new NextResponse("Failed to create booking", { status: 500 })
    }

    if (!booking) {
      return new NextResponse("Failed to create booking, no data returned", { status: 500 })
    }

    // Send confirmation emails
    try {
      const emailBookingDetails = {
        customerName: `${firstName} ${lastName}`,
        customerEmail: email,
        services: selectedServices.map((s) => s.name),
        date: date,
        time: time,
        totalAmount: totalPrice,
        depositAmount: Math.round(totalPrice * 0.5), // 50% deposit
      }

      // Send customer confirmation
      const customerEmailResult = await sendBookingConfirmation(emailBookingDetails)

      // Send admin notification
      const adminEmailResult = await sendBookingNotificationToAdmin(emailBookingDetails)

      console.log("📧 Email results:", {
        customer: customerEmailResult.success ? "✅ Sent" : "❌ Failed",
        admin: adminEmailResult.success ? "✅ Sent" : "❌ Failed",
      })
    } catch (emailError) {
      console.error("📧 Email sending failed:", emailError)
      // Don't fail the booking if emails fail - booking is still created
    }

    return NextResponse.json(booking)
  } catch (error) {
    console.log("[BOOKING_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
