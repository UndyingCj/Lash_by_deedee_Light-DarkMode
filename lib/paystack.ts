/**
 * Central Paystack helper for Lashed-by-DeeDee
 *
 *  • Generates a unique reference
 *  • Converts ₦ → kobo (and back)
 *  • Talks to Paystack’s REST API for initialise / verify
 *  • Verifies web-hook signatures
 */

const isServer = typeof window === "undefined"

/* -------------------------------------------------------------------------- */
/*  Keys & guards                                                             */
/* -------------------------------------------------------------------------- */
export const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? ""

if (!PAYSTACK_PUBLIC_KEY) {
  /* eslint-disable no-console */
  console.warn("⚠️  NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY is not defined. " + "Payments will be disabled on the client.")
  /* eslint-enable no-console */
}

export const PAYSTACK_SECRET_KEY: string | undefined = isServer
  ? process.env.PAYSTACK_SECRET_KEY || "sk_live_f3437bf92100d5b73c6aa72e78d7db300d9029bb"
  : undefined

if (isServer && !PAYSTACK_SECRET_KEY) {
  throw new Error("Missing PAYSTACK_SECRET_KEY environment variable")
}

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */
export interface PaystackInitResponse {
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
    status: string // "success"
    reference: string
    amount: number
    currency: string
    paid_at: string
    [key: string]: unknown
  }
}

export interface PaymentMetadata {
  [key: string]: string | number
}

export interface PaymentInitArgs {
  amount: number
  email: string
  fullName?: string
  phone?: string
  metadata?: PaymentMetadata
}

/* -------------------------------------------------------------------------- */
/*  Utility helpers                                                           */
/* -------------------------------------------------------------------------- */
export function generatePaymentReference(): string {
  return `PSK_${Date.now()}`
}

export function convertToKobo(naira: number): number {
  return Math.round(naira * 100)
}
export function convertFromKobo(kobo: number): number {
  return kobo / 100
}

export function formatAmount(naira: number): string {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(naira)
}

/* -------------------------------------------------------------------------- */
/*  Server-side API helpers                                                   */
/* -------------------------------------------------------------------------- */
export async function initialisePayment(payload: PaymentInitArgs): Promise<PaystackInitResponse> {
  if (!isServer) throw new Error("initialisePayment must run on the server")

  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: payload.email,
      amount: convertToKobo(payload.amount),
      reference: generatePaymentReference(),
      currency: "NGN",
      metadata: payload.metadata,
      callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payments/callback`,
    }),
  })
  return res.json()
}

export async function verifyPayment(reference: string): Promise<PaystackVerifyResponse> {
  if (!isServer) throw new Error("verifyPayment must run on the server")

  const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
  })
  return res.json()
}

/* -------------------------------------------------------------------------- */
/*  Web-hook signature check                                                  */
/* -------------------------------------------------------------------------- */
export function verifyWebhookSignature(payload: string, signature: string): boolean {
  if (!isServer) return false
  const crypto = require("crypto")
  const hash = crypto.createHmac("sha512", PAYSTACK_SECRET_KEY!).update(payload).digest("hex")
  return hash === signature
}
