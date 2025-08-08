import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import crypto from "crypto"
import { sendCustomerBookingConfirmation, sendAdminBookingNotification } from "@/lib/email"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co', process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key')

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("x-paystack-signature")

    console.log("🔔 Webhook received from Paystack")

    if (!signature) {
      console.error("❌ No signature provided")
      return NextResponse.json({ error: "No signature provided" }, { status: 400 })
    }

    // Verify webhook signature
    const secretKey = process.env.PAYSTACK_SECRET_KEY || 'placeholder-secret'
    const hash = crypto.createHmac("sha512", secretKey).update(body).digest("hex")

    if (hash !== signature) {
      console.error("❌ Invalid signature:", {
        received: signature,
        calculated: hash,
        hasSecretKey: !!process.env.PAYSTACK_SECRET_KEY
      })
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    const event = JSON.parse(body)
    console.log("📨 Webhook event:", event.event, "Reference:", event.data?.reference)

    // Handle successful payment
    if (event.event === "charge.success") {
      const paymentData = event.data
      const reference = paymentData.reference

      console.log("💳 Processing successful payment:", reference)

      // Find booking by payment reference
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .select("*")
        .eq("payment_reference", reference)
        .single()

      if (bookingError) {
        console.error("❌ Booking not found for reference:", reference, bookingError)
        return NextResponse.json({ error: "Booking not found" }, { status: 404 })
      }

      // Update booking status to confirmed
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
        return NextResponse.json({ error: "Failed to update booking" }, { status: 500 })
      }

      console.log("✅ Booking confirmed:", booking.id)

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

      // Send confirmation emails
      try {
        console.log("📧 Sending confirmation emails...")

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
          bookingId: booking.id,
        }

        const [customerResult, adminResult] = await Promise.all([
          sendCustomerBookingConfirmation(emailData),
          sendAdminBookingNotification(emailData)
        ])

        console.log("📧 Email results (webhook):", {
          customer: customerResult.success ? "✅ Sent" : `❌ Failed: ${customerResult.message}`,
          admin: adminResult.success ? "✅ Sent" : `❌ Failed: ${adminResult.message}`,
        })

        // Log detailed email results for debugging
        if (!customerResult.success) {
          console.error("❌ Customer email failed:", customerResult)
        }
        if (!adminResult.success) {
          console.error("❌ Admin email failed:", adminResult)
        }
      } catch (emailError) {
        console.error("⚠️ Warning: Email sending failed:", emailError)
      }

      return NextResponse.json({ message: "Webhook processed successfully" })
    }

    // Handle failed payment
    if (event.event === "charge.failed") {
      const paymentData = event.data
      const reference = paymentData.reference

      console.log("❌ Processing failed payment:", reference)

      // Update booking status to failed
      const { error: updateError } = await supabase
        .from("bookings")
        .update({
          payment_status: "failed",
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("payment_reference", reference)

      if (updateError) {
        console.error("❌ Error updating failed booking:", updateError)
      } else {
        console.log("✅ Booking marked as failed")
      }

      return NextResponse.json({ message: "Failed payment processed" })
    }

    console.log("ℹ️ Unhandled webhook event:", event.event)
    return NextResponse.json({ message: "Event received" })
  } catch (error) {
    console.error("❌ Webhook processing error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Paystack webhook endpoint is active",
    timestamp: new Date().toISOString(),
  })
}
