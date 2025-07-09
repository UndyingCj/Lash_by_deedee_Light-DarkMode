import { type NextRequest, NextResponse } from "next/server"
import { initializePaystackPayment } from "@/lib/paystack"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      customerName,
      customerEmail,
      customerPhone,
      services,
      bookingDate,
      bookingTime,
      totalAmount,
      depositAmount,
      notes,
    } = body

    // Validate required fields
    if (
      !customerName ||
      !customerEmail ||
      !customerPhone ||
      !services ||
      !bookingDate ||
      !bookingTime ||
      !totalAmount ||
      !depositAmount
    ) {
      return NextResponse.json(
        {
          status: false,
          message: "Missing required booking information",
        },
        { status: 400 },
      )
    }

    console.log("🚀 Initializing payment for:", {
      customer: customerName,
      email: customerEmail,
      amount: depositAmount,
      services: services,
    })

    // Initialize payment with Paystack
    const result = await initializePaystackPayment({
      customerName,
      customerEmail,
      customerPhone,
      services,
      bookingDate,
      bookingTime,
      totalAmount,
      depositAmount,
      notes,
    })

    if (!result.status) {
      console.error("❌ Payment initialization failed:", result.message)
      return NextResponse.json(result, { status: 400 })
    }

    console.log("✅ Payment initialized successfully:", result.data?.reference)

    return NextResponse.json(result)
  } catch (error) {
    console.error("❌ Payment initialization error:", error)
    return NextResponse.json(
      {
        status: false,
        message: error instanceof Error ? error.message : "Payment initialization failed",
      },
      { status: 500 },
    )
  }
}
