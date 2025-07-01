import { type NextRequest, NextResponse } from "next/server"
import { initializePayment, generateReference } from "@/lib/paystack"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function POST(request: NextRequest) {
  try {
    const { email, amount, service, date, time, clientName, clientPhone } = await request.json()

    if (!email || !amount || !service || !date || !time) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Generate unique reference
    const reference = generateReference()

    // Initialize payment with Paystack
    const paymentData = await initializePayment({
      email,
      amount,
      reference,
      callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/book/success`,
      metadata: {
        service,
        date,
        time,
        clientName,
        clientPhone,
      },
    })

    // Store booking in database with pending status
    const { error: bookingError } = await supabaseAdmin.from("bookings").insert({
      client_name: clientName,
      client_email: email,
      client_phone: clientPhone,
      service_type: service,
      appointment_date: date,
      appointment_time: time,
      status: "pending_payment",
      payment_reference: reference,
      payment_amount: amount,
      created_at: new Date().toISOString(),
    })

    if (bookingError) {
      console.error("Booking creation error:", bookingError)
      return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        authorization_url: paymentData.data.authorization_url,
        reference: paymentData.data.reference,
      },
    })
  } catch (error) {
    console.error("Payment initialization error:", error)
    return NextResponse.json({ error: "Failed to initialize payment" }, { status: 500 })
  }
}
