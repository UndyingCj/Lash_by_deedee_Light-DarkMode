export interface PaystackConfig {
  publicKey: string
  secretKey: string
}

export const paystackConfig: PaystackConfig = {
  publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "",
  secretKey: process.env.PAYSTACK_SECRET_KEY || "",
}

export interface PaystackPaymentData {
  email: string
  amount: number // in kobo (multiply by 100)
  currency: string
  reference: string
  callback_url?: string
  metadata?: {
    custom_fields: Array<{
      display_name: string
      variable_name: string
      value: string
    }>
  }
  channels?: string[] // Remove crypto channels
}

export const createPaystackPayment = (bookingData: any): PaystackPaymentData => {
  const reference = `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  return {
    email: bookingData.customerEmail,
    amount: bookingData.depositAmount * 100, // Convert to kobo
    currency: "NGN",
    reference,
    channels: ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"], // No crypto
    metadata: {
      custom_fields: [
        {
          display_name: "Customer Name",
          variable_name: "customer_name",
          value: bookingData.customerName,
        },
        {
          display_name: "Services",
          variable_name: "services",
          value: bookingData.services.join(", "),
        },
        {
          display_name: "Appointment Date",
          variable_name: "appointment_date",
          value: bookingData.date,
        },
        {
          display_name: "Appointment Time",
          variable_name: "appointment_time",
          value: bookingData.time,
        },
      ],
    },
  }
}

export const verifyPaystackPayment = async (reference: string) => {
  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${paystackConfig.secretKey}`,
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error verifying payment:", error)
    throw error
  }
}
