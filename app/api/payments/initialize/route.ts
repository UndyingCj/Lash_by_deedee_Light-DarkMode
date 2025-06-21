import { type NextRequest, NextResponse } from "next/server"
import { initializePayment, type PaystackPaymentData } from "@/lib/paystack"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, amount, reference, metadata } = body

    // Validate required fields
    if (!email || !amount || !reference) {
      return NextResponse.json(
        { status: false, message: "Missing required fields: email, amount, or reference" },
        { status: 400 },
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ status: false, message: "Invalid email format" }, { status: 400 })
    }

    // Validate amount (should be positive and in kobo)
    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { status: false, message: "Invalid amount. Amount must be a positive number in kobo." },
        { status: 400 },
      )
    }

    const paymentData: PaystackPaymentData = {
      email,
      amount,
      reference,
      currency: "NGN",
      channels: ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"],
      metadata,
    }

    console.log("Initializing payment with data:", {
      email,
      amount,
      reference,
      metadata: metadata ? "present" : "not provided",
    })

    const response = await initializePayment(paymentData)

    if (!response.status) {
      console.error("Paystack initialization failed:", response.message)
      return NextResponse.json(
        { status: false, message: response.message || "Failed to initialize payment" },
        { status: 400 },
      )
    }

    console.log("Payment initialized successfully:", response.data?.reference)

    return NextResponse.json({
      status: true,
      message: "Payment initialized successfully",
      data: response.data,
    })
  } catch (error) {
    console.error("Payment initialization error:", error)
    return NextResponse.json({ status: false, message: "Internal server error" }, { status: 500 })
  }
}
