// Paystack integration utilities with LIVE API keys
const PAYSTACK_SECRET_KEY = "sk_live_f3437bf92100d5b73c6aa72e78d7db300d9029bb"
const PAYSTACK_PUBLIC_KEY = "pk_live_edddbd4959b95ee7d1eebe12b71b68f8ce5ff0a7"

export interface PaymentInitializationData {
  customerName: string
  customerEmail: string
  customerPhone: string
  services: string[]
  bookingDate: string
  bookingTime: string
  totalAmount: number
  depositAmount: number
  notes?: string
}

export interface PaystackResponse {
  status: boolean
  message: string
  data?: any
}

// Convert naira to kobo (Paystack uses kobo)
export function convertToKobo(naira: number): number {
  return Math.round(naira * 100)
}

// Convert kobo to naira
export function convertFromKobo(kobo: number): number {
  return Math.round(kobo / 100)
}

// Generate unique payment reference
export function generatePaymentReference(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return `LBD_${timestamp}_${random}`.toUpperCase()
}

// Initialize payment with Paystack
export async function initializePaystackPayment(data: PaymentInitializationData): Promise<PaystackResponse> {
  try {
    const reference = generatePaymentReference()
    const amountInKobo = convertToKobo(data.depositAmount)

    console.log("💰 Initializing payment:", {
      amount: data.depositAmount,
      amountInKobo,
      reference,
      email: data.customerEmail,
      customer: data.customerName,
    })

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: data.customerEmail,
        amount: amountInKobo,
        reference: reference,
        currency: "NGN",
        metadata: {
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          services: data.services,
          bookingDate: data.bookingDate,
          bookingTime: data.bookingTime,
          totalAmount: data.totalAmount,
          depositAmount: data.depositAmount,
          notes: data.notes || "",
        },
        callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/book?payment=success`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/book?payment=cancelled`,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      console.error("❌ Paystack API error:", result)
      return {
        status: false,
        message: result.message || "Payment initialization failed",
      }
    }

    console.log("✅ Payment initialized:", result.data.reference)

    return {
      status: true,
      message: "Payment initialized successfully",
      data: {
        ...result.data,
        public_key: PAYSTACK_PUBLIC_KEY, // Include public key for frontend
      },
    }
  } catch (error) {
    console.error("❌ Payment initialization error:", error)
    return {
      status: false,
      message: error instanceof Error ? error.message : "Payment initialization failed",
    }
  }
}

// Verify payment with Paystack
export async function verifyPaystackPayment(reference: string): Promise<PaystackResponse> {
  try {
    console.log("🔍 Verifying payment:", reference)

    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    })

    const result = await response.json()

    if (!response.ok) {
      console.error("❌ Paystack verification error:", result)
      return {
        status: false,
        message: result.message || "Payment verification failed",
      }
    }

    if (result.data.status !== "success") {
      console.error("❌ Payment not successful:", result.data.status)
      return {
        status: false,
        message: `Payment status: ${result.data.status}`,
      }
    }

    console.log("✅ Payment verified successfully:", {
      reference: result.data.reference,
      amount: result.data.amount,
      status: result.data.status,
    })

    return {
      status: true,
      message: "Payment verified successfully",
      data: result.data,
    }
  } catch (error) {
    console.error("❌ Payment verification error:", error)
    return {
      status: false,
      message: error instanceof Error ? error.message : "Payment verification failed",
    }
  }
}

// Get Paystack public key (safe for client-side)
export function getPaystackPublicKey(): string {
  return PAYSTACK_PUBLIC_KEY
}
