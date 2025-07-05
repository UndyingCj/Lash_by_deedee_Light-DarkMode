import { type NextRequest, NextResponse } from "next/server"
import { initializePaystackPayment } from "@/lib/paystack"

export async function POST(request: NextRequest) {
  try {
    const { email, amount, reference, metadata } = await request.json()

    // Validate required fields
    if (!email || !amount || !reference) {
      return NextResponse.json(
        {
          status: false,
          message: "Email, amount, and reference are required",
        },
        { status: 400 },
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          status: false,
          message: "Invalid email format",
        },
        { status: 400 },
      )
    }

    // Validate amount
    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        {
          status: false,
          message: "Amount must be a positive number",
        },
        { status: 400 },
      )
    }

    console.log("Initializing payment:", { email, amount, reference })

    // Initialize payment with Paystack
    const paymentData = await initializePaystackPayment({
      email,
      amount,
      reference,
      metadata,
    })

    console.log("Payment initialized successfully:", paymentData.data?.reference)

    return NextResponse.json({
      status: true,
      message: "Payment initialized successfully",
      data: paymentData.data,
    })
  } catch (error) {
    console.error("Payment initialization error:", error)
    return NextResponse.json(
      {
        status: false,
        message: error instanceof Error ? error.message : "Failed to initialize payment",
      },
      { status: 500 },
    )
  }
}
