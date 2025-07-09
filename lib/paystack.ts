interface PaystackVerificationResponse {
  status: boolean
  message: string
  data?: {
    reference: string
    amount: number
    status: string
    customer: {
      email: string
      first_name?: string
      last_name?: string
    }
    metadata: {
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
  }
}

export async function verifyPaystackPayment(reference: string): Promise<PaystackVerificationResponse> {
  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        status: false,
        message: data.message || "Payment verification failed",
      }
    }

    return {
      status: data.status,
      message: data.message,
      data: data.data,
    }
  } catch (error) {
    console.error("Paystack verification error:", error)
    return {
      status: false,
      message: "Failed to verify payment",
    }
  }
}

interface PaystackInitializeData {
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

interface PaystackResponse {
  status: boolean
  message: string
  data?: {
    authorization_url: string
    access_code: string
    reference: string
    amount: number
    public_key: string
  }
}

export async function initializePaystackPayment(data: PaystackInitializeData): Promise<PaystackResponse> {
  try {
    const secretKey = process.env.PAYSTACK_SECRET_KEY
    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
    if (!secretKey) throw new Error("Paystack secret key not configured")
    if (!publicKey) throw new Error("Paystack public key not configured")

    // Convert NGN → kobo
    const amountInKobo = Math.round(data.depositAmount * 100)
    const reference = `LBD_${Date.now()}_${Math.random().toString(36).slice(2, 8).toUpperCase()}`

    const payload = {
      email: data.customerEmail, // ✅ now populated
      amount: amountInKobo,
      currency: "NGN",
      reference,
      callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payments/callback`,
      metadata: {
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        services: data.services,
        bookingDate: data.bookingDate,
        bookingTime: data.bookingTime,
        totalAmount: data.totalAmount,
        depositAmount: data.depositAmount,
        notes: data.notes ?? "",
      },
    }

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
    const result = await response.json()

    if (!response.ok || !result.status) {
      return { status: false, message: result.message || "Payment initialization failed" }
    }

    return {
      status: true,
      message: "Payment initialized successfully",
      data: {
        authorization_url: result.data.authorization_url,
        access_code: result.data.access_code,
        reference: result.data.reference,
        amount: amountInKobo,
        public_key: publicKey,
      },
    }
  } catch (err) {
    console.error("❌ Paystack initialization error:", err)
    return { status: false, message: err instanceof Error ? err.message : "Payment init failed" }
  }
}
