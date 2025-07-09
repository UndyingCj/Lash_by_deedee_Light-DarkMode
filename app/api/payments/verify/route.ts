import { type NextRequest, NextResponse } from "next/server"
import { verifyPaystackPayment } from "@/lib/paystack"
import { sendBookingConfirmationEmail, sendAdminNotificationEmail } from "@/lib/email"
import { createClient } from "@supabase/supabase-js"

// -----------------------------------------------------------------------------
// Supabase client
// -----------------------------------------------------------------------------
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || ""

const supabase = createClient(supabaseUrl, supabaseKey)

// -----------------------------------------------------------------------------
// POST /api/payments/verify
// -----------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const { reference } = await request.json()

    if (!reference) {
      return NextResponse.json({ status: "error", message: "Payment reference is required" }, { status: 400 })
    }

    // ───────────────────────────────────────────────────────────────────────────
    // 1.  Verify payment with Paystack
    // ───────────────────────────────────────────────────────────────────────────
    console.log("🔍 Verifying payment:", reference)
    const verificationResult = await verifyPaystackPayment(reference)

    if (!verificationResult.status) {
      return NextResponse.json({ status: "error", message: verificationResult.message }, { status: 400 })
    }

    const paymentData = verificationResult.data

    if (paymentData.status !== "success") {
      return NextResponse.json({ status: "error", message: "Payment was not successful" }, { status: 400 })
    }

    // ───────────────────────────────────────────────────────────────────────────
    // 2.  Persist booking
    // ───────────────────────────────────────────────────────────────────────────
    const m = paymentData.metadata
    const amountPaid = paymentData.amount / 100 // kobo → naira

    const bookingData = {
      client_name: m.customerName,
      email: paymentData.customer.email,
      phone: m.customerPhone,

      // service (single column, comma-separated list)
      service: Array.isArray(m.services) ? m.services.join(", ") : m.services,

      // schedule
      booking_date: m.bookingDate,
      booking_time: m.bookingTime,

      // money
      total_amount: m.totalAmount,
      amount: m.depositAmount,

      // status
      status: "confirmed",

      // misc
      notes: m.notes || "",
      created_at: new Date().toISOString(),
    }

    const { data: savedBooking, error: dbError } = await supabase
      .from("bookings")
      .insert([bookingData])
      .select()
      .single()

    if (dbError) {
      console.error("❌ Database error:", dbError)
      return NextResponse.json({ status: "error", message: "Failed to save booking to database" }, { status: 500 })
    }

    console.log("✅ Booking saved:", savedBooking.id)

    // ───────────────────────────────────────────────────────────────────────────
    // 3.  Emails
    // ───────────────────────────────────────────────────────────────────────────
    await Promise.allSettled([
      sendBookingConfirmationEmail({
        customerName: m.customerName,
        customerEmail: paymentData.customer.email,
        customerPhone: m.customerPhone,
        services: m.services,
        bookingDate: m.bookingDate,
        bookingTime: m.bookingTime,
        totalAmount: m.totalAmount,
        depositAmount: m.depositAmount,
        reference: paymentData.reference,
        notes: m.notes,
      }),
      sendAdminNotificationEmail({
        customerName: m.customerName,
        customerEmail: paymentData.customer.email,
        customerPhone: m.customerPhone,
        services: m.services,
        bookingDate: m.bookingDate,
        bookingTime: m.bookingTime,
        totalAmount: m.totalAmount,
        depositAmount: m.depositAmount,
        reference: paymentData.reference,
        notes: m.notes,
      }),
    ])

    // ───────────────────────────────────────────────────────────────────────────
    // 4.  Block the time slot
    // ───────────────────────────────────────────────────────────────────────────
    await supabase.from("blocked_time_slots").insert([
      {
        blocked_date: m.bookingDate,
        blocked_time: m.bookingTime,
        reason: `Booked by ${m.customerName}`,
        created_at: new Date().toISOString(),
      },
    ])

    // ───────────────────────────────────────────────────────────────────────────
    // 5.  Success response
    // ───────────────────────────────────────────────────────────────────────────
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
