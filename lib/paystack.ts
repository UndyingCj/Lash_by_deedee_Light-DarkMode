export const PAYSTACK_CONFIG = {
  publicKey:
    process.env.NODE_ENV === "production"
      ? "pk_live_edddbd4959b95ee7d1eebe12b71b68f8ce5ff0a7"
      : "pk_test_your_test_key_here",
  secretKey:
    process.env.NODE_ENV === "production"
      ? "sk_live_f3437bf92100d5b73c6aa72e78d7db300d9029bb"
      : "sk_test_your_test_key_here",
  baseUrl: "https://api.paystack.co",
}

export interface PaystackInitializeResponse {
  status: boolean
  message: string
  data: {
    authorization_url: string
    access_code: string
    reference: string
  }
}

export interface PaystackVerifyResponse {
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
      first_name: string
      last_name: string
      email: string
      customer_code: string
      phone: string
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

export async function initializePayment(
  email: string,
  amount: number,
  reference: string,
  metadata?: any,
): Promise<PaystackInitializeResponse> {
  const response = await fetch(`${PAYSTACK_CONFIG.baseUrl}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_CONFIG.secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount: amount * 100, // Convert to kobo
      reference,
      metadata,
      callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/book/success`,
    }),
  })

  if (!response.ok) {
    throw new Error(`Paystack API error: ${response.status}`)
  }

  return response.json()
}

export async function verifyPayment(reference: string): Promise<PaystackVerifyResponse> {
  const response = await fetch(`${PAYSTACK_CONFIG.baseUrl}/transaction/verify/${reference}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${PAYSTACK_CONFIG.secretKey}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`Paystack verification error: ${response.status}`)
  }

  return response.json()
}

export function generateReference(): string {
  return `lbd_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
}
