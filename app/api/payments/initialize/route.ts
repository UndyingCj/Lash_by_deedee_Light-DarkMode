import { type NextRequest, NextResponse } from "next/server"
import { initializePaystackPayment } from "@/lib/paystack"

export async function POST(request: NextRequest) {
  try {
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
    } = await request.json()

    console.log("🚀 Initializing payment:", {
      customerName,
      customerEmail,
      customerPhone,
      services,
      bookingDate,
      bookingTime,
      totalAmount,
      depositAmount,
    })

    // Validate required fields
    if (
      !customerName ||
      !customerEmail ||
      !customerPhone ||
      !services ||
      !bookingDate ||
      !bookingTime ||
      !depositAmount
    ) {
      return NextResponse.json(
        {
          status: false,
          message: "Missing required fields for payment initialization",
        },
        { status: 400 },
      )
    }

    // Initialize payment with Paystack
    const paymentData = await initializePaystackPayment({
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

    if (!paymentData.status) {
      console.error("❌ Payment initialization failed:", paymentData.message)
      return NextResponse.json(
        {
          status: false,
          message: paymentData.message || "Payment initialization failed",
        },
        { status: 400 },
      )
    }

    console.log("✅ Payment initialized successfully:", paymentData.data.reference)

    return NextResponse.json({
      status: true,
      message: "Payment initialized successfully",
      data: paymentData.data,
    })
  } catch (error) {
    console.error("❌ Payment initialization error:", error)
    return NextResponse.json(
      {
        status: false,
        message: `Payment initialization failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
