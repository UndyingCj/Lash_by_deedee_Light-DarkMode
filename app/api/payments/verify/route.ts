import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sendCustomerBookingConfirmation, sendAdminBookingNotification } from "@/lib/email"

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co', 
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'
)

interface PaystackVerifyResponse {
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
    metadata: any
    log: any
    fees: number
    fees_split: any
    authorization: any
    customer: any
    plan: any
    split: any
    order_id: any
    paidAt: string
    createdAt: string
    requested_amount: number
  }
}

async function verifyPaystackPayment(reference: string): Promise<PaystackVerifyResponse> {
  const maxRetries = 3
  const retryDelay = 1000 // 1 second

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔍 Verifying payment attempt ${attempt}/${maxRetries} for reference: ${reference}`)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

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
        throw new Error(`Paystack API error: ${response.status} ${response.statusText}`)
      }

      const data: PaystackVerifyResponse = await response.json()
      console.log(`✅ Payment verification successful for ${reference}:`, data.data.status)
      return data

    } catch (error) {
      console.error(`❌ Payment verification attempt ${attempt} failed:`, error)

      if (attempt === maxRetries) {
        throw error
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryDelay * attempt))
    }
  }

  throw new Error("Max retries exceeded")
}

export async function POST(request: NextRequest) {
  try {
    const { reference } = await request.json()

    if (!reference) {
      return NextResponse.json(
        { error: "Payment reference is required" },
        { status: 400 }
      )
    }

    console.log("🔍 Starting payment verification for reference:", reference)

    const verificationResult = await verifyPaystackPayment(reference)

    if (!verificationResult.status) {
      console.error("❌ Paystack verification failed:", verificationResult.message)
      return NextResponse.json(
        { 
          error: "Payment verification failed",
          message: verificationResult.message 
        },
        { status: 400 }
      )
    }

    const paymentData = verificationResult.data

    // Check if payment was successful
    if (paymentData.status !== "success") {
      console.error("❌ Payment was not successful:", paymentData.status)
      return NextResponse.json(
        {
          error: "Payment was not successful",
          status: paymentData.status,
          message: paymentData.gateway_response
        },
        { status: 400 }
      )
    }

    console.log("✅ Payment verification completed successfully")

    // Find and update the booking
    try {
      console.log("🔍 Looking for booking with reference:", reference)

      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .select("*")
        .eq("payment_reference", reference)
        .single()

      if (bookingError) {
        console.error("❌ Booking not found for reference:", reference, bookingError)
        return NextResponse.json({
          success: false,
          error: "Booking not found",
          message: "Could not find booking associated with this payment"
        }, { status: 404 })
      }

      console.log("📋 Found booking:", booking.id)

      // Update booking status if not already confirmed
      if (booking.payment_status !== "completed") {
        console.log("🔄 Updating booking status to confirmed")

        const { error: updateError } = await supabase
          .from("bookings")
          .update({
            payment_status: "completed",
            status: "confirmed",
            updated_at: new Date().toISOString(),
          })
          .eq("id", booking.id)

        if (updateError) {
          console.error("❌ Error updating booking status:", updateError)
        } else {
          console.log("✅ Booking status updated successfully")

          // Block the time slot to prevent double booking
          try {
            const { error: blockError } = await supabase.from("blocked_time_slots").upsert(
              {
                blocked_date: booking.booking_date,
                blocked_time: booking.booking_time,
                reason: `Booked by ${booking.client_name} - ${booking.service_name}`,
              },
              {
                onConflict: "blocked_date,blocked_time",
                ignoreDuplicates: true,
              },
            )

            if (blockError) {
              console.error("⚠️ Warning: Could not block time slot:", blockError.message)
            } else {
              console.log("🚫 Time slot blocked successfully")
            }
          } catch (blockError) {
            console.error("⚠️ Warning: Error blocking time slot:", blockError)
          }

          // Send confirmation emails (as backup to webhook)
          try {
            console.log("📧 Sending confirmation emails (verify route backup)...")

            const services = booking.service_name ? booking.service_name.split(", ") : [booking.service || "Service"]

            const emailData = {
              customerName: booking.client_name,
              customerEmail: booking.client_email,
              customerPhone: booking.client_phone || "",
              services,
              bookingDate: booking.booking_date,
              bookingTime: booking.booking_time,
              totalAmount: booking.total_amount,
              depositAmount: booking.deposit_amount,
              paymentReference: reference,
              notes: booking.notes || "",
              bookingId: booking.id.toString(),
            }

            const [customerResult, adminResult] = await Promise.all([
              sendCustomerBookingConfirmation(emailData),
              sendAdminBookingNotification(emailData)
            ])

            console.log("📧 Email results (verify route):", {
              customer: customerResult.success ? "✅ Sent" : "❌ Failed",
              admin: adminResult.success ? "✅ Sent" : "❌ Failed",
            })
          } catch (emailError) {
            console.error("⚠️ Warning: Email sending failed (verify route):", emailError)
          }
        }
      } else {
        console.log("ℹ️ Booking already confirmed, skipping updates")
      }

      // Return booking data for success page
      return NextResponse.json({
        success: true,
        status: "ok",
        message: "Payment verified successfully",
        booking: {
          id: booking.id.toString(),
          reference: reference,
          customer_name: booking.client_name,
          service: booking.service_name || booking.service,
          date: booking.booking_date,
          time: booking.booking_time,
          amount: booking.total_amount,
          deposit: booking.deposit_amount
        },
        payment: {
          reference: paymentData.reference,
          amount: paymentData.amount / 100, // Convert from kobo to naira
          status: paymentData.status,
          paidAt: paymentData.paid_at,
          channel: paymentData.channel,
          currency: paymentData.currency,
          customer: paymentData.customer,
          fees: paymentData.fees / 100, // Convert from kobo to naira
        }
      })

    } catch (dbError) {
      console.error("❌ Database error during booking processing:", dbError)
      return NextResponse.json({
        error: "Failed to process booking",
        message: "Payment verified but booking processing failed"
      }, { status: 500 })
    }

  } catch (error) {
    console.error("❌ Payment verification error:", error)

    // Handle specific error types
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return NextResponse.json(
          { error: "Payment verification timed out. Please try again." },
          { status: 408 }
        )
      }

      if (error.message.includes('Paystack API error')) {
        return NextResponse.json(
          { error: "Payment service temporarily unavailable. Please try again." },
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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const reference = searchParams.get("reference")

  if (!reference) {
    return NextResponse.json(
      { error: "Payment reference is required" },
      { status: 400 }
    )
  }

  try {
    console.log("🔍 GET payment verification for reference:", reference)

    const verificationResult = await verifyPaystackPayment(reference)

    return NextResponse.json({
      success: verificationResult.status,
      data: verificationResult.data
    })

  } catch (error) {
    console.error("❌ GET payment verification error:", error)
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500 }
    )
  }
}
