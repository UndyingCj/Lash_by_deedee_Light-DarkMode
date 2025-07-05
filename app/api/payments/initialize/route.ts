import { type NextRequest, NextResponse } from "next/server"
import { initializePayment } from "@/lib/paystack"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, amount, reference, metadata } = body

    if (!email || !amount || !reference) {
      return NextResponse.json({ status: false, message: "Missing required fields" }, { status: 400 })
    }

    console.log("🚀 Initializing payment:", { email, amount, reference })

    const response = await initializePayment({
      email,
      amount,
      reference,
      metadata,
    })

    if (response.status) {
      console.log("✅ Payment initialization successful")
      return NextResponse.json({
        status: true,
        message: "Payment initialized successfully",
        data: response.data,
      })
    } else {
      console.error("❌ Payment initialization failed:", response.message)
      return NextResponse.json(
        { status: false, message: response.message || "Failed to initialize payment" },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("💥 Payment initialization error:", error)
    return NextResponse.json(
      { status: false, message: "Internal server error during payment initialization" },
      { status: 500 },
    )
  }
}
