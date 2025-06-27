import { type NextRequest, NextResponse } from "next/server"
import { createBooking } from "@/lib/supabase"
import { sendBookingConfirmation, sendBookingNotificationToAdmin } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { reference, bookingData } = await request.json()

    if (!reference || !bookingData) {
      return NextResponse.json({ error: "Missing reference or booking data" }, { status: 400 })
    }

    // Verify payment with Paystack
    const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    })

    const paystackData = await paystackResponse.json()

    if (!paystackData.status || paystackData.data.status !== "success") {
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 })
    }

    // Create booking in database
    const booking = await createBooking({
      client_name: `${bookingData.firstName} ${bookingData.lastName}`,
      phone: bookingData.phone,
      email: bookingData.email,
      service: bookingData.selectedServices.map((s: any) => s.name).join(", "),
      booking_date: bookingData.date,
      booking_time: bookingData.time,
      status: "confirmed",
      amount: paystackData.data.amount / 100, // Convert from kobo to naira
      notes: bookingData.notes || "",
    })

    // Send confirmation emails
    try {
      const emailBookingDetails = {
        customerName: `${bookingData.firstName} ${bookingData.lastName}`,
        customerEmail: bookingData.email,
        services: bookingData.selectedServices.map((s: any) => s.name),
        date: bookingData.date,
        time: bookingData.time,
        totalAmount: bookingData.totalPrice,
        depositAmount: paystackData.data.amount / 100,
        paymentReference: reference,
      }

      // Send customer confirmation
      await sendBookingConfirmation(bookingData.email, emailBookingDetails)

      // Send admin notification
      await sendBookingNotificationToAdmin(emailBookingDetails)
    } catch (emailError) {
      console.error("Email sending failed:", emailError)
      // Don't fail the booking if emails fail
    }

    return NextResponse.json({
      success: true,
      booking,
      message: "Payment verified and booking created successfully",
    })
  } catch (error) {
    console.error("Payment verification error:", error)
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 })
  }
}
