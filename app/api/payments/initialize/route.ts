import { type NextRequest, NextResponse } from "next/server"
import { createPaystackPayment } from "@/lib/paystack"

export async function POST(request: NextRequest) {
  try {
    const bookingData = await request.json()

    // Validate required fields
    if (!bookingData.customerEmail || !bookingData.depositAmount) {
      return NextResponse.json({ error: "Missing required payment data" }, { status: 400 })
    }

    // Create payment data (NO CRYPTO CHANNELS)
    const paymentData = createPaystackPayment(bookingData)

    // Initialize payment with Paystack
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentData),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("Paystack initialization error:", data)
      return NextResponse.json({ error: "Payment initialization failed" }, { status: 400 })
    }

    return NextResponse.json({
      reference: paymentData.reference,
      authorization_url: data.data.authorization_url,
      access_code: data.data.access_code,
    })
  } catch (error) {
    console.error("Payment initialization error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
