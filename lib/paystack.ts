export function generatePaymentReference(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
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
  const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY

  if (!paystackSecretKey) {
    throw new Error("Paystack secret key is not configured")
  }

  try {
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || "Failed to initialize payment")
    }

    return result
  } catch (error) {
    console.error("Paystack initialization error:", error)
    throw error
  }
}

export async function verifyPayment(reference: string) {
  const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY

  if (!paystackSecretKey) {
    throw new Error("Paystack secret key is not configured")
  }

  try {
    console.log("🔍 Verifying payment with Paystack API:", reference)

    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
    })

    const result = await response.json()

    console.log("📊 Paystack verification response:", {
      status: result.status,
      message: result.message,
      dataStatus: result.data?.status,
      amount: result.data?.amount,
    })

    if (!response.ok) {
      console.error("❌ Paystack API error:", result)
      throw new Error(result.message || "Failed to verify payment")
    }

    return result
  } catch (error) {
    console.error("💥 Paystack verification error:", error)
    throw error
  }
}
