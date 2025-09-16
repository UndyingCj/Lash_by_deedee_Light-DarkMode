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
    
    // Log customer confirmation email
    console.log("📧 WEBHOOK CUSTOMER CONFIRMATION EMAIL:")
    console.log("To:", bookingData.client_email)
    console.log("Subject: Booking Confirmed - Lashed by Deedee")
    console.log(`
Dear ${bookingData.client_name},

🎉 Your booking has been confirmed via webhook!

BOOKING DETAILS:
- Services: ${bookingData.service_name}
- Date: ${new Date(bookingData.booking_date + "T12:00:00Z").toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })}
- Time: ${bookingData.booking_time}
- Total Amount: ₦${bookingData.total_amount.toLocaleString()}
- Deposit Paid: ₦${bookingData.deposit_amount.toLocaleString()}

PAYMENT DETAILS:
- Reference: ${paymentData.reference}
- Amount Paid: ₦${(paymentData.amount / 100).toLocaleString()}
- Payment Method: ${paymentData.channel}

Thank you for choosing Lashed by Deedee! ✨

Best regards,
Deedee
Lashed by Deedee
    `)

    // Log admin notification email
    console.log("📧 WEBHOOK ADMIN NOTIFICATION EMAIL:")
    console.log("To: admin@lashedbydeedee.com")
    console.log("Subject: New Booking Confirmed via Webhook")
    console.log(`
🎉 NEW BOOKING CONFIRMED VIA WEBHOOK

CUSTOMER DETAILS:
- Name: ${bookingData.client_name}
- Email: ${bookingData.client_email}
- Phone: ${bookingData.client_phone}

BOOKING DETAILS:
- Services: ${bookingData.service_name}
- Date: ${new Date(bookingData.booking_date + "T12:00:00Z").toLocaleDateString()}
- Time: ${bookingData.booking_time}

PAYMENT DETAILS:
- Reference: ${paymentData.reference}
- Amount: ₦${(paymentData.amount / 100).toLocaleString()}
- Channel: ${paymentData.channel}
    `)

    console.log("✅ Webhook email notifications logged successfully")
    return { success: true }

  } catch (error) {
    console.error("❌ Webhook email logging error:", error)
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
