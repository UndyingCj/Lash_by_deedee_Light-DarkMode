import { type NextRequest, NextResponse } from "next/server"
import { initializePayment } from "@/lib/paystack"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, amount, reference, metadata } = body

    console.log("🚀 Payment initialization request:", {
      email,
      amount,
      reference,
      metadata: metadata ? "Present" : "Missing",
    })

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
    if (amount <= 0) {
      return NextResponse.json({ status: false, message: "Amount must be greater than 0" }, { status: 400 })
    }

    const paymentData = {
      email,
      amount,
      reference,
      currency: "NGN",
      channels: ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"],
      metadata,
      callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payments/callback`,
    }

    console.log("📤 Sending to Paystack:", paymentData)

    const result = await initializePayment(paymentData)

    console.log("✅ Paystack response:", {
      status: result.status,
      message: result.message,
      hasData: !!result.data,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("💥 Payment initialization error:", error)
    return NextResponse.json(
      {
        status: false,
        message: error instanceof Error ? error.message : "Failed to initialize payment",
      },
      { status: 500 },
    )
  }
}
