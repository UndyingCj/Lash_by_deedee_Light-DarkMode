import { type NextRequest, NextResponse } from "next/server"
import { verifyPayment } from "@/lib/paystack"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function POST(request: NextRequest) {
  try {
    const { reference } = await request.json()

    if (!reference) {
      return NextResponse.json({ error: "Payment reference is required" }, { status: 400 })
    }

    // Verify payment with Paystack
    const verification = await verifyPayment(reference)

    if (!verification.status || verification.data.status !== "success") {
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 })
    }

    // Update booking status
    const { data: booking, error: updateError } = await supabaseAdmin
      .from("bookings")
      .update({
        status: "confirmed",
        payment_status: "paid",
        payment_verified_at: new Date().toISOString(),
      })
      .eq("payment_reference", reference)
      .select()
      .single()

    if (updateError) {
      console.error("Booking update error:", updateError)
      return NextResponse.json({ error: "Failed to update booking" }, { status: 500 })
    }

    // Send confirmation email (optional)
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/emails/booking-confirmation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ booking }),
      })
    } catch (emailError) {
      console.error("Email sending error:", emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      data: {
        booking,
        payment: verification.data,
      },
    })
  } catch (error) {
    console.error("Payment verification error:", error)
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 })
  }
}
