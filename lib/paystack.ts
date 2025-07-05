// Determine execution environment
const isServer = typeof window === "undefined"

/**
 * Public key is safe to expose in the browser
 */
export const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || ""

/**
 * Secret key must ONLY be accessed on the server
 */
export const PAYSTACK_SECRET_KEY: string | undefined = isServer ? process.env.PAYSTACK_SECRET_KEY : undefined

// Validate keys
if (!PAYSTACK_PUBLIC_KEY) {
  throw new Error("Missing NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY environment variable")
}

if (isServer && !PAYSTACK_SECRET_KEY) {
  throw new Error("Missing PAYSTACK_SECRET_KEY environment variable")
}

export interface PaystackPaymentData {
  email: string
  amount: number // Amount in kobo
  reference: string
  currency?: string
  channels?: string[]
  metadata?: any
  callback_url?: string
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
    authorization: any
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
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `LBD_${timestamp}_${random}`
}

// Initialize payment with Paystack
export async function initializePayment(paymentData: PaystackPaymentData): Promise<PaystackResponse> {
  if (!isServer) {
    throw new Error("initializePayment can only be called on the server")
  }

  try {
    console.log("🚀 Initializing Paystack payment:", {
      email: paymentData.email,
      amount: paymentData.amount,
      reference: paymentData.reference,
    })

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: paymentData.email,
        amount: paymentData.amount,
        reference: paymentData.reference,
        currency: paymentData.currency || "NGN",
        channels: paymentData.channels || ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"],
        metadata: paymentData.metadata,
        callback_url: paymentData.callback_url,
      }),
    })

    const data = await response.json()

    console.log("📊 Paystack initialization response:", {
      status: data.status,
      message: data.message,
      hasAuthUrl: !!data.data?.authorization_url,
    })

    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}`)
    }

    return data
  } catch (error) {
    console.error("💥 Paystack initialization error:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to initialize payment")
  }
}

// Verify payment with Paystack
export async function verifyPayment(reference: string): Promise<PaystackVerificationResponse> {
  if (!isServer) {
    throw new Error("verifyPayment can only be called on the server")
  }

  try {
    console.log("🔍 Verifying Paystack payment:", reference)

    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()

    console.log("📊 Paystack verification response:", {
      status: data.status,
      message: data.message,
      paymentStatus: data.data?.status,
      amount: data.data?.amount,
    })

    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}`)
    }

    return data
  } catch (error) {
    console.error("💥 Paystack verification error:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to verify payment")
  }
}

// Convert naira to kobo for Paystack
export function convertToKobo(amountInNaira: number): number {
  return Math.round(amountInNaira * 100)
}

// Format amount for display (convert from kobo to naira)
export function formatAmount(amountInKobo: number): string {
  const amountInNaira = amountInKobo / 100
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(amountInNaira)
}
