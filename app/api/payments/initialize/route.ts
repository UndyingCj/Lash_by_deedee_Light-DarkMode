import { type NextRequest, NextResponse } from "next/server"

const paystackSecret = process.env.PAYSTACK_SECRET_KEY!

export async function POST(request: NextRequest) {
  console.log("🚀 Payment initialization started")

  try {
    const body = await request.json()
    console.log("📋 Payment request:", body)

    const { email, amount, metadata } = body

    if (!email || !amount) {
      console.error("❌ Missing required fields:", { email: !!email, amount: !!amount })
      return NextResponse.json(
        {
          success: false,
          message: "Email and amount are required",
        },
        { status: 400 },
      )
    }

    // Generate unique reference
    const reference = `LBD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    console.log("🔑 Generated reference:", reference)

    const paystackData = {
      email,
      amount: Math.round(amount * 100), // Convert to kobo
      reference,
      metadata: {
        ...metadata,
        custom_fields: [
          {
            display_name: "Service",
            variable_name: "service",
            value: Array.isArray(metadata?.service) ? metadata.service.join(", ") : metadata?.service || "Unknown",
          },
          {
            display_name: "Date",
            variable_name: "booking_date",
            value: metadata?.booking_date || "Unknown",
          },
          {
            display_name: "Time",
            variable_name: "booking_time",
            value: metadata?.booking_time || "Unknown",
          },
        ],
      },
      callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/book?payment=success`,
      channels: ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"],
    }

    console.log("📋 Paystack request data:", paystackData)

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paystackData),
    })

    const data = await response.json()
    console.log("📋 Paystack response:", {
      status: response.status,
      ok: response.ok,
      data: data,
    })

    if (!response.ok) {
      console.error("❌ Paystack initialization failed:", data)
      return NextResponse.json(
        {
          success: false,
          message: data.message || "Payment initialization failed",
        },
        { status: 400 },
      )
    }

    console.log("✅ Payment initialized successfully")
    return NextResponse.json({
      success: true,
      data: data.data,
    })
  } catch (error) {
    console.error("❌ Payment initialization error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    )
  }
}
