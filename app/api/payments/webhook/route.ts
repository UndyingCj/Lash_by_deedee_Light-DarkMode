import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import crypto from "crypto"
import { sendBookingConfirmationEmail, sendAdminNotificationEmail } from "@/lib/email"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    console.log("🔔 Webhook received")

    const body = await request.text()
    const signature = request.headers.get("x-paystack-signature")

    if (!signature) {
      console.error("❌ No signature provided")
      return NextResponse.json({ error: "No signature provided" }, { status: 400 })
    }

    // Verify webhook signature
    const hash = crypto.createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!).update(body).digest("hex")

    if (hash !== signature) {
      console.error("❌ Invalid signature")
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    const event = JSON.parse(body)
    console.log("📝 Webhook event:", event.event, "Reference:", event.data?.reference)

    // Handle charge.success event
    if (event.event === "charge.success") {
      const { reference, status, amount } = event.data

      if (status === "success") {
        console.log("💰 Processing successful payment:", reference)

        // Update booking status
        const { data: booking, error: updateError } = await supabase
          .from("bookings")
          .update({
            payment_status: "completed",
            status: "confirmed",
            updated_at: new Date().toISOString(),
          })
          .eq("payment_reference", reference)
          .select()
          .single()

        if (updateError) {
          console.error("❌ Failed to update booking:", updateError)
          return NextResponse.json({ error: "Failed to update booking" }, { status: 500 })
        }

        if (booking) {
          console.log("✅ Booking updated via webhook:", booking.id)

          // Send confirmation emails
          try {
            const emailBookingDetails = {
              customerName: booking.client_name,
              customerEmail: booking.client_email,
              customerPhone: booking.client_phone || booking.phone,
              serviceName: booking.service_name || booking.service,
              bookingDate: booking.booking_date,
              bookingTime: booking.booking_time,
              totalAmount: booking.total_amount || booking.amount,
              depositAmount: booking.deposit_amount,
              paymentReference: reference,
              notes: booking.notes || booking.special_notes,
            }

            await sendBookingConfirmationEmail(emailBookingDetails)
            await sendAdminNotificationEmail(emailBookingDetails)

            console.log("✅ Webhook emails sent successfully")
          } catch (emailError) {
            console.error("❌ Webhook email error:", emailError)
          }
        }
      }
    }

    return NextResponse.json({ status: "success" })
  } catch (error) {
    console.error("❌ Webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
