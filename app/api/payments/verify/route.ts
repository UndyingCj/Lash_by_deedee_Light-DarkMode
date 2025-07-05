import { type NextRequest, NextResponse } from "next/server"
import { verifyPayment } from "@/lib/paystack"
import { createBooking } from "@/lib/supabase"
import { sendBookingConfirmation } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reference } = body

    if (!reference) {
      return NextResponse.json({ status: false, message: "Payment reference is required" }, { status: 400 })
    }

    console.log("🔍 Verifying payment with reference:", reference)

    const verificationResponse = await verifyPayment(reference)

    if (!verificationResponse.status) {
      console.error("❌ Payment verification failed:", verificationResponse.message)
      return NextResponse.json(
        { status: false, message: verificationResponse.message || "Payment verification failed" },
        { status: 400 },
      )
    }

    const paymentData = verificationResponse.data

    if (!paymentData) {
      return NextResponse.json({ status: false, message: "No payment data found" }, { status: 400 })
    }

    console.log("✅ Payment verification successful:", {
      reference: paymentData.reference,
      status: paymentData.status,
      amount: paymentData.amount,
    })

    // Check if payment was successful
    if (paymentData.status !== "success") {
      return NextResponse.json(
        { status: false, message: `Payment ${paymentData.status}. ${paymentData.gateway_response || ""}` },
        { status: 400 },
      )
    }

    // Extract booking data from metadata
    const metadata = paymentData.metadata
    if (!metadata) {
      return NextResponse.json({ status: false, message: "No booking metadata found in payment" }, { status: 400 })
    }

    console.log("📋 Booking metadata:", metadata)

    try {
      // Format the booking data properly for the database
      const bookingData = {
        client_name: String(metadata.customerName || ""),
        phone: String(metadata.customerPhone || ""),
        email: String(paymentData.customer?.email || ""),
        service: Array.isArray(metadata.services) ? metadata.services.join(", ") : String(metadata.services || ""),
        booking_date: String(metadata.bookingDate || ""),
        booking_time: String(metadata.bookingTime || ""),
        status: "confirmed" as const,
        amount: Number(metadata.totalAmount) || Math.floor(paymentData.amount / 100),
        notes: String(
          metadata.notes ||
            `Deposit paid: ₦${Math.floor(paymentData.amount / 100).toLocaleString()}. Payment reference: ${paymentData.reference}`,
        ),
      }

      console.log("💾 Creating booking with data:", bookingData)

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

      // Create booking in database
      const booking = await createBooking(bookingData)

      console.log("✅ Booking created successfully:", booking.id)

      // Send confirmation email (don't fail if this fails)
      try {
        await sendBookingConfirmation({
          customerName: bookingData.client_name,
          customerEmail: bookingData.email,
          services: Array.isArray(metadata.services) ? metadata.services : [String(metadata.services)],
          date: bookingData.booking_date,
          time: bookingData.booking_time,
          totalAmount: bookingData.amount,
          depositAmount: Math.floor(paymentData.amount / 100),
          paymentReference: paymentData.reference,
        })
        console.log("📧 Confirmation email sent successfully")
      } catch (emailError) {
        console.error("📧 Email sending failed:", emailError)
        // Don't fail the entire process if emails fail
      }

      return NextResponse.json({
        status: true,
        message: "Payment verified and booking confirmed successfully",
        data: {
          payment: {
            reference: paymentData.reference,
            amount: paymentData.amount,
            status: paymentData.status,
            paid_at: paymentData.paid_at,
          },
          booking: {
            id: booking.id,
            status: booking.status,
            client_name: booking.client_name,
            booking_date: booking.booking_date,
            booking_time: booking.booking_time,
          },
        },
      })
    } catch (bookingError) {
      console.error("❌ Failed to create booking:", bookingError)

      const errorMessage = "Payment successful but failed to create booking. Please contact support."

      if (bookingError instanceof Error) {
        console.error("Booking error details:", bookingError.message)
        console.error("Booking error stack:", bookingError.stack)
      }

      return NextResponse.json(
        {
          status: false,
          message: errorMessage,
          paymentReference: paymentData.reference,
          supportInfo: "Please contact support with this payment reference for assistance.",
          error: bookingError instanceof Error ? bookingError.message : "Unknown error",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("💥 Payment verification error:", error)
    return NextResponse.json(
      { status: false, message: "Internal server error during payment verification" },
      { status: 500 },
    )
  }
}
