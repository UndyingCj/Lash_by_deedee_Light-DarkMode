import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Payment initialization started")

    const body = await request.json()
    console.log("📝 Request body:", JSON.stringify(body, null, 2))

    // Extract and validate required fields
    const { customerName, customerEmail, customerPhone, services, date, time, totalAmount, depositAmount, notes } = body

    // Comprehensive validation
    const errors = []
    if (!customerName || typeof customerName !== "string" || customerName.trim().length === 0) {
      errors.push("Customer name is required")
    }
    if (!customerEmail || typeof customerEmail !== "string" || !customerEmail.includes("@")) {
      errors.push("Valid customer email is required")
    }
    if (!services || !Array.isArray(services) || services.length === 0) {
      errors.push("At least one service must be selected")
    }
    if (!date || typeof date !== "string" || date.trim().length === 0) {
      errors.push("Booking date is required")
    }
    if (!time || typeof time !== "string" || time.trim().length === 0) {
      errors.push("Booking time is required")
    }
    if (!depositAmount || typeof depositAmount !== "number" || depositAmount <= 0) {
      errors.push("Valid deposit amount is required")
    }

    if (errors.length > 0) {
      console.error("❌ Validation errors:", errors)
      return NextResponse.json(
        {
          status: false,
          message: "Validation failed",
          errors,
        },
        { status: 400 },
      )
    }

    // Clean and format data
    const cleanCustomerName = customerName.trim()
    const cleanCustomerEmail = customerEmail.trim().toLowerCase()
    const cleanCustomerPhone = customerPhone ? customerPhone.trim() : ""
    const servicesString = services.join(", ")
    const cleanTotalAmount = Number(totalAmount) || Number(depositAmount)
    const cleanDepositAmount = Number(depositAmount)
    const cleanDate = date.trim()
    const cleanTime = time.trim()
    const cleanNotes = notes ? notes.trim() : ""

    // Generate unique payment reference
    const paymentReference = `LBD_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    console.log("💾 Creating booking record...")

    // Create booking record with ONLY the columns that exist
    const bookingData = {
      client_name: cleanCustomerName,
      client_email: cleanCustomerEmail,
      client_phone: cleanCustomerPhone || null,
      phone: cleanCustomerPhone || null,
      email: cleanCustomerEmail,
      service_name: servicesString,
      service: servicesString,
      booking_date: cleanDate,
      booking_time: cleanTime,
      total_amount: cleanTotalAmount,
      amount: cleanDepositAmount,
      deposit_amount: cleanDepositAmount,
      payment_reference: paymentReference,
      status: "pending",
      payment_status: "pending",
      notes: cleanNotes,
      special_notes: cleanNotes,
    }

    console.log("📤 Inserting booking data:", JSON.stringify(bookingData, null, 2))

    const { data: booking, error: bookingError } = await supabase.from("bookings").insert(bookingData).select().single()

    if (bookingError) {
      console.error("❌ Database error:", bookingError)
      console.error("   Code:", bookingError.code)
      console.error("   Message:", bookingError.message)
      console.error("   Details:", bookingError.details)
      console.error("   Hint:", bookingError.hint)

      // Provide more specific error messages
      let errorMessage = "Failed to create booking"

      if (bookingError.code === "23502") {
        const missingColumn = bookingError.message.match(/column "([^"]+)"/)?.[1] || "unknown"
        errorMessage = `Missing required field: ${missingColumn}`
      } else if (bookingError.code === "42703") {
        const missingColumn = bookingError.message.match(/column "([^"]+)"/)?.[1] || "unknown"
        errorMessage = `Database column not found: ${missingColumn}`
      } else if (bookingError.code === "42P01") {
        errorMessage = "Database table not found. Please contact support."
      }

      return NextResponse.json(
        {
          status: false,
          message: errorMessage,
          error: bookingError.message,
          code: bookingError.code,
        },
        { status: 500 },
      )
    }

    console.log("✅ Booking created successfully:", booking.id)

    // Convert amount to kobo (Paystack requirement)
    const amountInKobo = Math.round(cleanDepositAmount * 100)

    console.log("💳 Initializing Paystack payment...")

    // Initialize payment with Paystack
    const paystackPayload = {
      email: cleanCustomerEmail,
      amount: amountInKobo,
      reference: paymentReference,
      callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/booking/success?reference=${paymentReference}`,
      metadata: {
        customer_name: cleanCustomerName,
        customer_phone: cleanCustomerPhone,
        service_name: servicesString,
        booking_date: cleanDate,
        booking_time: cleanTime,
        booking_id: booking.id,
        total_amount: cleanTotalAmount,
        deposit_amount: cleanDepositAmount,
      },
      channels: ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"],
    }

    console.log("📤 Paystack payload:", JSON.stringify(paystackPayload, null, 2))

    const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paystackPayload),
    })

    if (!paystackResponse.ok) {
      const errorText = await paystackResponse.text()
      console.error("❌ Paystack initialization failed:", paystackResponse.status, errorText)

      // Clean up the booking record
      await supabase.from("bookings").delete().eq("id", booking.id)

      return NextResponse.json(
        {
          status: false,
          message: "Payment initialization failed",
          error: `Paystack API error: ${paystackResponse.status}`,
        },
        { status: 500 },
      )
    }

    const paystackData = await paystackResponse.json()
    console.log("📊 Paystack response:", JSON.stringify(paystackData, null, 2))

    if (!paystackData.status) {
      console.error("❌ Paystack initialization failed:", paystackData.message)

      // Clean up the booking record
      await supabase.from("bookings").delete().eq("id", booking.id)

      return NextResponse.json(
        {
          status: false,
          message: paystackData.message || "Payment initialization failed",
        },
        { status: 400 },
      )
    }

    console.log("✅ Payment initialized successfully")

    return NextResponse.json({
      status: true,
      message: "Payment initialized successfully",
      data: {
        authorization_url: paystackData.data.authorization_url,
        access_code: paystackData.data.access_code,
        reference: paymentReference,
        booking_id: booking.id,
        public_key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        amount: amountInKobo,
      },
    })
  } catch (error) {
    console.error("❌ Payment initialization error:", error)
    return NextResponse.json(
      {
        status: false,
        message: "Payment initialization failed",
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
