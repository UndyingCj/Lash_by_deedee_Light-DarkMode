import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest) {
  try {
    const { reference } = await request.json()

    if (!reference) {
      return NextResponse.json({ error: "Payment reference is required" }, { status: 400 })
    }

    console.log("🔍 Verifying payment:", reference)

    // Check if we have Paystack credentials
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY

    if (!paystackSecretKey) {
      console.error("❌ Paystack secret key not configured")
      return NextResponse.json({ error: "Payment system not configured" }, { status: 503 })
    }

    // Verify payment with Paystack
    const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
    })

    const paystackData = await paystackResponse.json()

    if (!paystackResponse.ok || !paystackData.status) {
      console.error("❌ Paystack verification failed:", paystackData)
      return NextResponse.json({ error: paystackData.message || "Payment verification failed" }, { status: 400 })
    }

    const transaction = paystackData.data

    if (transaction.status !== "success") {
      console.log("❌ Payment not successful:", transaction.status)
      return NextResponse.json({ error: "Payment was not successful" }, { status: 400 })
    }

    console.log("✅ Payment verified successfully:", reference)

    // Try to save to database if available
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey)

      // Save booking to database
      const bookingData = {
        client_name: transaction.metadata?.client_name || "Unknown",
        client_email: transaction.customer?.email || "unknown@email.com",
        client_phone: transaction.metadata?.client_phone || "",
        service_type: transaction.metadata?.service_type || "Unknown Service",
        appointment_date: transaction.metadata?.appointment_date || new Date().toISOString().split("T")[0],
        appointment_time: transaction.metadata?.appointment_time || "09:00",
        total_amount: transaction.amount / 100, // Convert from kobo
        deposit_amount: transaction.amount / 100,
        paid_amount: transaction.amount / 100,
        status: "confirmed",
        payment_status: "paid",
        payment_reference: reference,
        paystack_transaction_id: transaction.id,
        payment_date: new Date().toISOString(),
        notes: transaction.metadata?.notes || "",
      }

      const { error: bookingError } = await supabase.from("bookings").insert(bookingData)

      if (bookingError) {
        console.error("❌ Failed to save booking:", bookingError)
        // Don't fail the verification if database save fails
      } else {
        console.log("✅ Booking saved to database")
      }
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      data: {
        reference: transaction.reference,
        amount: transaction.amount / 100,
        status: transaction.status,
        paid_at: transaction.paid_at,
        customer: transaction.customer,
        metadata: transaction.metadata,
      },
    })
  } catch (error) {
    console.error("❌ Payment verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
