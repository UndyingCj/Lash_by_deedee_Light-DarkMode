import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest) {
  try {
    const { email, amount, service, date, time, clientName, clientPhone, specialNotes } = await request.json()

    // Validate required fields
    if (!email || !amount || !service || !date || !time || !clientName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if we have Paystack credentials
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY
    if (!paystackSecretKey) {
      console.error("❌ Missing Paystack secret key")
      return NextResponse.json({ error: "Payment system not configured" }, { status: 503 })
    }

    // Calculate deposit (50% of total amount)
    const totalAmount = Number.parseFloat(amount)
    const depositAmount = Math.round(totalAmount * 0.5)

    // Generate unique reference
    const reference = `lbd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Initialize Paystack transaction
    const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: depositAmount * 100, // Paystack expects amount in kobo
        reference,
        currency: "NGN",
        callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/book/success`,
        metadata: {
          service,
          appointment_date: date,
          appointment_time: time,
          client_name: clientName,
          client_phone: clientPhone,
          special_notes: specialNotes,
          total_amount: totalAmount,
          deposit_amount: depositAmount,
        },
      }),
    })

    const paystackData = await paystackResponse.json()

    if (!paystackResponse.ok || !paystackData.status) {
      console.error("❌ Paystack initialization failed:", paystackData)
      return NextResponse.json({ error: paystackData.message || "Payment initialization failed" }, { status: 400 })
    }

    // Save booking to database
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey)

      const { error: bookingError } = await supabase.from("bookings").insert({
        client_name: clientName,
        client_email: email,
        client_phone: clientPhone,
        service_type: service,
        appointment_date: date,
        appointment_time: time,
        total_amount: totalAmount,
        deposit_amount: depositAmount,
        payment_status: "pending",
        payment_reference: reference,
        special_notes: specialNotes,
        status: "pending",
      })

      if (bookingError) {
        console.error("❌ Failed to save booking:", bookingError)
        // Continue anyway, payment can still proceed
      }
    }

    console.log("✅ Payment initialized successfully:", reference)

    return NextResponse.json({
      success: true,
      data: {
        authorization_url: paystackData.data.authorization_url,
        access_code: paystackData.data.access_code,
        reference: paystackData.data.reference,
      },
    })
  } catch (error) {
    console.error("❌ Payment initialization error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
