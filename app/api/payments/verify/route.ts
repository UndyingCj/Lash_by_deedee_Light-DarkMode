import { type NextRequest, NextResponse } from "next/server"
import { verifyPaystackPayment } from "@/lib/paystack"
import { sendBookingConfirmation, sendAdminNotification } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { reference } = await request.json()

    if (!reference) {
      return NextResponse.json({ error: "Payment reference is required" }, { status: 400 })
    }

    // Verify payment with Paystack
    const verification = await verifyPaystackPayment(reference)

    if (!verification.status || verification.data.status !== "success") {
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 })
    }

    const paymentData = verification.data

    // Extract booking data from metadata
    const metadata = paymentData.metadata
    const bookingData = {
      customerName: metadata.custom_fields.find((f: any) => f.variable_name === "customer_name")?.value || "",
      customerEmail: paymentData.customer.email,
      services: metadata.custom_fields.find((f: any) => f.variable_name === "services")?.value?.split(", ") || [],
      date: metadata.custom_fields.find((f: any) => f.variable_name === "appointment_date")?.value || "",
      time: metadata.custom_fields.find((f: any) => f.variable_name === "appointment_time")?.value || "",
      totalAmount: paymentData.amount / 100, // Convert from kobo
      depositAmount: paymentData.amount / 100,
      paymentReference: reference,
      paymentStatus: "paid",
    }

    // TODO: Save booking to database here
    console.log("Booking confirmed with payment:", bookingData)

    // Send confirmation emails
    try {
      await sendBookingConfirmation(bookingData)
      await sendAdminNotification(bookingData)
    } catch (emailError) {
      console.error("Email sending failed:", emailError)
      // Don't fail the payment verification if emails fail
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified and booking confirmed",
      booking: bookingData,
    })
  } catch (error) {
    console.error("Payment verification error:", error)
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 })
  }
}
