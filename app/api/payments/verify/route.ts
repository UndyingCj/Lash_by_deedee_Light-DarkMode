import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { sendBookingConfirmation } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { reference, bookingData } = await request.json()

    if (!reference) {
      return NextResponse.json({ success: false, message: "Payment reference is required" }, { status: 400 })
    }

    console.log("💳 Verifying payment with reference:", reference)

    // Verify payment with Paystack
    const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    })

    if (!paystackResponse.ok) {
      console.error("❌ Paystack API error:", paystackResponse.status)
      return NextResponse.json({ success: false, message: "Payment verification failed" }, { status: 400 })
    }

    const paystackData = await paystackResponse.json()

    if (!paystackData.status || paystackData.data.status !== "success") {
      console.log("❌ Payment not successful:", paystackData.data.status)
      return NextResponse.json({ success: false, message: "Payment was not successful" }, { status: 400 })
    }

    console.log("✅ Payment verified successfully")

    // Create booking in database
    const bookingRecord = {
      client_name: bookingData.clientName,
      client_email: bookingData.clientEmail,
      client_phone: bookingData.clientPhone,
      service_type: bookingData.serviceType,
      service_name: bookingData.serviceName,
      appointment_date: bookingData.appointmentDate,
      appointment_time: bookingData.appointmentTime,
      total_amount: paystackData.data.amount / 100, // Convert from kobo to naira
      deposit_amount: bookingData.depositAmount,
      payment_status: "paid",
      payment_reference: reference,
      payment_method: paystackData.data.channel,
      booking_status: "confirmed",
      special_notes: bookingData.specialNotes || null,
      created_at: new Date().toISOString(),
    }

    const { data: booking, error: bookingError } = await supabaseAdmin
      .from("bookings")
      .insert(bookingRecord)
      .select()
      .single()

    if (bookingError) {
      console.error("❌ Error creating booking:", bookingError)
      return NextResponse.json({ success: false, message: "Failed to create booking" }, { status: 500 })
    }

    console.log("✅ Booking created successfully:", booking.id)

    // Send confirmation email
    try {
      await sendBookingConfirmation(bookingData.clientEmail, {
        bookingId: booking.id,
        clientName: bookingData.clientName,
        serviceName: bookingData.serviceName,
        appointmentDate: bookingData.appointmentDate,
        appointmentTime: bookingData.appointmentTime,
        totalAmount: booking.total_amount,
        depositAmount: booking.deposit_amount,
      })
      console.log("✅ Confirmation email sent to:", bookingData.clientEmail)
    } catch (emailError) {
      console.error("❌ Error sending confirmation email:", emailError)
      // Don't fail the booking if email fails
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified and booking confirmed",
      booking: {
        id: booking.id,
        reference: reference,
        amount: booking.total_amount,
        status: "confirmed",
      },
    })
  } catch (error) {
    console.error("❌ Payment verification error:", error)
    return NextResponse.json({ success: false, message: "Payment verification failed" }, { status: 500 })
  }
}
