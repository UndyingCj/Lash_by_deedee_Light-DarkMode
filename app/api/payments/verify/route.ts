import { type NextRequest, NextResponse } from "next/server"
import { verifyPayment } from "@/lib/paystack"
import { createBooking } from "@/lib/supabase"
import { sendBookingConfirmationEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reference } = body

    if (!reference) {
      console.error("No payment reference provided")
      return NextResponse.json(
        {
          status: false,
          success: false,
          message: "Payment reference is required",
        },
        { status: 400 },
      )
    }

    console.log("🔍 Verifying payment with reference:", reference)

    const verificationResponse = await verifyPayment(reference)

    if (!verificationResponse.status) {
      console.error("❌ Payment verification failed:", verificationResponse.message)
      return NextResponse.json(
        {
          status: false,
          success: false,
          message: verificationResponse.message || "Payment verification failed",
        },
        { status: 400 },
      )
    }

    const paymentData = verificationResponse.data

    if (!paymentData) {
      console.error("❌ No payment data found")
      return NextResponse.json(
        {
          status: false,
          success: false,
          message: "No payment data found",
        },
        { status: 400 },
      )
    }

    console.log("✅ Payment verification successful:", {
      reference: paymentData.reference,
      status: paymentData.status,
      amount: paymentData.amount,
      gateway_response: paymentData.gateway_response,
    })

    // Check if payment was successful
    if (paymentData.status !== "success") {
      console.error("❌ Payment not successful:", paymentData.status, paymentData.gateway_response)
      return NextResponse.json(
        {
          status: false,
          success: false,
          message: `Payment ${paymentData.status}. ${paymentData.gateway_response || "Please try again."}`,
        },
        { status: 400 },
      )
    }

    // Extract booking data from metadata
    const metadata = paymentData.metadata
    if (!metadata) {
      console.error("❌ No booking metadata found in payment")
      return NextResponse.json(
        {
          status: false,
          success: false,
          message: "No booking metadata found in payment",
        },
        { status: 400 },
      )
    }

    try {
      // Create booking in database
      const booking = await createBooking({
        client_name: metadata.customerName,
        phone: metadata.customerPhone,
        email: paymentData.customer.email,
        service: Array.isArray(metadata.services) ? metadata.services.join(", ") : metadata.services,
        booking_date: metadata.bookingDate,
        booking_time: metadata.bookingTime,
        status: "confirmed", // Automatically confirm paid bookings
        amount: metadata.totalAmount,
        notes:
          metadata.notes ||
          `Deposit paid: ₦${(paymentData.amount / 100).toLocaleString()}. Payment reference: ${paymentData.reference}`,
      })

      console.log("✅ Booking created successfully:", booking.id)

      // Send confirmation email
      try {
        await sendBookingConfirmationEmail({
          customerName: metadata.customerName,
          customerEmail: paymentData.customer.email,
          services: Array.isArray(metadata.services) ? metadata.services : [metadata.services],
          date: metadata.bookingDate,
          time: metadata.bookingTime,
          totalAmount: metadata.totalAmount,
          depositAmount: metadata.depositAmount,
          paymentReference: paymentData.reference,
        })
        console.log("✅ Confirmation email sent successfully")
      } catch (emailError) {
        console.error("⚠️ Failed to send confirmation email:", emailError)
        // Don't fail the entire process if email fails
      }

      return NextResponse.json({
        status: true,
        success: true,
        message: "Payment verified and booking confirmed successfully!",
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
          },
        },
      })
    } catch (bookingError) {
      console.error("❌ Failed to create booking:", bookingError)
      return NextResponse.json(
        {
          status: false,
          success: false,
          message:
            "Payment successful but failed to create booking. Please contact support with reference: " + reference,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("❌ Payment verification error:", error)
    return NextResponse.json(
      {
        status: false,
        success: false,
        message: "Internal server error during payment verification",
      },
      { status: 500 },
    )
  }
}
