import { type NextRequest, NextResponse } from "next/server"
import { verifyWebhookSignature } from "@/lib/paystack"
import { updateBooking, getBookings } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("x-paystack-signature")

    if (!signature) {
      console.error("No signature provided in webhook")
      return NextResponse.json({ status: false, message: "No signature provided" }, { status: 400 })
    }

    // Verify webhook signature
    const isValidSignature = verifyWebhookSignature(body, signature)
    if (!isValidSignature) {
      console.error("Invalid webhook signature")
      return NextResponse.json({ status: false, message: "Invalid signature" }, { status: 400 })
    }

    const event = JSON.parse(body)
    console.log("Webhook event received:", event.event, event.data?.reference)

    // Handle different webhook events
    switch (event.event) {
      case "charge.success":
        await handleSuccessfulPayment(event.data)
        break

      case "charge.failed":
        await handleFailedPayment(event.data)
        break

      case "charge.dispute.create":
        await handleDispute(event.data)
        break

      default:
        console.log("Unhandled webhook event:", event.event)
    }

    return NextResponse.json({ status: true, message: "Webhook processed successfully" })
  } catch (error) {
    console.error("Webhook processing error:", error)
    return NextResponse.json({ status: false, message: "Webhook processing failed" }, { status: 500 })
  }
}

async function handleSuccessfulPayment(paymentData: any) {
  try {
    const reference = paymentData.reference
    const metadata = paymentData.metadata

    if (!metadata) {
      console.error("No metadata found in successful payment webhook")
      return
    }

    // Find booking by reference in notes or create if doesn't exist
    const bookings = await getBookings()
    const existingBooking = bookings.find((booking) => booking.notes?.includes(reference))

    if (existingBooking) {
      // Update existing booking status
      await updateBooking(existingBooking.id, {
        status: "confirmed",
        notes: `${existingBooking.notes} | Payment confirmed via webhook at ${new Date().toISOString()}`,
      })
      console.log("Booking updated via webhook:", existingBooking.id)
    } else {
      console.log("No existing booking found for reference:", reference)
    }
  } catch (error) {
    console.error("Error handling successful payment webhook:", error)
  }
}

async function handleFailedPayment(paymentData: any) {
  try {
    const reference = paymentData.reference
    console.log("Payment failed for reference:", reference)

    // Find booking and update status if needed
    const bookings = await getBookings()
    const existingBooking = bookings.find((booking) => booking.notes?.includes(reference))

    if (existingBooking && existingBooking.status === "pending") {
      await updateBooking(existingBooking.id, {
        status: "cancelled",
        notes: `${existingBooking.notes} | Payment failed via webhook at ${new Date().toISOString()}`,
      })
      console.log("Booking cancelled due to failed payment:", existingBooking.id)
    }
  } catch (error) {
    console.error("Error handling failed payment webhook:", error)
  }
}

async function handleDispute(disputeData: any) {
  try {
    const reference = disputeData.transaction?.reference
    console.log("Payment dispute created for reference:", reference)

    // Find booking and add dispute note
    const bookings = await getBookings()
    const existingBooking = bookings.find((booking) => booking.notes?.includes(reference))

    if (existingBooking) {
      await updateBooking(existingBooking.id, {
        notes: `${existingBooking.notes} | DISPUTE CREATED via webhook at ${new Date().toISOString()}`,
      })
      console.log("Dispute noted for booking:", existingBooking.id)
    }
  } catch (error) {
    console.error("Error handling dispute webhook:", error)
  }
}
