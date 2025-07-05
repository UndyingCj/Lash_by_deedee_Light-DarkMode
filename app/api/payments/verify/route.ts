import { type NextRequest, NextResponse } from "next/server"
import { verifyPayment } from "@/lib/paystack"
import { createBooking } from "@/lib/supabase"
import { sendBookingConfirmation, sendBookingNotificationToAdmin } from "@/lib/email"

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
        { status: false, message: `Payment ${paymentData.status}. ${paymentData.gateway_response}` },
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
        client_name: metadata.customerName,
        phone: metadata.customerPhone,
        email: paymentData.customer.email,
        service: Array.isArray(metadata.services) ? metadata.services.join(", ") : metadata.services,
        booking_date: metadata.bookingDate,
        booking_time: metadata.bookingTime,
        status: "confirmed" as const, // Automatically confirm paid bookings
        amount: metadata.totalAmount || paymentData.amount / 100, // Convert from kobo if needed
        notes:
          metadata.notes ||
          `Deposit paid: ₦${(paymentData.amount / 100).toLocaleString()}. Payment reference: ${paymentData.reference}`,
      }

      console.log("💾 Creating booking with data:", bookingData)

      // Create booking in database
      const booking = await createBooking(bookingData)

      console.log("✅ Booking created successfully:", booking.id)

      // Send confirmation emails
      try {
        const emailBookingDetails = {
          customerName: metadata.customerName,
          customerEmail: paymentData.customer.email,
          services: Array.isArray(metadata.services) ? metadata.services : [metadata.services],
          date: metadata.bookingDate,
          time: metadata.bookingTime,
          totalAmount: metadata.totalAmount,
          depositAmount: metadata.depositAmount,
          paymentReference: paymentData.reference,
        }

        // Send customer confirmation
        const customerEmailResult = await sendBookingConfirmation(emailBookingDetails)
        console.log("📧 Customer email result:", customerEmailResult.success ? "✅ Sent" : "❌ Failed")

        // Send admin notification
        const adminEmailResult = await sendBookingNotificationToAdmin(emailBookingDetails)
        console.log("📧 Admin email result:", adminEmailResult.success ? "✅ Sent" : "❌ Failed")
      } catch (emailError) {
        console.error("📧 Email sending failed:", emailError)
        // Don't fail the entire process if emails fail - booking is still created
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

      // Provide more specific error information
      let errorMessage = "Payment successful but failed to create booking. Please contact support."

      if (bookingError instanceof Error) {
        console.error("Booking error details:", bookingError.message)
        // Don't expose internal error details to the user, but log them
        if (bookingError.message.includes("duplicate") || bookingError.message.includes("unique")) {
          errorMessage = "This booking may already exist. Please contact support to verify your booking status."
        } else if (bookingError.message.includes("foreign key") || bookingError.message.includes("constraint")) {
          errorMessage = "There was a data validation error. Please contact support with your payment reference."
        }
      }

      return NextResponse.json(
        {
          status: false,
          message: errorMessage,
          paymentReference: paymentData.reference,
          supportInfo: "Please contact support with this payment reference for assistance.",
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
