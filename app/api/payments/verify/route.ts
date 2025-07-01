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

    // Verify payment with Paystack
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("Paystack verification error:", data)
      return NextResponse.json({ error: data.message || "Payment verification failed" }, { status: response.status })
    }

    if (data.data.status === "success") {
      // Update booking payment status
      const { error: updateError } = await supabase
        .from("bookings")
        .update({
          payment_status: "paid",
          payment_reference: reference,
          updated_at: new Date().toISOString(),
        })
        .eq("payment_reference", reference)

      if (updateError) {
        console.error("Booking update error:", updateError)
        return NextResponse.json({ error: "Failed to update booking status" }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        data: data.data,
      })
    } else {
      return NextResponse.json({ error: "Payment was not successful" }, { status: 400 })
    }
  } catch (error) {
    console.error("Payment verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
