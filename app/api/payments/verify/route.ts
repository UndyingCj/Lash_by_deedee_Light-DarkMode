import { type NextRequest, NextResponse } from "next/server"
import { verifyPayment } from "@/lib/paystack"

export async function POST(request: NextRequest) {
  try {
    const { reference } = await request.json()

    if (!reference) {
      return NextResponse.json({ status: false, message: "Payment reference is required" }, { status: 400 })
    }

    console.log("Verifying payment with reference:", reference)

    // Verify payment with Paystack
    const verificationResult = await verifyPayment(reference)

    if (!verificationResult.status) {
      console.error("Payment verification failed:", verificationResult.message)
      return NextResponse.json(
        { status: false, message: verificationResult.message || "Payment verification failed" },
        { status: 400 },
      )
    }

    const paymentData = verificationResult.data

    if (!paymentData || paymentData.status !== "success") {
      console.error("Payment was not successful:", paymentData?.status)
      return NextResponse.json({ status: false, message: "Payment was not successful" }, { status: 400 })
    }

    console.log("Payment verified successfully:", {
      reference: paymentData.reference,
      amount: paymentData.amount,
      status: paymentData.status,
    })

    // Return success response
    return NextResponse.json({
      status: true,
      message: "Payment verified successfully",
      data: {
        reference: paymentData.reference,
        amount: paymentData.amount,
        status: paymentData.status,
        paid_at: paymentData.paid_at,
        customer: paymentData.customer,
        metadata: paymentData.metadata,
      },
    })
  } catch (error) {
    console.error("Payment verification error:", error)
    return NextResponse.json(
      { status: false, message: "Payment verification failed due to server error" },
      { status: 500 },
    )
  }
}
