import crypto from "crypto"

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY

export interface PaystackInitializeData {
  email: string
  amount: number // Amount in kobo (multiply by 100)
  reference: string
  callback_url?: string
  metadata?: {
    customer_name: string
    customer_phone: string
    services: string[]
    booking_date: string
    booking_time: string
    [key: string]: any
  }
}

export interface PaystackResponse {
  status: boolean
  message: string
  data?: any
}

export async function initializePayment(paymentData: PaystackInitializeData): Promise<PaystackResponse> {
  try {
    if (!PAYSTACK_SECRET_KEY) {
      console.error("❌ PAYSTACK_SECRET_KEY not found")
      return { status: false, message: "Payment service not configured" }
    }

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentData),
    })

    const result = await response.json()

    if (!response.ok) {
      console.error("❌ Paystack initialization failed:", result)
      return { status: false, message: result.message || "Payment initialization failed" }
    }

    console.log("✅ Payment initialized successfully:", result.data?.reference)
    return { status: true, message: "Payment initialized", data: result.data }
  } catch (error) {
    console.error("❌ Error initializing payment:", error)
    return {
      status: false,
      message: error instanceof Error ? error.message : "Payment initialization failed",
    }
  }
}

export async function verifyPayment(reference: string): Promise<PaystackResponse> {
  try {
    if (!PAYSTACK_SECRET_KEY) {
      console.error("❌ PAYSTACK_SECRET_KEY not found")
      return { status: false, message: "Payment service not configured" }
    }

    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    })

    const result = await response.json()

    if (!response.ok) {
      console.error("❌ Payment verification failed:", result)
      return { status: false, message: result.message || "Payment verification failed" }
    }

    console.log("✅ Payment verified successfully:", reference)
    return { status: true, message: "Payment verified", data: result.data }
  } catch (error) {
    console.error("❌ Error verifying payment:", error)
    return {
      status: false,
      message: error instanceof Error ? error.message : "Payment verification failed",
    }
  }
}

export function verifyWebhookSignature(payload: string, signature: string): boolean {
  try {
    if (!PAYSTACK_SECRET_KEY) {
      console.error("❌ PAYSTACK_SECRET_KEY not found for webhook verification")
      return false
    }

    const hash = crypto.createHmac("sha512", PAYSTACK_SECRET_KEY).update(payload, "utf8").digest("hex")

    return hash === signature
  } catch (error) {
    console.error("❌ Error verifying webhook signature:", error)
    return false
  }
}

export function generatePaymentReference(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)
  return `LBD_${timestamp}_${random}`
}

export function convertToKobo(amount: number): number {
  return Math.round(amount * 100)
}

export function convertFromKobo(amount: number): number {
  return amount / 100
}

export function getPaystackPublicKey(): string | undefined {
  return PAYSTACK_PUBLIC_KEY
}
