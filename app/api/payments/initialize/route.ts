import { type NextRequest, NextResponse } from "next/server"
import { initializePayment } from "@/lib/paystack"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, amount, reference, metadata } = body

    if (!email || !amount || !reference) {
      return NextResponse.json(
        {
          status: false,
          message: "Missing required fields: email, amount, or reference",
        },
        { status: 400 },
      )
    }

    console.log("🚀 Initializing payment:", {
      email,
      amount,
      reference,
      metadata: metadata ? "present" : "missing",
    })

    const paymentData = {
      email,
      amount,
      reference,
      metadata,
      currency: "NGN",
      channels: ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"],
    }

    const response = await initializePayment(paymentData)

    if (!response.status) {
      console.error("❌ Payment initialization failed:", response.message)
      return NextResponse.json(
        {
          status: false,
          message: response.message || "Failed to initialize payment",
        },
        { status: 400 },
      )
    }

    console.log("✅ Payment initialized successfully:", response.data?.reference)

    return NextResponse.json({
      status: true,
      message: "Payment initialized successfully",
      data: response.data,
    })
  } catch (error) {
    console.error("❌ Payment initialization error:", error)
    return NextResponse.json(
      {
        status: false,
        message: "Failed to initialize payment",
      },
      { status: 500 },
    )
  }
}
