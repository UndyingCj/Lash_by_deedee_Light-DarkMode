// Paystack configuration and utilities
// Determine execution environment
const isServer = typeof window === "undefined"

/**
 * Public key is safe to expose in the browser; using live keys for production
 */
export const PAYSTACK_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_live_edddbd4959b95ee7d1eebe12b71b68f8ce5ff0a7"

/**
 * Secret key must ONLY be accessed on the server.  It is therefore undefined in
 * the browser bundle to avoid leaking credentials or throwing errors there.
 */
export const PAYSTACK_SECRET_KEY: string | undefined = isServer
  ? process.env.PAYSTACK_SECRET_KEY || "sk_live_f3437bf92100d5b73c6aa72e78d7db300d9029bb"
  : undefined

// Validate the secret key strictly on the server.  Client bundles will skip this.
if (isServer && !PAYSTACK_SECRET_KEY) {
  throw new Error("Missing PAYSTACK_SECRET_KEY environment variable")
}

// Paystack configuration and utilities
if (!PAYSTACK_PUBLIC_KEY) {
  throw new Error("Missing NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY environment variable")
}

export interface PaystackPaymentData {
  email: string
  amount: number // Amount in kobo (multiply by 100)
  reference: string
  currency?: string
  channels?: string[]
  metadata?: {
    customerName: string
    customerPhone: string
    services: string[]
    bookingDate: string
    bookingTime: string
    totalAmount: number
    depositAmount: number
    notes?: string
  }
}

export interface PaystackResponse {
  status: boolean
  message: string
  data?: {
    authorization_url: string
    access_code: string
    reference: string
  }
}

export interface PaystackVerificationResponse {
  status: boolean
  message: string
  data?: {
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
    authorization: {
      authorization_code: string
      bin: string
      last4: string
      exp_month: string
      exp_year: string
      channel: string
      card_type: string
      bank: string
      country_code: string
      brand: string
      reusable: boolean
      signature: string
      account_name: string | null
    }
    customer: {
      id: number
      first_name: string | null
      last_name: string | null
      email: string
      customer_code: string
      phone: string | null
      metadata: any
      risk_action: string
      international_format_phone: string | null
    }
    plan: any
    split: any
    order_id: any
    paidAt: string
    createdAt: string
    requested_amount: number
    pos_transaction_data: any
    source: any
    fees_breakdown: any
  }
}

// Generate unique payment reference
export function generatePaymentReference(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return `LBD_${timestamp}_${random}`.toUpperCase()
}

// Initialize payment with Paystack
export async function initializePayment(paymentData: PaystackPaymentData): Promise<PaystackResponse> {
  try {
    const secret = PAYSTACK_SECRET_KEY
    if (!secret) {
      throw new Error("PAYSTACK_SECRET_KEY unavailable on server")
    }
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: paymentData.email,
        amount: paymentData.amount,
        reference: paymentData.reference,
        currency: paymentData.currency || "NGN",
        channels: paymentData.channels || ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"],
        metadata: paymentData.metadata,
        callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payments/callback`,
      }),
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error initializing payment:", error)
    throw new Error("Failed to initialize payment")
  }
}

// Verify payment with Paystack
export async function verifyPayment(reference: string): Promise<PaystackVerificationResponse> {
  try {
    const secret = PAYSTACK_SECRET_KEY
    if (!secret) {
      throw new Error("PAYSTACK_SECRET_KEY unavailable on server")
    }
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error verifying payment:", error)
    throw new Error("Failed to verify payment")
  }
}

// Verify webhook signature
export function verifyWebhookSignature(payload: string, signature: string): boolean {
  try {
    const crypto = require("crypto")
    const secret = PAYSTACK_SECRET_KEY
    if (!secret) {
      throw new Error("PAYSTACK_SECRET_KEY unavailable on server")
    }
    const hash = crypto.createHmac("sha512", secret).update(payload).digest("hex")
    return hash === signature
  } catch (error) {
    console.error("Error verifying webhook signature:", error)
    return false
  }
}

// Format amount for display (convert from kobo to naira)
export function formatAmount(amountInKobo: number): string {
  const amountInNaira = amountInKobo / 100
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(amountInNaira)
}

// Convert naira to kobo for Paystack
export function convertToKobo(amountInNaira: number): number {
  return Math.round(amountInNaira * 100)
}
