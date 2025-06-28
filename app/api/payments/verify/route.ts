import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { reference } = await request.json()

    if (!reference) {
      return NextResponse.json({ error: "Payment reference is required" }, { status: 400 })
    }

    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY
    if (!paystackSecretKey) {
      return NextResponse.json({ error: "Payment configuration error" }, { status: 500 })
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
      console.error("❌ Payment verification failed:", paystackData)
      return NextResponse.json(
        {
          error: paystackData.message || "Payment verification failed",
        },
        { status: 400 },
      )
    }

    const transaction = paystackData.data

    if (transaction.status !== "success") {
      console.log("⚠️ Payment not successful:", transaction.status)
      return NextResponse.json(
        {
          error: "Payment was not successful",
        },
        { status: 400 },
      )
    }

    console.log("✅ Payment verified successfully:", reference)

    // Update booking in database
    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        payment_status: "completed",
        paid_amount: transaction.amount / 100, // Convert from kobo
        paystack_transaction_id: transaction.id,
        payment_date: new Date().toISOString(),
        status: "confirmed",
      })
      .eq("payment_reference", reference)

    if (updateError) {
      console.error("❌ Failed to update booking:", updateError)
    } else {
      console.log("✅ Booking updated successfully")
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      data: {
        reference: transaction.reference,
        amount: transaction.amount / 100,
        status: transaction.status,
      },
    })
  } catch (error) {
    console.error("❌ Payment verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
