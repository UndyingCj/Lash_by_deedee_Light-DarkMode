import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import crypto from "crypto"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!

function verifyPaystackSignature(payload: string, signature: string): boolean {
  const hash = crypto
    .createHmac('sha512', PAYSTACK_SECRET_KEY)
    .update(payload, 'utf8')
    .digest('hex')
  
  return hash === signature
}

async function sendBookingConfirmationEmails(bookingData: any, paymentData: any) {
  try {
    console.log("📧 Webhook: Sending booking confirmation emails...")

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
    console.log("Webhook customer email result:", customerEmailResult)

    // Send admin notification email
    const adminEmailResult = await sendAdminBookingNotification(emailData)
    console.log("Webhook admin email result:", adminEmailResult)

    return {
      success: true,
      customerEmail: customerEmailResult,
      adminEmail: adminEmailResult
    }

  } catch (error) {
    console.error("❌ Webhook email sending error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-paystack-signature')

    if (!signature) {
      console.error("❌ No Paystack signature found")
      return NextResponse.json({ error: "No signature" }, { status: 400 })
    }

    // Verify webhook signature
    if (!verifyPaystackSignature(body, signature)) {
      console.error("❌ Invalid Paystack signature")
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    const event = JSON.parse(body)
    console.log("🔔 Paystack webhook received:", event.event, event.data?.reference)

    // Handle charge.success event
    if (event.event === 'charge.success') {
      const paymentData = event.data

      if (paymentData.status === 'success') {
        console.log("✅ Processing successful payment webhook:", paymentData.reference)

        // Find the booking
        const { data: booking, error: findError } = await supabase
          .from("bookings")
          .select("*")
          .eq("payment_reference", paymentData.reference)
          .single()

        if (findError || !booking) {
          console.error("❌ Booking not found for webhook:", paymentData.reference)
          return NextResponse.json({ error: "Booking not found" }, { status: 404 })
        }

        // Update booking status if not already confirmed
        if (booking.status !== 'confirmed') {
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
            console.error("❌ Error updating booking via webhook:", updateError)
            return NextResponse.json({ error: "Failed to update booking" }, { status: 500 })
          }

          console.log("✅ Booking confirmed via webhook:", updatedBooking.id)

          // Block the time slot
          try {
            const { error: blockError } = await supabase
              .from("blocked_time_slots")
              .insert({
                blocked_date: booking.booking_date,
                blocked_time: booking.booking_time,
                reason: `Booked by ${booking.client_name} (webhook)`,
                created_at: new Date().toISOString(),
              })

            if (blockError) {
              console.error("⚠️ Webhook warning: Could not block time slot:", blockError)
            } else {
              console.log("✅ Time slot blocked via webhook")
            }
          } catch (blockingError) {
            console.error("⚠️ Webhook time slot blocking failed:", blockingError)
          }

          // Send confirmation emails
          await sendBookingConfirmationEmails(updatedBooking, paymentData)
        } else {
          console.log("ℹ️ Booking already confirmed, skipping webhook update")
        }
      }
    }

    return NextResponse.json({ status: "success" })

  } catch (error) {
    console.error("❌ Webhook processing error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Paystack webhook endpoint",
    status: "active",
    timestamp: new Date().toISOString(),
  })
}
