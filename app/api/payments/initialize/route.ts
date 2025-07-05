import { type NextRequest, NextResponse } from "next/server"
import { initializePayment } from "@/lib/paystack"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, amount, reference, metadata } = body

    // Validate required fields
    if (!email || !amount || !reference) {
      return NextResponse.json(
        { status: false, message: "Missing required fields: email, amount, reference" },
        { status: 400 },
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ status: false, message: "Invalid email format" }, { status: 400 })
    }

    // Validate amount (should be positive number)
    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ status: false, message: "Amount must be a positive number" }, { status: 400 })
    }

    console.log("🚀 Initializing payment:", { email, amount, reference })

    const result = await initializePayment({
      email,
      amount,
      reference,
      metadata,
    })

    if (!result.status) {
      console.error("❌ Payment initialization failed:", result.message)
      return NextResponse.json(
        { status: false, message: result.message || "Failed to initialize payment" },
        { status: 400 },
      )
    }

    console.log("✅ Payment initialized successfully:", result.data?.reference)

    return NextResponse.json({
      status: true,
      message: "Payment initialized successfully",
      data: result.data,
    })
  } catch (error) {
    console.error("💥 Payment initialization error:", error)
    return NextResponse.json({ status: false, message: "Internal server error" }, { status: 500 })
  }
}
