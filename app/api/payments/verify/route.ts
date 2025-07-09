import { type NextRequest, NextResponse } from "next/server"
import { verifyPaystackPayment } from "@/lib/paystack"
import { sendBookingConfirmationEmail, sendAdminNotificationEmail } from "@/lib/email"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE_KEY || "")

export async function POST(request: NextRequest) {
  try {
    const { reference } = await request.json()

    if (!reference) {
      return NextResponse.json(
        {
          status: "error",
          message: "Payment reference is required",
        },
        { status: 400 },
      )
    }

    console.log("🔍 Verifying payment:", reference)

    // Verify payment with Paystack
    const verificationResult = await verifyPaystackPayment(reference)

    if (!verificationResult.status) {
      return NextResponse.json(
        {
          status: "error",
          message: verificationResult.message,
        },
        { status: 400 },
      )
    }

    const paymentData = verificationResult.data

    // Check if payment was successful
    if (paymentData.status !== "success") {
      return NextResponse.json(
        {
          status: "error",
          message: "Payment was not successful",
        },
        { status: 400 },
      )
    }

    // Extract booking data from metadata
    const metadata = paymentData.metadata
    const amountPaid = paymentData.amount / 100 // Convert from kobo to naira

    console.log("💰 Payment verified successfully:", {
      reference: paymentData.reference,
      amount: amountPaid,
      customer: metadata.customerName,
    })

    // Save booking to database
    const bookingData = {
      customer_name: metadata.customerName,
      customer_email: paymentData.customer.email,
      customer_phone: metadata.customerPhone,
      services: metadata.services,
      booking_date: metadata.bookingDate,
      booking_time: metadata.bookingTime,
      total_amount: metadata.totalAmount,
      deposit_amount: metadata.depositAmount,
      payment_reference: paymentData.reference,
      payment_status: "completed",
      booking_status: "confirmed",
      notes: metadata.notes || "",
      created_at: new Date().toISOString(),
    }

    const { data: savedBooking, error: dbError } = await supabase
      .from("bookings")
      .insert([bookingData])
      .select()
      .single()

    if (dbError) {
      console.error("❌ Database error:", dbError)
      return NextResponse.json(
        {
          status: "error",
          message: "Failed to save booking to database",
        },
        { status: 500 },
      )
    }

    console.log("✅ Booking saved to database:", savedBooking.id)

    // Send confirmation email to customer
    try {
      await sendBookingConfirmationEmail({
        customerName: metadata.customerName,
        customerEmail: paymentData.customer.email,
        customerPhone: metadata.customerPhone,
        services: metadata.services,
        bookingDate: metadata.bookingDate,
        bookingTime: metadata.bookingTime,
        totalAmount: metadata.totalAmount,
        depositAmount: metadata.depositAmount,
        reference: paymentData.reference,
        notes: metadata.notes,
      })
      console.log("✅ Customer confirmation email sent")
    } catch (emailError) {
      console.error("❌ Customer email error:", emailError)
      // Don't fail the verification if email fails
    }

    // Send notification email to admin
    try {
      await sendAdminNotificationEmail({
        customerName: metadata.customerName,
        customerEmail: paymentData.customer.email,
        customerPhone: metadata.customerPhone,
        services: metadata.services,
        bookingDate: metadata.bookingDate,
        bookingTime: metadata.bookingTime,
        totalAmount: metadata.totalAmount,
        depositAmount: metadata.depositAmount,
        reference: paymentData.reference,
        notes: metadata.notes,
      })
      console.log("✅ Admin notification email sent")
    } catch (emailError) {
      console.error("❌ Admin email error:", emailError)
      // Don't fail the verification if email fails
    }

    // Block the time slot
    try {
      const { error: blockError } = await supabase.from("blocked_time_slots").insert([
        {
          blocked_date: metadata.bookingDate,
          blocked_time: metadata.bookingTime,
          reason: `Booked by ${metadata.customerName}`,
          created_at: new Date().toISOString(),
        },
      ])

      if (blockError) {
        console.error("❌ Error blocking time slot:", blockError)
      } else {
        console.log("✅ Time slot blocked successfully")
      }
    } catch (blockError) {
      console.error("❌ Time slot blocking error:", blockError)
    }

    // Return success response in the expected format
    return NextResponse.json({
      status: "ok",
      message: "Payment verified and booking confirmed",
      data: {
        reference: paymentData.reference,
        amount: amountPaid,
        customer: paymentData.customer,
        booking: savedBooking,
      },
    })
  } catch (error) {
    console.error("❌ Payment verification error:", error)
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Payment verification failed",
      },
      { status: 500 },
    )
  }
}
