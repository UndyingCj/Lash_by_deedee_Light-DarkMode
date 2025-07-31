import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Create Supabase client with proper error handling
function createSupabaseClient() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase configuration")
    }

    return createClient(supabaseUrl, supabaseKey)
  } catch (error) {
    console.error("❌ Failed to create Supabase client:", error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 Payment initialization request received")

    // Parse request body with error handling
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error("❌ Failed to parse request body:", parseError)
      return NextResponse.json(
        {
          status: false,
          message: "Invalid request format",
          error: "Request body must be valid JSON",
        },
        { status: 400 },
      )
    }

    console.log("📥 Request body:", body)

    // Extract data with flexible field names
    const { customerName, customerEmail, customerPhone, services, date, time, totalAmount, depositAmount, notes } = body

    console.log("📋 Extracted data:", {
      customerName,
      customerEmail,
      customerPhone,
      services,
      date,
      time,
      totalAmount,
      depositAmount,
    })

    // Validation with detailed error messages
    if (!customerName || typeof customerName !== "string" || customerName.trim() === "") {
      return NextResponse.json(
        {
          status: false,
          message: "Customer name is required",
          field: "customerName",
        },
        { status: 400 },
      )
    }

    if (!customerEmail || typeof customerEmail !== "string" || !customerEmail.includes("@")) {
      return NextResponse.json(
        {
          status: false,
          message: "Valid customer email is required",
          field: "customerEmail",
        },
        { status: 400 },
      )
    }

    if (!services || !Array.isArray(services) || services.length === 0) {
      return NextResponse.json(
        {
          status: false,
          message: "At least one service must be selected",
          field: "services",
        },
        { status: 400 },
      )
    }

    if (!date || typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        {
          status: false,
          message: "Valid booking date is required (YYYY-MM-DD format)",
          field: "date",
        },
        { status: 400 },
      )
    }

    if (!time || typeof time !== "string" || time.trim() === "") {
      return NextResponse.json(
        {
          status: false,
          message: "Booking time is required",
          field: "time",
        },
        { status: 400 },
      )
    }

    // Calculate amounts with validation
    const finalTotalAmount = Number(totalAmount) || 0
    const finalDepositAmount = Number(depositAmount) || Math.floor(finalTotalAmount / 2)

    if (finalDepositAmount <= 0) {
      return NextResponse.json(
        {
          status: false,
          message: "Valid deposit amount is required",
          field: "depositAmount",
        },
        { status: 400 },
      )
    }

    // Check environment variables
    if (!process.env.PAYSTACK_SECRET_KEY) {
      console.error("❌ PAYSTACK_SECRET_KEY not configured")
      return NextResponse.json(
        {
          status: false,
          message: "Payment service not configured",
          error: "Missing payment configuration",
        },
        { status: 500 },
      )
    }

    if (!process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY) {
      console.error("❌ NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY not configured")
      return NextResponse.json(
        {
          status: false,
          message: "Payment service not configured",
          error: "Missing public key configuration",
        },
        { status: 500 },
      )
    }

    // Generate unique reference
    const reference = `LBD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    console.log("💳 Initializing Paystack payment:", {
      reference,
      email: customerEmail,
      amount: finalDepositAmount * 100, // Convert to kobo
    })

    // Prepare Paystack payload
    const paystackPayload = {
      email: customerEmail.trim().toLowerCase(),
      amount: finalDepositAmount * 100, // Convert to kobo
      reference: reference,
      currency: "NGN",
      callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/booking/success?reference=${reference}`,
      metadata: {
        customerName: customerName.trim(),
        customerPhone: customerPhone?.trim() || "",
        services: services.join(", "),
        bookingDate: date,
        bookingTime: time,
        totalAmount: finalTotalAmount,
        depositAmount: finalDepositAmount,
        notes: notes?.trim() || "",
      },
      channels: ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"],
    }

    console.log("📤 Paystack payload:", paystackPayload)

    // Initialize payment with Paystack
    let paystackResponse
    try {
      paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paystackPayload),
      })
    } catch (fetchError) {
      console.error("❌ Paystack API request failed:", fetchError)
      return NextResponse.json(
        {
          status: false,
          message: "Payment service unavailable",
          error: "Failed to connect to payment service",
        },
        { status: 503 },
      )
    }

    let paystackResult
    try {
      paystackResult = await paystackResponse.json()
    } catch (parseError) {
      console.error("❌ Failed to parse Paystack response:", parseError)
      return NextResponse.json(
        {
          status: false,
          message: "Payment service error",
          error: "Invalid response from payment service",
        },
        { status: 502 },
      )
    }

    console.log("📊 Paystack response:", paystackResult)

    if (!paystackResponse.ok || !paystackResult.status) {
      console.error("❌ Paystack initialization failed:", paystackResult)
      return NextResponse.json(
        {
          status: false,
          message: paystackResult.message || "Payment initialization failed",
          error: "Paystack API error",
          details: paystackResult,
        },
        { status: 400 },
      )
    }

    // Store booking in database with pending status - using correct column names
    const bookingData = {
      client_name: customerName.trim(),
      client_email: customerEmail.trim().toLowerCase(),
      client_phone: customerPhone?.trim() || null,
      phone: customerPhone?.trim() || "",
      email: customerEmail.trim().toLowerCase(),
      service_name: services.join(", "),
      service: services.join(", "),
      booking_date: date,
      booking_time: time,
      total_amount: finalTotalAmount,
      amount: finalTotalAmount,
      deposit_amount: finalDepositAmount,
      payment_reference: reference,
      payment_status: "pending",
      status: "pending", // Use 'status' not 'booking_status'
      special_notes: notes?.trim() || null,
      notes: notes?.trim() || null,
    }

    console.log("💾 Storing booking in database:", bookingData)

    try {
      const supabase = createSupabaseClient()
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert([bookingData])
        .select()
        .single()

      if (bookingError) {
        console.error("❌ Database error:", bookingError)
        // Don't fail the payment initialization due to database issues
        console.warn("⚠️ Continuing with payment despite database error")
      } else {
        console.log("✅ Booking stored in database:", booking?.id)
      }
    } catch (dbError) {
      console.error("❌ Database connection error:", dbError)
      // Continue with payment even if database fails
    }

    // Return success response with Paystack data
    const successResponse = {
      status: true,
      message: "Payment initialized successfully",
      data: {
        authorization_url: paystackResult.data.authorization_url,
        access_code: paystackResult.data.access_code,
        reference: paystackResult.data.reference,
        public_key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        amount: finalDepositAmount * 100, // Amount in kobo
      },
    }

    console.log("✅ Payment initialization successful:", successResponse)
    return NextResponse.json(successResponse)
  } catch (error) {
    console.error("❌ Payment initialization error:", error)

    // Ensure we always return a JSON response, even for unexpected errors
    return NextResponse.json(
      {
        status: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
