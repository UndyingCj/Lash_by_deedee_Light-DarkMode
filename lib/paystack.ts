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
    metadata: {
      client_name: string
      phone: string
      email: string
      service: string | string[]
      booking_date: string
      booking_time: string
      notes?: string
      custom_fields?: Array<{
        display_name: string
        variable_name: string
        value: string
      }>
    }
    log: {
      start_time: number
      time_spent: number
      attempts: number
      errors: number
      success: boolean
      mobile: boolean
      input: any[]
      history: Array<{
        type: string
        message: string
        time: number
      }>
    }
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
    transaction_date: string
    plan_object: any
    subaccount: any
  }
}

export async function initializePayment(email: string, amount: number, metadata: any): Promise<PaystackResponse> {
  const response = await fetch("/api/payments/initialize", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount,
      metadata,
    }),
  })

  const data = await response.json()
  return data
}

export async function verifyPayment(reference: string): Promise<PaystackVerificationResponse> {
  const response = await fetch("/api/payments/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ reference }),
  })

  const data = await response.json()
  return data
}

export function formatAmount(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(amount)
}

export function convertToKobo(amount: number): number {
  return Math.round(amount * 100)
}

export function convertFromKobo(amount: number): number {
  return amount / 100
}
