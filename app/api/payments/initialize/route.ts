import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, amount, reference, metadata } = body

    if (!email || !amount || !reference) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY
    if (!paystackSecretKey) {
      console.error("❌ PAYSTACK_SECRET_KEY not found")
      return NextResponse.json({ error: "Payment configuration error" }, { status: 500 })
    }

    console.log("💳 Initializing payment for:", email, "Amount:", amount)

    // Initialize payment with Paystack
    const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: amount * 100, // Convert to kobo
        reference,
        metadata,
        callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/book/success`,
      }),
    })

    const paystackData = await paystackResponse.json()

    if (!paystackResponse.ok || !paystackData.status) {
      console.error("❌ Paystack initialization failed:", paystackData)
      return NextResponse.json(
        {
          error: paystackData.message || "Payment initialization failed",
        },
        { status: 400 },
      )
    }

    console.log("✅ Payment initialized successfully:", paystackData.data.reference)

    // Store booking in database
    if (metadata?.booking) {
      const booking = metadata.booking
      const { error: bookingError } = await supabase.from("bookings").insert({
        client_name: booking.clientName,
        client_email: email,
        client_phone: booking.clientPhone,
        service_type: booking.serviceType,
        appointment_date: booking.appointmentDate,
        appointment_time: booking.appointmentTime,
        total_amount: booking.totalAmount,
        deposit_amount: amount,
        payment_reference: reference,
        status: "pending",
        payment_status: "pending",
      })

      if (bookingError) {
        console.error("❌ Failed to store booking:", bookingError)
      } else {
        console.log("✅ Booking stored successfully")
      }
    }

    return NextResponse.json({
      success: true,
      data: paystackData.data,
    })
  } catch (error) {
    console.error("❌ Payment initialization error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
