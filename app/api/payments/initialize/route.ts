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

async function initializePaystackPayment(paymentData: any): Promise<PaystackInitializeResponse> {
  const maxRetries = 3
  const retryDelay = 1000 // 1 second

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`💳 Initializing payment attempt ${attempt}/${maxRetries}`)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

      const response = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Paystack API error: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const data: PaystackInitializeResponse = await response.json()
      console.log(`✅ Payment initialization successful:`, data.data.reference)
      return data

    } catch (error) {
      console.error(`❌ Payment initialization attempt ${attempt} failed:`, error)

      if (attempt === maxRetries) {
        throw error
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryDelay * attempt))
    }
  }

  throw new Error("Max retries exceeded")
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
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

    // Validate required fields
    if (!email || !amount || !customerName || !services || !bookingDate || !bookingTime) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Validate amount
    if (amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      )
    }

    // Generate unique reference
    const reference = `lbd_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

    console.log("💳 Initializing payment for:", { email, amount, reference })

    // Calculate amounts (amount should be the deposit amount)
    const depositAmount = amount
    const totalAmount = Array.isArray(services) 
      ? services.reduce((total, service) => total + (service.price || 0), 0)
      : amount * 2 // Default: assume deposit is 50% of total

    // Prepare Paystack payment data
    const paymentData = {
      email,
      amount: Math.round(depositAmount * 100), // Convert to kobo
      reference,
      currency: "NGN",
      callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/booking/success?reference=${reference}`,
      metadata: {
        customer_name: customerName,
        customer_phone: customerPhone || "",
        services: Array.isArray(services) ? services.map(s => s.name || s).join(", ") : services,
        booking_date: bookingDate,
        booking_time: bookingTime,
        notes: notes || "",
        total_amount: totalAmount,
        deposit_amount: depositAmount,
      },
      channels: ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"],
    }

    // Initialize payment with Paystack
    const paymentResult = await initializePaystackPayment(paymentData)

    if (!paymentResult.status) {
      console.error("❌ Paystack initialization failed:", paymentResult.message)
      return NextResponse.json(
        { error: "Payment initialization failed", message: paymentResult.message },
        { status: 400 }
      )
    }

    // Store booking in database with pending status
    const bookingData = {
      client_name: customerName,
      client_email: email,
      client_phone: customerPhone || "",
      service_name: Array.isArray(services) ? services.map(s => s.name || s).join(", ") : services,
      booking_date: bookingDate,
      booking_time: bookingTime,
      total_amount: totalAmount,
      deposit_amount: depositAmount,
      payment_reference: reference,
      payment_status: "pending",
      status: "pending",
      notes: notes || "",
    }

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert(bookingData)
      .select()
      .single()

    if (bookingError) {
      console.error("❌ Error creating booking:", bookingError)
      return NextResponse.json(
        { error: "Failed to create booking" },
        { status: 500 }
      )
    }

    console.log("✅ Booking created with ID:", booking.id)

    return NextResponse.json({
      success: true,
      message: "Payment initialized successfully",
      data: {
        authorization_url: paymentResult.data.authorization_url,
        access_code: paymentResult.data.access_code,
        reference: paymentResult.data.reference,
        booking_id: booking.id,
        amount: depositAmount,
        currency: "NGN",
      }
    })

  } catch (error) {
    console.error("❌ Payment initialization error:", error)

    // Handle specific error types
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return NextResponse.json(
          { error: "Payment initialization timed out. Please try again." },
          { status: 408 }
        )
      }

      if (error.message.includes('Paystack API error')) {
        return NextResponse.json(
          { error: "Payment service temporarily unavailable. Please try again." },
          { status: 503 }
        )
      }
    }

    return NextResponse.json(
      { error: "Payment initialization failed. Please try again." },
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
