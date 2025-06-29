import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, amount, metadata } = await request.json()

    if (!email || !amount) {
      return NextResponse.json({ error: "Email and amount are required" }, { status: 400 })
    }

    console.log("💳 Initializing payment for:", email, "Amount:", amount)

    // Check if we have Paystack credentials
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY

    if (!paystackSecretKey) {
      console.error("❌ Paystack secret key not configured")
      return NextResponse.json({ error: "Payment system not configured" }, { status: 503 })
    }

    // Initialize payment with Paystack
    const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: Math.round(amount * 100), // Convert to kobo
        currency: "NGN",
        callback_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://lashedbydeedee.com"}/book/success`,
        metadata: {
          ...metadata,
          cancel_action: `${process.env.NEXT_PUBLIC_SITE_URL || "https://lashedbydeedee.com"}/book`,
        },
      }),
    })

    const paystackData = await paystackResponse.json()

    if (!paystackResponse.ok || !paystackData.status) {
      console.error("❌ Paystack initialization failed:", paystackData)
      return NextResponse.json({ error: paystackData.message || "Payment initialization failed" }, { status: 400 })
    }

    console.log("✅ Payment initialized successfully:", paystackData.data.reference)

    return NextResponse.json({
      success: true,
      data: {
        authorization_url: paystackData.data.authorization_url,
        access_code: paystackData.data.access_code,
        reference: paystackData.data.reference,
      },
    })
  } catch (error) {
    console.error("❌ Payment initialization error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
