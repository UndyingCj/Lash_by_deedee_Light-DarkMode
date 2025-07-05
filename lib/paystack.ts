const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!
const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!

if (!PAYSTACK_SECRET_KEY) {
  throw new Error("PAYSTACK_SECRET_KEY is not set in environment variables")
}

if (!PAYSTACK_PUBLIC_KEY) {
  throw new Error("NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY is not set in environment variables")
}

export interface PaystackInitializeResponse {
  status: boolean
  message: string
  data?: {
    authorization_url: string
    access_code: string
    reference: string
  }
}

export interface PaystackVerifyResponse {
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

export async function initializePayment(data: {
  email: string
  amount: number
  reference: string
  metadata?: any
}): Promise<PaystackInitializeResponse> {
  try {
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()
    return result
  } catch (error) {
    console.error("Paystack initialization error:", error)
    return {
      status: false,
      message: "Failed to initialize payment",
    }
  }
}

export async function verifyPayment(reference: string): Promise<PaystackVerifyResponse> {
  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    })

    const result = await response.json()
    return result
  } catch (error) {
    console.error("Paystack verification error:", error)
    return {
      status: false,
      message: "Failed to verify payment",
    }
  }
}

export function generatePaymentReference(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)
  return `LBD_${timestamp}_${random}`.toUpperCase()
}

export function convertToKobo(amount: number): number {
  return Math.round(amount * 100)
}

export function convertFromKobo(amount: number): number {
  return Math.round(amount / 100)
}
