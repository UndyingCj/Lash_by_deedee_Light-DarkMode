import { type NextRequest, NextResponse } from "next/server"
import { verifyPaystackPayment } from "@/lib/paystack"
import { createBooking } from "@/lib/supabase"
import { sendBookingConfirmation } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { reference } = await request.json()

    if (!reference) {
      return NextResponse.json({ status: false, message: "Payment reference is required" }, { status: 400 })
    }

    console.log("Verifying payment with reference:", reference)

    // Verify payment with Paystack
    const paymentData = await verifyPaystackPayment(reference)

    if (!paymentData.status) {
      console.error("Payment verification failed:", paymentData.message)
      return NextResponse.json(
        {
          status: false,
          message: paymentData.message || "Payment verification failed",
        },
        { status: 400 },
      )
    }

    console.log("Payment verified successfully:", paymentData.data)

    // Extract booking data from payment metadata
    const metadata = paymentData.data.metadata
    if (!metadata) {
      console.error("No metadata found in payment data")
      return NextResponse.json(
        {
          status: false,
          message: "Payment metadata not found",
        },
        { status: 400 },
      )
    }

    try {
      // Create booking in database
      const bookingData = {
        client_name: metadata.customerName,
        phone: metadata.customerPhone,
        email: paymentData.data.customer.email,
        service: Array.isArray(metadata.services) ? metadata.services.join(", ") : metadata.services,
        booking_date: metadata.bookingDate,
        booking_time: metadata.bookingTime,
        status: "confirmed" as const,
        amount: metadata.totalAmount || paymentData.data.amount / 100,
        notes: `Payment Reference: ${reference} | Deposit Paid: ₦${(paymentData.data.amount / 100).toLocaleString()} | ${metadata.notes || ""}`,
      }

      console.log("Creating booking with data:", bookingData)

      const booking = await createBooking(bookingData)
      console.log("Booking created successfully:", booking.id)

      // Send confirmation email
      try {
        await sendBookingConfirmation({
          customerName: bookingData.client_name,
          customerEmail: bookingData.email,
          services: Array.isArray(metadata.services) ? metadata.services : [metadata.services],
          bookingDate: bookingData.booking_date,
          bookingTime: bookingData.booking_time,
          totalAmount: bookingData.amount,
          depositAmount: paymentData.data.amount / 100,
          paymentReference: reference,
        })
        console.log("Confirmation email sent successfully")
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError)
        // Don't fail the entire process if email fails
      }

      return NextResponse.json({
        status: true,
        message: "Payment verified and booking created successfully",
        data: {
          booking_id: booking.id,
          payment_reference: reference,
          amount_paid: paymentData.data.amount / 100,
        },
      })
    } catch (bookingError) {
      console.error("Failed to create booking:", bookingError)
      return NextResponse.json(
        {
          status: false,
          message: `Payment successful but failed to create booking: ${bookingError instanceof Error ? bookingError.message : "Unknown error"}`,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Payment verification error:", error)
    return NextResponse.json(
      {
        status: false,
        message: `Payment verification failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
