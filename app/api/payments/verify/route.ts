import { type NextRequest, NextResponse } from "next/server"
import { createBooking } from "@/lib/supabase"
import { sendBookingConfirmation } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { reference, bookingData } = await request.json()

    if (!reference || !bookingData) {
      return NextResponse.json({ success: false, error: "Missing required data" }, { status: 400 })
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
      return NextResponse.json({ success: false, error: "Payment verification failed" }, { status: 400 })
    }

    // Create booking in database
    const booking = await createBooking({
      client_name: bookingData.clientName,
      phone: bookingData.phone,
      email: bookingData.email,
      service: bookingData.services.join(", "),
      booking_date: bookingData.date,
      booking_time: bookingData.time,
      status: "confirmed",
      amount: paystackData.data.amount / 100, // Convert from kobo to naira
      notes: bookingData.notes || "",
    })

    // Send confirmation email
    try {
      await sendBookingConfirmation(bookingData.email, {
        customerName: bookingData.clientName,
        services: bookingData.services,
        date: bookingData.date,
        time: bookingData.time,
        totalAmount: paystackData.data.amount / 100,
        depositAmount: paystackData.data.amount / 100,
        paymentReference: reference,
      })
    } catch (emailError) {
      console.error("Error sending confirmation email:", emailError)
      // Don't fail the booking if email fails
    }

    return NextResponse.json({
      success: true,
      booking,
      message: "Payment verified and booking confirmed",
    })
  } catch (error) {
    console.error("Payment verification error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
