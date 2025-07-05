/* -------------------------------------------------------------------------- */
/*                       Environment-variable utilities                       */
/* -------------------------------------------------------------------------- */

const isServer = typeof window === "undefined"

/**
 * Access the Paystack secret key **only on the server**.
 * Returns undefined in the browser so client bundles never reference it.
 */
function getServerSecretKey() {
  return isServer ? process.env.PAYSTACK_SECRET_KEY : undefined
}

const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY

// Public key is safe to warn about in any runtime
if (!PAYSTACK_PUBLIC_KEY) {
  // eslint-disable-next-line no-console
  console.warn("⚠️  NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY is not set")
}

/* -------------------------------------------------------------------------- */
/*                               Conversions                                  */
/* -------------------------------------------------------------------------- */

export function convertToKobo(naira: number): number {
  return Math.round(naira * 100)
}

export function convertFromKobo(kobo: number): number {
  return kobo / 100
}

/* -------------------------------------------------------------------------- */
/*                              Ref generator                                 */
/* -------------------------------------------------------------------------- */

export function generatePaymentReference(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `LBD_${timestamp}_${random}`
}

/* -------------------------------------------------------------------------- */
/*                        Paystack server-side calls                          */
/* -------------------------------------------------------------------------- */

export interface PaystackInitializeData {
  email: string
  amount: number // already in kobo
  reference: string
  metadata?: Record<string, any>
}

export async function initializePaystackPayment(
  data: PaystackInitializeData,
): Promise<{ status: boolean; message: string; data?: any }> {
  const PAYSTACK_SECRET_KEY = getServerSecretKey()
  if (!PAYSTACK_SECRET_KEY) {
    return { status: false, message: "Paystack secret key not configured on server" }
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
      // eslint-disable-next-line no-console
      console.error("❌ Paystack init failed:", json)
      return { status: false, message: json.message || "Payment initialization failed" }
    }
    return { status: true, message: "Payment initialized", data: json.data }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("💥 Paystack init error:", err)
    return { status: false, message: (err as Error).message }
  }
}

export async function verifyPaystackPayment(
  reference: string,
): Promise<{ status: boolean; message: string; data?: any }> {
  const PAYSTACK_SECRET_KEY = getServerSecretKey()
  if (!PAYSTACK_SECRET_KEY) {
    return { status: false, message: "Paystack secret key not configured on server" }
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
      // eslint-disable-next-line no-console
      console.error("❌ Paystack verify failed:", json)
      return { status: false, message: json.message || "Payment verification failed" }
    }

    const success = json.data?.status === "success"
    return {
      status: success,
      message: success ? "Payment verified" : json.data?.gateway_response || "Payment failed",
      data: json.data,
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("💥 Paystack verify error:", err)
    return { status: false, message: (err as Error).message }
  }
}

/* -------------------------------------------------------------------------- */
/*                          Webhook signature check                           */
/* -------------------------------------------------------------------------- */

/**
 * Verify Paystack webhook signatures.
 * NOTE: Uses `crypto` only on the server so the browser bundle never pulls it in.
 */
export function verifyWebhookSignature(payload: string, signature: string): boolean {
  if (!isServer) return false // web bundle: noop

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { createHmac } = require("crypto") as typeof import("crypto")

  const secret = getServerSecretKey()
  if (!secret) return false

  try {
    const hash = createHmac("sha512", secret).update(payload).digest("hex")
    return hash === signature
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("💥 Webhook signature verification error:", err)
    return false
  }
}

/* -------------------------------------------------------------------------- */
/*                          Client-side public helper                         */
/* -------------------------------------------------------------------------- */

export function getPaystackPublicKey(): string {
  if (!PAYSTACK_PUBLIC_KEY) {
    throw new Error("NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY is not configured")
  }
  return PAYSTACK_PUBLIC_KEY
}
