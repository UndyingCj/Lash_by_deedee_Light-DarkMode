import crypto from "crypto"

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY

if (!PAYSTACK_SECRET_KEY && typeof window === "undefined") {
  console.warn("PAYSTACK_SECRET_KEY is not set")
}

if (!PAYSTACK_PUBLIC_KEY) {
  console.warn("NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY is not set")
}

export function generatePaymentReference(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return `LBD_${timestamp}_${random}`.toUpperCase()
}

export function convertToKobo(amount: number): number {
  return Math.round(amount * 100)
}

export function convertFromKobo(amount: number): number {
  return amount / 100
}

export async function initializePaystackPayment(data: {
  email: string
  amount: number
  reference: string
  metadata?: any
}) {
  if (!PAYSTACK_SECRET_KEY) {
    throw new Error("Paystack secret key is not configured")
  }

  try {
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: data.email,
        amount: data.amount,
        reference: data.reference,
        metadata: data.metadata,
        channels: ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"],
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      console.error("Paystack initialization failed:", result)
      throw new Error(result.message || "Failed to initialize payment")
    }

    return result
  } catch (error) {
    console.error("Error initializing Paystack payment:", error)
    throw error
  }
}

export async function verifyPaystackPayment(reference: string) {
  if (!PAYSTACK_SECRET_KEY) {
    throw new Error("Paystack secret key is not configured")
  }

  try {
    console.log("Verifying payment with Paystack API:", reference)

    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    })

    const result = await response.json()
    console.log("Paystack verification response:", result)

    if (!response.ok) {
      console.error("Paystack verification request failed:", result)
      return {
        status: false,
        message: result.message || "Payment verification failed",
        data: null,
      }
    }

    // Check if payment was successful
    if (result.status && result.data && result.data.status === "success") {
      return {
        status: true,
        message: "Payment verified successfully",
        data: result.data,
      }
    } else {
      return {
        status: false,
        message: result.data?.gateway_response || "Payment was not successful",
        data: result.data,
      }
    }
  } catch (error) {
    console.error("Error verifying Paystack payment:", error)
    return {
      status: false,
      message: error instanceof Error ? error.message : "Payment verification failed",
      data: null,
    }
  }
}

export function verifyWebhookSignature(payload: string, signature: string): boolean {
  if (!PAYSTACK_SECRET_KEY) {
    console.error("Paystack secret key is not configured for webhook verification")
    return false
  }

  try {
    const hash = crypto.createHmac("sha512", PAYSTACK_SECRET_KEY).update(payload).digest("hex")
    return hash === signature
  } catch (error) {
    console.error("Error verifying webhook signature:", error)
    return false
  }
}
