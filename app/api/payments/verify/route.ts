import { type NextRequest, NextResponse } from "next/server"
import { verifyPaystackPayment } from "@/lib/paystack"
import { createBooking } from "@/lib/supabase"
import { sendBookingConfirmationEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { reference } = await request.json()

    if (!reference) {
      return NextResponse.json(
        {
          status: false,
          message: "Payment reference is required",
        },
        { status: 400 },
      )
    }

    console.log("🔍 Verifying payment:", reference)

    // Verify payment with Paystack
    const verificationResult = await verifyPaystackPayment(reference)

    if (!verificationResult.status) {
      console.error("❌ Payment verification failed:", verificationResult.message)
      return NextResponse.json(
        {
          status: false,
          message: verificationResult.message,
        },
        { status: 400 },
      )
    }

    const paymentData = verificationResult.data
    console.log("✅ Payment verified, creating booking...")

    // Extract booking data from payment metadata
    const metadata = paymentData.metadata || {}

    const bookingData = {
      client_name: metadata.customerName || "Unknown Customer",
      client_email: metadata.customerEmail || paymentData.customer.email,
      client_phone: metadata.customerPhone || "",
      phone: metadata.customerPhone || "",
      email: metadata.customerEmail || paymentData.customer.email,
      service_name: Array.isArray(metadata.services)
        ? metadata.services.join(", ")
        : metadata.services || "Unknown Service",
      service: Array.isArray(metadata.services) ? metadata.services.join(", ") : metadata.services || "Unknown Service",
      booking_date: metadata.bookingDate || new Date().toISOString().split("T")[0],
      booking_time: metadata.bookingTime || "12:00",
      total_amount: Number.parseFloat(metadata.totalAmount || "0"),
      amount: Number.parseFloat(metadata.totalAmount || "0"),
      deposit_amount: Number.parseFloat(metadata.depositAmount || "0"),
      payment_status: "paid",
      payment_reference: reference,
      special_notes: metadata.notes || "",
      notes: metadata.notes || "",
      status: "confirmed",
    }

    console.log("📝 Creating booking with data:", bookingData)

    // Create booking in database
    const bookingResult = await createBooking(bookingData)

    if (!bookingResult.success) {
      console.error("❌ Failed to create booking:", bookingResult.error)
      return NextResponse.json(
        {
          status: false,
          message: `Payment successful but failed to create booking: ${bookingResult.error}`,
        },
        { status: 500 },
      )
    }

    console.log("✅ Booking created successfully")

    // Send confirmation email
    try {
      await sendBookingConfirmationEmail({
        customerName: bookingData.client_name,
        customerEmail: bookingData.client_email,
        services: [bookingData.service_name],
        bookingDate: bookingData.booking_date,
        bookingTime: bookingData.booking_time,
        totalAmount: bookingData.total_amount,
        depositAmount: bookingData.deposit_amount,
        paymentReference: reference,
      })
      console.log("✅ Confirmation email sent")
    } catch (emailError) {
      console.error("⚠️ Failed to send confirmation email:", emailError)
      // Don't fail the entire process if email fails
    }

    return NextResponse.json({
      status: true,
      message: "Payment verified and booking created successfully",
      data: {
        paymentReference: reference,
        bookingId: bookingResult.data.id,
        amount: paymentData.amount / 100, // Convert from kobo to naira
      },
    })
  } catch (error) {
    console.error("❌ Payment verification error:", error)
    return NextResponse.json(
      {
        status: false,
        message: error instanceof Error ? error.message : "Payment verification failed",
      },
      { status: 500 },
    )
  }
}
