import { NextRequest, NextResponse } from "next/server"

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!

interface PaystackVerifyResponse {
  status: boolean
  message: string
  data: {
    id: number
    domain: string
    status: string
    reference: string
    amount: number
    message: string | null
    gateway_response: string
    paid_at: string
    created_at: string
    channel: string
    currency: string
    ip_address: string
    metadata: any
    log: any
    fees: number
    fees_split: any
    authorization: any
    customer: any
    plan: any
    split: any
    order_id: any
    paidAt: string
    createdAt: string
    requested_amount: number
  }
}

async function verifyPaystackPayment(reference: string): Promise<PaystackVerifyResponse> {
  const maxRetries = 3
  const retryDelay = 1000 // 1 second

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔍 Verifying payment attempt ${attempt}/${maxRetries} for reference: ${reference}`)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`Paystack API error: ${response.status} ${response.statusText}`)
      }

      const data: PaystackVerifyResponse = await response.json()
      console.log(`✅ Payment verification successful for ${reference}:`, data.data.status)
      return data

    } catch (error) {
      console.error(`❌ Payment verification attempt ${attempt} failed:`, error)

      if (attempt === maxRetries) {
        throw error
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryDelay * attempt))
    }
  }

  throw new Error("Max retries exceeded")
}

export async function POST(request: NextRequest) {
  try {
    const { reference } = await request.json()

    if (!reference) {
      return NextResponse.json(
        { error: "Payment reference is required" },
        { status: 400 }
      )
    }

    console.log("🔍 Starting payment verification for reference:", reference)

    const verificationResult = await verifyPaystackPayment(reference)

    if (!verificationResult.status) {
      console.error("❌ Paystack verification failed:", verificationResult.message)
      return NextResponse.json(
        { 
          error: "Payment verification failed",
          message: verificationResult.message 
        },
        { status: 400 }
      )
    }

    const paymentData = verificationResult.data

    // Check if payment was successful
    if (paymentData.status !== "success") {
      console.error("❌ Payment was not successful:", paymentData.status)
      return NextResponse.json(
        {
          error: "Payment was not successful",
          status: paymentData.status,
          message: paymentData.gateway_response
        },
        { status: 400 }
      )
    }

    console.log("✅ Payment verification completed successfully")

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      data: {
        reference: paymentData.reference,
        amount: paymentData.amount / 100, // Convert from kobo to naira
        status: paymentData.status,
        paidAt: paymentData.paid_at,
        channel: paymentData.channel,
        currency: paymentData.currency,
        customer: paymentData.customer,
        fees: paymentData.fees / 100, // Convert from kobo to naira
      }
    })

  } catch (error) {
    console.error("❌ Payment verification error:", error)

    // Handle specific error types
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return NextResponse.json(
          { error: "Payment verification timed out. Please try again." },
          { status: 408 }
        )
      }

      if (error.message.includes('Paystack API error')) {
        return NextResponse.json(
          { error: "Payment service temporarily unavailable. Please try again." },
          { status: 503 }
        )
      }
    }

    return NextResponse.json(
      { error: "Payment verification failed. Please contact support." },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const reference = searchParams.get("reference")

  if (!reference) {
    return NextResponse.json(
      { error: "Payment reference is required" },
      { status: 400 }
    )
  }

  try {
    console.log("🔍 GET payment verification for reference:", reference)

    const verificationResult = await verifyPaystackPayment(reference)

    return NextResponse.json({
      success: verificationResult.status,
      data: verificationResult.data
    })

  } catch (error) {
    console.error("❌ GET payment verification error:", error)
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500 }
    )
  }
}
