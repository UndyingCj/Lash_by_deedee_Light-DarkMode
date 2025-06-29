import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest) {
  try {
    const { reference } = await request.json()

    if (!reference) {
      return NextResponse.json({ error: "Payment reference is required" }, { status: 400 })
    }

    // Check if we have Paystack credentials
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY
    if (!paystackSecretKey) {
      console.error("❌ Missing Paystack secret key")
      return NextResponse.json({ error: "Payment system not configured" }, { status: 503 })
    }

    console.log("🔍 Verifying payment:", reference)

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

    // Update booking in database
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey)

      const { error: updateError } = await supabase
        .from("bookings")
        .update({
          payment_status: "completed",
          status: "confirmed",
          updated_at: new Date().toISOString(),
        })
        .eq("payment_reference", reference)

      if (updateError) {
        console.error("❌ Failed to update booking:", updateError)
        // Continue anyway, payment was successful
      } else {
        console.log("✅ Booking updated successfully")
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        reference: transaction.reference,
        amount: transaction.amount / 100, // Convert from kobo to naira
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
