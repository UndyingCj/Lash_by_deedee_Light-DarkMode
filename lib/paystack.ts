// Server-side environment variable validation (only runs on server)
if (typeof window === "undefined") {
  if (!process.env.PAYSTACK_SECRET_KEY) {
    throw new Error("PAYSTACK_SECRET_KEY is not set in environment variables")
  }
}

export function generatePaymentReference(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)
  return `LBD_${timestamp}_${random}`
}

export function convertToKobo(amount: number): number {
  return Math.round(amount * 100)
}

export async function initializePayment(data: {
  email: string
  amount: number
  reference: string
  metadata?: any
}) {
  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  return response.json()
}

export async function verifyPayment(reference: string) {
  const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
  })

  return response.json()
}
