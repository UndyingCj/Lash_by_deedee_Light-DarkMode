import { type NextRequest, NextResponse } from "next/server"
import { verifyPayment } from "@/lib/paystack"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reference } = body

    if (!reference) {
      return NextResponse.json({ error: "Payment reference is required" }, { status: 400 })
    }

    // Verify payment with Paystack
    const verification = await verifyPayment(reference)

    if (!verification.status || verification.data.status !== "success") {
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 })
    }

    // Update booking status in database
    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        payment_status: "paid",
        payment_reference: reference,
        updated_at: new Date().toISOString(),
      })
      .eq("payment_reference", reference)

    if (updateError) {
      console.error("Error updating booking:", updateError)
    }

    return NextResponse.json({
      success: true,
      data: verification.data,
    })
  } catch (error) {
    console.error("Payment verification error:", error)
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 })
  }
}
