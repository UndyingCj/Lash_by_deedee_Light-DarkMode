import { Resend } from "resend"
import { BookingConfirmationEmail } from "@/components/emails/booking-confirmation"

const resend = new Resend(process.env.RESEND_API_KEY)

export interface BookingDetails {
  customerName: string
  customerEmail: string
  services: string[]
  bookingDate: string
  bookingTime: string
  totalAmount: number
  depositAmount: number
  paymentReference: string
}

export async function sendBookingConfirmation(bookingDetails: BookingDetails) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured")
      return { success: false, error: "Email service not configured" }
    }

    const { data, error } = await resend.emails.send({
      from: "Lashed by Deedee <bookings@lashedbydeedee.com>",
      to: [bookingDetails.customerEmail],
      subject: "Booking Confirmation - Lashed by Deedee",
      react: BookingConfirmationEmail(bookingDetails),
    })

    if (error) {
      console.error("Failed to send booking confirmation:", error)
      return { success: false, error: error.message }
    }

    console.log("Booking confirmation sent successfully:", data)
    return { success: true, data }
  } catch (error) {
    console.error("Email sending error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown email error",
    }
  }
}

export async function sendBookingNotificationToAdmin(bookingDetails: BookingDetails) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured")
      return { success: false, error: "Email service not configured" }
    }

    const { data, error } = await resend.emails.send({
      from: "Lashed by Deedee <bookings@lashedbydeedee.com>",
      to: ["admin@lashedbydeedee.com"],
      subject: `New Booking: ${bookingDetails.customerName}`,
      html: `
        <h2>New Booking Received</h2>
        <p><strong>Customer:</strong> ${bookingDetails.customerName}</p>
        <p><strong>Email:</strong> ${bookingDetails.customerEmail}</p>
        <p><strong>Services:</strong> ${bookingDetails.services.join(", ")}</p>
        <p><strong>Date:</strong> ${bookingDetails.bookingDate}</p>
        <p><strong>Time:</strong> ${bookingDetails.bookingTime}</p>
        <p><strong>Total Amount:</strong> ₦${bookingDetails.totalAmount.toLocaleString()}</p>
        <p><strong>Deposit Paid:</strong> ₦${bookingDetails.depositAmount.toLocaleString()}</p>
        <p><strong>Payment Reference:</strong> ${bookingDetails.paymentReference}</p>
      `,
    })

    if (error) {
      console.error("Failed to send admin notification:", error)
      return { success: false, error: error.message }
    }

    console.log("Admin notification sent successfully:", data)
    return { success: true, data }
  } catch (error) {
    console.error("Admin email sending error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown email error",
    }
  }
}
