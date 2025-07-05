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
      // Create booking in database with safe data handling
      const bookingData = {
        client_name: String(metadata.customerName || ""),
        phone: String(metadata.customerPhone || ""),
        email: String(paymentData.data.customer?.email || ""),
        service: Array.isArray(metadata.services) ? metadata.services.join(", ") : String(metadata.services || ""),
        booking_date: String(metadata.bookingDate || ""),
        booking_time: String(metadata.bookingTime || ""),
        status: "confirmed" as const,
        amount: Number(metadata.totalAmount) || Math.floor(paymentData.data.amount / 100),
        notes: `Payment Reference: ${reference} | Deposit Paid: ₦${Math.floor(paymentData.data.amount / 100).toLocaleString()}${metadata.notes ? ` | ${metadata.notes}` : ""}`,
      }

      console.log("Creating booking with data:", bookingData)

      // Validate required fields
      if (
        !bookingData.client_name ||
        !bookingData.email ||
        !bookingData.service ||
        !bookingData.booking_date ||
        !bookingData.booking_time
      ) {
        throw new Error("Missing required booking data fields")
      }

      const booking = await createBooking(bookingData)
      console.log("Booking created successfully:", booking.id)

      // Send confirmation email (don't fail if this fails)
      try {
        await sendBookingConfirmation({
          customerName: bookingData.client_name,
          customerEmail: bookingData.email,
          services: Array.isArray(metadata.services) ? metadata.services : [String(metadata.services)],
          bookingDate: bookingData.booking_date,
          bookingTime: bookingData.booking_time,
          totalAmount: bookingData.amount,
          depositAmount: Math.floor(paymentData.data.amount / 100),
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
          amount_paid: Math.floor(paymentData.data.amount / 100),
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
