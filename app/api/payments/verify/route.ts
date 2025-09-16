import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!

interface PaystackVerificationResponse {
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
    metadata: {
      customer_name?: string
      customer_phone?: string
      services?: string
      booking_date?: string
      booking_time?: string
      notes?: string
      total_amount?: number
      deposit_amount?: number
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
    }
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
    plan: any
    split: any
    order_id: string | null
    paidAt: string
    createdAt: string
    requested_amount: number
    pos_transaction_data: any
    source: any
    fees_breakdown: any
  }
}

async function verifyPaystackPayment(reference: string): Promise<PaystackVerificationResponse> {
  const maxRetries = 3
  const retryDelay = 1000

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔍 Verifying payment attempt ${attempt}/${maxRetries} for reference: ${reference}`)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000)

      const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Paystack verification API error: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const data: PaystackVerificationResponse = await response.json()
      console.log(`✅ Payment verification successful for: ${reference}`)
      return data

    } catch (error) {
      console.error(`❌ Payment verification attempt ${attempt} failed:`, error)

      if (attempt === maxRetries) {
        throw error
      }

      await new Promise(resolve => setTimeout(resolve, retryDelay * attempt))
    }
  }

  throw new Error("Max retries exceeded")
}

async function sendBookingConfirmationEmails(bookingData: any, paymentData: any) {
  try {
    console.log("📧 Sending booking confirmation emails...")

    // Import email functions
    const { sendCustomerBookingConfirmation, sendAdminBookingNotification } = await import("@/lib/email")

    const emailData = {
      customerName: bookingData.client_name,
      customerEmail: bookingData.client_email,
      customerPhone: bookingData.client_phone || bookingData.phone,
      services: [bookingData.service_name],
      bookingDate: bookingData.booking_date,
      bookingTime: bookingData.booking_time,
      totalAmount: bookingData.total_amount,
      depositAmount: bookingData.deposit_amount || bookingData.amount,
      paymentReference: paymentData.reference,
      notes: bookingData.notes || bookingData.special_notes,
      bookingId: bookingData.id?.toString()
    }

    // Send customer confirmation email
    const customerEmailResult = await sendCustomerBookingConfirmation(emailData)
    console.log("Customer email result:", customerEmailResult)

    // Send admin notification email
    const adminEmailResult = await sendAdminBookingNotification(emailData)
    console.log("Admin email result:", adminEmailResult)

    return {
      success: true,
      customerEmail: customerEmailResult,
      adminEmail: adminEmailResult
    }

  } catch (error) {
    console.error("❌ Error sending email notifications:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reference } = body

    if (!reference) {
      return NextResponse.json(
        { error: "Payment reference is required" },
        { status: 400 }
      )
    }

    console.log("🔍 Verifying payment:", reference)

    // Verify payment with Paystack
    const verificationResult = await verifyPaystackPayment(reference)

    if (!verificationResult.status) {
      console.error("❌ Payment verification failed:", verificationResult.message)
      return NextResponse.json(
        { error: "Payment verification failed", message: verificationResult.message },
        { status: 400 }
      )
    }

    const paymentData = verificationResult.data

    // Check if payment was successful
    if (paymentData.status !== "success") {
      console.error("❌ Payment was not successful:", paymentData.status)
      return NextResponse.json(
        { error: "Payment was not successful", status: paymentData.status },
        { status: 400 }
      )
    }

    console.log("✅ Payment verified successfully:", {
      reference: paymentData.reference,
      amount: paymentData.amount / 100,
      customer: paymentData.customer.email,
      status: paymentData.status
    })

    // Find and update the booking in database
    const { data: booking, error: findError } = await supabase
      .from("bookings")
      .select("*")
      .eq("payment_reference", reference)
      .single()

    if (findError || !booking) {
      console.error("❌ Booking not found:", findError)
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      )
    }

    // Update booking status to confirmed (only using columns that exist)
    const { data: updatedBooking, error: updateError } = await supabase
      .from("bookings")
      .update({
        payment_status: "completed",
        status: "confirmed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", booking.id)
      .select()
      .single()

    if (updateError) {
      console.error("❌ Error updating booking:", updateError)
      return NextResponse.json(
        { error: "Failed to update booking status" },
        { status: 500 }
      )
    }

    console.log("✅ Booking updated successfully:", updatedBooking.id)

    // Block the time slot to prevent double booking
    try {
      const { error: blockError } = await supabase
        .from("blocked_time_slots")
        .insert({
          blocked_date: booking.booking_date,
          blocked_time: booking.booking_time,
          reason: `Booked by ${booking.client_name}`,
          created_at: new Date().toISOString(),
        })

      if (blockError) {
        console.error("⚠️ Warning: Could not block time slot:", blockError)
        // Don't fail the entire process if blocking fails
      } else {
        console.log("✅ Time slot blocked successfully")
      }
    } catch (blockingError) {
      console.error("⚠️ Warning: Time slot blocking failed:", blockingError)
      // Continue with the process even if blocking fails
    }

    // Send confirmation emails (logged to console)
    await sendBookingConfirmationEmails(updatedBooking, paymentData)

    return NextResponse.json({
      success: true,
      message: "Payment verified and booking confirmed",
      data: {
        booking_id: updatedBooking.id,
        reference: paymentData.reference,
        amount: paymentData.amount / 100,
        status: paymentData.status,
        customer: paymentData.customer.email,
        booking_status: updatedBooking.status,
        payment_status: updatedBooking.payment_status,
      }
    })

  } catch (error) {
    console.error("❌ Payment verification error:", error)

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return NextResponse.json(
          { error: "Payment verification timed out. Please try again." },
          { status: 408 }
        )
      }

      if (error.message.includes('Paystack verification API error')) {
        return NextResponse.json(
          { error: "Payment verification service temporarily unavailable. Please try again." },
          { status: 503 }
        )
      }
    }

    return NextResponse.json(
      { error: "Payment verification failed. Please contact support." },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Paystack payment verification endpoint",
    status: "active",
    timestamp: new Date().toISOString(),
  })
}
