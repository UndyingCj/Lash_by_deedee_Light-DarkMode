import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

interface PaymentData {
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

export async function initializePaystackPayment(data: PaymentData) {
  try {
    console.log("🚀 Initializing Paystack payment:", {
      customer: data.customerName,
      email: data.customerEmail,
      amount: data.depositAmount,
    })

    // Generate unique reference
    const reference = `LBD_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    // Prepare metadata
    const metadata = {
      customer_name: data.customerName,
      customer_phone: data.customerPhone,
      services: data.services.join(", "),
      booking_date: data.bookingDate,
      booking_time: data.bookingTime,
      total_amount: data.totalAmount.toString(),
      deposit_amount: data.depositAmount.toString(),
      notes: data.notes || "",
      booking_source: "website",
    }

    console.log("📋 Payment metadata:", metadata)

    // Initialize payment with Paystack
    const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: data.customerEmail,
        amount: Math.round(data.depositAmount * 100), // Convert to kobo
        currency: "NGN",
        reference: reference,
        callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/book/success`,
        metadata: metadata,
        channels: ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"],
      }),
    })

    if (!paystackResponse.ok) {
      const errorText = await paystackResponse.text()
      console.error("❌ Paystack API error:", errorText)
      throw new Error(`Paystack API error: ${paystackResponse.status}`)
    }

    const paystackData = await paystackResponse.json()
    console.log("📊 Paystack response:", paystackData)

    if (!paystackData.status) {
      console.error("❌ Paystack initialization failed:", paystackData.message)
      return {
        status: false,
        message: paystackData.message || "Payment initialization failed",
      }
    }

    // Store pending booking in database
    try {
      const { error: dbError } = await supabase.from("bookings").insert({
        customer_name: data.customerName,
        customer_email: data.customerEmail,
        customer_phone: data.customerPhone,
        services: data.services,
        appointment_date: data.bookingDate,
        appointment_time: data.bookingTime,
        total_amount: data.totalAmount,
        deposit_amount: data.depositAmount,
        payment_reference: reference,
        payment_status: "pending",
        notes: data.notes || "",
        created_at: new Date().toISOString(),
      })

      if (dbError) {
        console.error("⚠️ Database insert failed:", dbError)
        // Continue with payment even if DB insert fails
      } else {
        console.log("✅ Pending booking stored in database")
      }
    } catch (dbError) {
      console.error("⚠️ Database error:", dbError)
      // Continue with payment even if DB fails
    }

    console.log("✅ Payment initialized successfully")

    return {
      status: true,
      message: "Payment initialized successfully",
      data: {
        reference: reference,
        authorization_url: paystackData.data.authorization_url,
        access_code: paystackData.data.access_code,
        amount: Math.round(data.depositAmount * 100), // Amount in kobo
        public_key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
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

export async function verifyPaystackPayment(reference: string) {
  try {
    console.log("🔍 Verifying payment:", reference)

    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Paystack verification API error:", errorText)
      throw new Error(`Paystack verification failed: ${response.status}`)
    }

    const data = await response.json()
    console.log("📊 Paystack verification response:", data)

    if (!data.status) {
      console.error("❌ Payment verification failed:", data.message)
      return {
        status: false,
        message: data.message || "Payment verification failed",
      }
    }

    const transaction = data.data
    console.log("💳 Transaction details:", {
      reference: transaction.reference,
      status: transaction.status,
      amount: transaction.amount,
      customer: transaction.customer.email,
    })

    return {
      status: true,
      message: "Payment verified successfully",
      data: transaction,
    }
  } catch (error) {
    console.error("❌ Payment verification error:", error)
    return {
      status: false,
      message: error instanceof Error ? error.message : "Payment verification failed",
    }
  }
}
