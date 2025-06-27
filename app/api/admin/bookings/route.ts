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

    // Convert selectedServices array of objects to array of service names
    const serviceNames = selectedServices.map((service: { name: string }) => service.name)

    const booking = await createBooking({
      client_name: `${firstName} ${lastName}`,
      phone,
      email,
      service: serviceNames.join(", "),
      booking_date: date,
      booking_time: time,
      status: "confirmed",
      amount: totalPrice,
      notes: notes || "",
    })

    // Send confirmation emails
    try {
      const emailBookingDetails = {
        customerName: `${firstName} ${lastName}`,
        customerEmail: email,
        services: serviceNames,
        date: date,
        time: time,
        totalAmount: totalPrice,
        depositAmount: Math.round(totalPrice * 0.5), // 50% deposit
      }

      // Send customer confirmation
      const customerEmailResult = await sendBookingConfirmation(email, {
        ...emailBookingDetails,
        paymentReference: `BOOK-${Date.now()}`,
      })

      // Send admin notification
      const adminEmailResult = await sendBookingNotificationToAdmin(emailBookingDetails)

      console.log("📧 Email results:", {
        customer: customerEmailResult ? "✅ Sent" : "❌ Failed",
        admin: adminEmailResult ? "✅ Sent" : "❌ Failed",
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
