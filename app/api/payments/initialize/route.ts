import { type NextRequest, NextResponse } from "next/server"
import { initializePayment, generatePaymentReference, validatePaymentAmount } from "@/lib/paystack"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, amount, customerName, customerPhone, services, bookingDate, bookingTime, notes } = body

    // Validate required fields
    if (!email || !amount || !customerName || !services || !bookingDate || !bookingTime) {
      return NextResponse.json({ status: false, message: "Missing required fields" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ status: false, message: "Invalid email format" }, { status: 400 })
    }

    // Validate amount
    if (!validatePaymentAmount(amount)) {
      return NextResponse.json({ status: false, message: "Invalid payment amount" }, { status: 400 })
    }

    // Generate unique reference
    const reference = generatePaymentReference()

    // Prepare metadata
    const metadata = {
      customerName,
      customerPhone,
      services: Array.isArray(services) ? services : [services],
      bookingDate,
      bookingTime,
      totalAmount: amount,
      depositAmount: amount, // For now, deposit equals total amount
      notes: notes || "",
      bookingType: "lash_service",
    }

    console.log("Initializing payment:", { email, amount, reference, metadata })

    // Initialize payment with Paystack
    const paymentResponse = await initializePayment({
      email,
      amount,
      reference,
      metadata,
    })

    if (!paymentResponse.status) {
      console.error("Payment initialization failed:", paymentResponse.message)
      return NextResponse.json({ status: false, message: paymentResponse.message }, { status: 400 })
    }

    console.log("Payment initialized successfully:", paymentResponse.data)

    return NextResponse.json({
      status: true,
      message: "Payment initialized successfully",
      data: {
        authorization_url: paymentResponse.data.authorization_url,
        access_code: paymentResponse.data.access_code,
        reference: paymentResponse.data.reference,
      },
    })
  } catch (error) {
    console.error("Payment initialization error:", error)
    return NextResponse.json({ status: false, message: "Internal server error" }, { status: 500 })
  }
}
