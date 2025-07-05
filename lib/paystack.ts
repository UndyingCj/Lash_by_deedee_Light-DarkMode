import crypto from "crypto"

/* -------------------------------------------------------------------------- */
/*                        Environment-variable validation                     */
/* -------------------------------------------------------------------------- */

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY

if (typeof window === "undefined" && !PAYSTACK_SECRET_KEY) {
  console.error("⚠️  PAYSTACK_SECRET_KEY is not set")
}
if (!PAYSTACK_PUBLIC_KEY) {
  console.error("⚠️  NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY is not set")
}

/* -------------------------------------------------------------------------- */
/*                              Helper functions                              */
/* -------------------------------------------------------------------------- */

/**
 * Generate a unique Paystack reference.
 * Example: LBD_1720199012345_Y7HD2R
 */
export function generatePaymentReference(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `LBD_${timestamp}_${random}`
}

/**
 * Convert a naira amount to kobo (whole number).
 * e.g.  25000 (₦25,000) ➜ 2 500 000 kobo
 */
export function convertToKobo(naira: number): number {
  return Math.round(naira * 100)
}

/**
 * Convert kobo back to naira (floating-point).
 * e.g. 2 500 000 kobo ➜ 25000 (₦25,000)
 */
export function convertFromKobo(kobo: number): number {
  return kobo / 100
}

/* -------------------------------------------------------------------------- */
/*                               Type helpers                                 */
/* -------------------------------------------------------------------------- */

export interface PaystackInitializeData {
  email: string
  amount: number
  reference: string
  metadata?: Record<string, any>
}

export interface PaystackResponse<T = any> {
  status: boolean
  message: string
  data?: T
}

/* -------------------------------------------------------------------------- */
/*                          Paystack API interactions                         */
/* -------------------------------------------------------------------------- */

export async function initializePaystackPayment(data: PaystackInitializeData): Promise<PaystackResponse> {
  if (!PAYSTACK_SECRET_KEY) {
    return { status: false, message: "Paystack secret key not configured" }
  }

  try {
    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...data,
        channels: ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"],
      }),
    })
    const json = await res.json()
    if (!res.ok) {
      console.error("❌ Paystack init failed:", json)
      return { status: false, message: json.message || "Payment initialization failed" }
    }
    return { status: true, message: "Payment initialized", data: json.data }
  } catch (err) {
    console.error("💥 Paystack init error:", err)
    return { status: false, message: (err as Error).message }
  }
}

export async function verifyPaystackPayment(reference: string): Promise<PaystackResponse> {
  if (!PAYSTACK_SECRET_KEY) {
    return { status: false, message: "Paystack secret key not configured" }
  }

  try {
    const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    })
    const json = await res.json()
    if (!res.ok) {
      console.error("❌ Paystack verify failed:", json)
      return { status: false, message: json.message || "Payment verification failed" }
    }
    /* Paystack returns status === "success" in json.data.status for successful txns */
    const success = json.data?.status === "success"
    return {
      status: success,
      message: success ? "Payment verified" : json.data?.gateway_response || "Payment failed",
      data: json.data,
    }
  } catch (err) {
    console.error("💥 Paystack verify error:", err)
    return { status: false, message: (err as Error).message }
  }
}

/* -------------------------------------------------------------------------- */
/*                          Webhook-signature helper                          */
/* -------------------------------------------------------------------------- */

export function verifyWebhookSignature(payload: string, signature: string): boolean {
  if (!PAYSTACK_SECRET_KEY) {
    console.error("⚠️  Cannot verify webhook without secret key")
    return false
  }
  try {
    const hash = crypto.createHmac("sha512", PAYSTACK_SECRET_KEY).update(payload).digest("hex")
    return hash === signature
  } catch (err) {
    console.error("💥 Webhook signature verification error:", err)
    return false
  }
}
