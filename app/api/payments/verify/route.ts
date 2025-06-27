import { type NextRequest, NextResponse } from "next/server"
import { verifyPayment } from "@/lib/paystack"
import { createBooking } from "@/lib/supabase"
import { sendBookingConfirmation } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { reference } = await request.json()

    if (!reference) {
      return NextResponse.json({ status: false, message: "Payment reference is required" }, { status: 400 })
    }

    console.log("🔍 Verifying payment with reference:", reference)

    // Verify payment with Paystack
    const verificationResult = await verifyPayment(reference)

    if (!verificationResult.status) {
      console.error("❌ Payment verification failed:", verificationResult.message)
      return NextResponse.json({
        status: false,
        message: verificationResult.message || "Payment verification failed",
      })
    }

    const paymentData = verificationResult.data

    if (paymentData.status !== "success") {
      console.error("❌ Payment was not successful:", paymentData.status)
      return NextResponse.json({
        status: false,
        message: "Payment was not successful",
      })
    }

    console.log("✅ Payment verified successfully:", paymentData.reference)

    // Extract booking data from metadata
    const metadata = paymentData.metadata || {}
    const bookingData = {
      client_name: metadata.customerName || "Unknown",
      phone: metadata.customerPhone || "",
      email: paymentData.customer?.email || metadata.customerEmail || "",
      service: Array.isArray(metadata.services) ? metadata.services.join(", ") : metadata.services || "Unknown Service",
      booking_date: metadata.bookingDate || new Date().toISOString().split("T")[0],
      booking_time: metadata.bookingTime || "12:00",
      status: "confirmed" as const,
      amount: metadata.totalAmount || paymentData.amount / 100, // Convert from kobo to naira
      notes: `Deposit paid: ₦${paymentData.amount / 100}. Payment Reference: ${paymentData.reference}`,
    }

    try {
      // Create booking in database
      const booking = await createBooking(bookingData)
      console.log("✅ Booking created:", booking.id)

      // Send confirmation email
      try {
        await sendBookingConfirmation(bookingData.email, {
          customerName: bookingData.client_name,
          services: [bookingData.service],
          date: bookingData.booking_date,
          time: bookingData.booking_time,
          totalAmount: bookingData.amount,
          depositAmount: paymentData.amount / 100,
          paymentReference: paymentData.reference,
        })
        console.log("✅ Confirmation email sent")
      } catch (emailError) {
        console.error("❌ Failed to send confirmation email:", emailError)
        // Don't fail the entire process if email fails
      }

      return NextResponse.json({
        status: true,
        message: "Payment verified and booking confirmed",
        data: {
          ...paymentData,
          booking_id: booking.id,
        },
      })
    } catch (bookingError) {
      console.error("❌ Failed to create booking:", bookingError)
      return NextResponse.json({
        status: false,
        message: "Payment verified but failed to create booking. Please contact support.",
      })
    }
  } catch (error) {
    console.error("❌ Payment verification error:", error)
    return NextResponse.json({ status: false, message: "Internal server error" }, { status: 500 })
  }
}
