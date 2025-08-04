import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Payment initialization started")

    const body = await request.json()
    const {
      customerName,
      customerEmail,
      customerPhone,
      services,
      date,
      time,
      totalAmount,
      depositAmount,
      notes,
    } = body

    // Validate required fields
    if (!customerName || !customerEmail || !services || !date || !time || !totalAmount || !depositAmount) {
      console.error("❌ Missing required fields")
      return NextResponse.json(
        {
          status: false,
          message: "Missing required booking information",
        },
        { status: 400 },
      )
    }

    console.log("📋 Initializing payment for:", {
      customer: customerName,
      email: customerEmail,
      services: Array.isArray(services) ? services.join(", ") : services,
      date,
      time,
      amount: depositAmount,
    })

    // Generate unique reference
    const reference = `LBD_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    // Prepare metadata for Paystack
    const metadata = {
      customer_name: customerName,
      customer_phone: customerPhone || "",
      services: Array.isArray(services) ? services.join(", ") : services,
      booking_date: date,
      booking_time: time,
      total_amount: totalAmount.toString(),
      deposit_amount: depositAmount.toString(),
      notes: notes || "",
      booking_source: "website",
    }

    console.log("💳 Initializing Paystack payment...")

    // Initialize payment with Paystack with timeout and retry logic
    let paystackData
    let attempts = 0
    const maxAttempts = 3
    const timeout = 15000 // 15 seconds

    while (attempts < maxAttempts) {
      try {
        console.log(`🔄 Paystack initialization attempt ${attempts + 1}/${maxAttempts}`)
        
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeout)

        const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: customerEmail,
            amount: Math.round(depositAmount * 100), // Convert to kobo
            currency: "NGN",
            reference: reference,
            callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/book/success`,
            metadata: metadata,
            channels: ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"],
          }),
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!paystackResponse.ok) {
          const errorText = await paystackResponse.text()
          throw new Error(`HTTP ${paystackResponse.status}: ${errorText}`)
        }

        paystackData = await paystackResponse.json()
        console.log("📊 Paystack initialization response:", paystackData.status)
        break // Success, exit retry loop

      } catch (error) {
        attempts++
        console.error(`❌ Paystack initialization attempt ${attempts} failed:`, error)
        
        if (attempts >= maxAttempts) {
          console.error("❌ All Paystack initialization attempts failed")
          return NextResponse.json(
            {
              status: false,
              message: "Payment initialization failed after multiple attempts. Please try again later.",
            },
            { status: 500 },
          )
        }

        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts))
      }
    }

    if (!paystackData || !paystackData.status) {
      console.error("❌ Paystack initialization failed:", paystackData?.message)
      return NextResponse.json(
        {
          status: false,
          message: paystackData?.message || "Payment initialization failed",
        },
        { status: 500 },
      )
    }

    console.log("✅ Payment initialized successfully")

    // Store pending booking in database
    try {
      const { error: dbError } = await supabase.from("bookings").insert({
        client_name: customerName,
        client_email: customerEmail,
        client_phone: customerPhone || "",
        phone: customerPhone || "",
        email: customerEmail,
        service_name: Array.isArray(services) ? services.join(", ") : services,
        service: Array.isArray(services) ? services.join(", ") : services,
        booking_date: date,
        booking_time: time,
        total_amount: totalAmount,
        amount: depositAmount,
        deposit_amount: depositAmount,
        payment_reference: reference,
        payment_status: "pending",
        status: "pending",
        special_notes: notes || "",
        notes: notes || "",
        created_at: new Date().toISOString(),
      })

      if (dbError) {
        console.error("⚠️ Database insert failed:", dbError)
        // Continue with payment even if DB insert fails
      } else {
        console.log("✅ Pending booking stored in database")
      }
    } catch (dbError) {
      console.error("⚠️ Database error:", dbError)
      // Continue with payment even if DB fails
    }

    return NextResponse.json({
      status: true,
      message: "Payment initialized successfully",
      data: {
        reference: reference,
        authorization_url: paystackData.data.authorization_url,
        access_code: paystackData.data.access_code,
        amount: Math.round(depositAmount * 100), // Amount in kobo
        public_key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      },
    })
  } catch (error) {
    console.error("❌ Payment initialization error:", error)
    return NextResponse.json(
      {
        status: false,
        message: error instanceof Error ? error.message : "Payment initialization failed",
      },
      { status: 500 },
    )
  }
}
