import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, amount, reference, metadata } = await request.json()

    if (!email || !amount || !reference) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY
    if (!paystackSecretKey) {
      return NextResponse.json({ error: "Payment configuration error" }, { status: 500 })
    }

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: Math.round(amount * 100), // Convert to kobo
        reference,
        metadata,
        callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/book/success`,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("Paystack initialization error:", data)
      return NextResponse.json({ error: data.message || "Payment initialization failed" }, { status: response.status })
    }

    return NextResponse.json({
      success: true,
      data: data.data,
    })
  } catch (error) {
    console.error("Payment initialization error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
