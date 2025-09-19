import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!

interface PaystackInitializeResponse {
  status: boolean
  message: string
  data: {
    authorization_url: string
    access_code: string
    reference: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("📥 Payment initialization request:", body)

    // Validate required fields
    const requiredFields = ['email', 'amount', 'customerName', 'services', 'bookingDate', 'bookingTime']
    const missingFields = requiredFields.filter(field => !body[field])

    if (missingFields.length > 0) {
      console.error("❌ Missing required fields:", missingFields)
      return NextResponse.json(
        { error: "Missing required fields", fields: missingFields },
        { status: 400 }
      )
    }

    const {
      email,
      amount,
      customerName,
      customerPhone,
      services,
      bookingDate,
      bookingTime,
      notes
    } = body

    // Validate email format
    if (!email.includes('@')) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    // Validate amount
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      )
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(bookingDate)) {
      return NextResponse.json(
        { error: "Invalid date format. Use YYYY-MM-DD" },
        { status: 400 }
      )
    }

    // Generate unique reference
    const reference = `lbd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    console.log("💳 Initializing Paystack payment:", {
      email,
      amount,
      reference,
      customerName
    })

    // Initialize payment with Paystack
    const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.toLowerCase().trim(),
        amount: Math.round(amount * 100), // Convert to kobo
        reference,
        currency: "NGN",
        metadata: {
          customer_name: customerName,
          customer_phone: customerPhone || "",
          services: Array.isArray(services) ? services.join(", ") : services,
          booking_date: bookingDate,
          booking_time: bookingTime,
          notes: notes || "",
        },
        callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/booking/success`,
      }),
    })

    if (!paystackResponse.ok) {
      const errorText = await paystackResponse.text()
      console.error("❌ Paystack initialization failed:", errorText)
      return NextResponse.json(
        { error: "Payment initialization failed" },
        { status: 500 }
      )
    }

    const paystackData: PaystackInitializeResponse = await paystackResponse.json()

    if (!paystackData.status) {
      console.error("❌ Paystack returned error:", paystackData.message)
      return NextResponse.json(
        { error: paystackData.message || "Payment initialization failed" },
        { status: 500 }
      )
    }

    console.log("✅ Payment initialized successfully:", paystackData.data.reference)

    // Create pending booking record
    const bookingData = {
      client_name: customerName,
      client_email: email.toLowerCase().trim(),
      client_phone: customerPhone || "",
      phone: customerPhone || "",
      email: email.toLowerCase().trim(),
      service_name: Array.isArray(services) ? services.join(", ") : services,
      service: Array.isArray(services) ? services.join(", ") : services,
      booking_date: bookingDate,
      booking_time: bookingTime,
      total_amount: amount * 2, // Assuming deposit is 50%
      amount: amount,
      deposit_amount: amount,
      payment_status: "pending",
      payment_reference: reference,
      special_notes: notes || "",
      notes: notes || "",
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    console.log("💾 Creating pending booking:", bookingData)

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert(bookingData)
      .select()
      .single()

    if (bookingError) {
      console.error("❌ Error creating booking:", bookingError)
      return NextResponse.json(
        { error: "Failed to create booking record" },
        { status: 500 }
      )
    }

    console.log("✅ Pending booking created:", booking.id)

    return NextResponse.json({
      success: true,
      message: "Payment initialized successfully",
      data: {
        authorization_url: paystackData.data.authorization_url,
        access_code: paystackData.data.access_code,
        reference: paystackData.data.reference,
        amount: Math.round(amount * 100), // Amount in kobo for frontend
        public_key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        booking_id: booking.id,
      }
    })

  } catch (error) {
    console.error("❌ Payment initialization error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Paystack payment initialization endpoint",
    status: "active",
    timestamp: new Date().toISOString(),
  })
}
