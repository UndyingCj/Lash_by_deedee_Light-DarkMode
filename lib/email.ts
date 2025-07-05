import { Resend } from "resend"
import { BookingConfirmationEmail } from "@/components/emails/booking-confirmation"

const resend = new Resend(process.env.RESEND_API_KEY)

export interface BookingEmailData {
  customerName: string
  customerEmail: string
  services: string[]
  bookingDate: string
  bookingTime: string
  totalAmount: number
  depositAmount: number
  paymentReference: string
}

export async function sendBookingConfirmation(bookingData: BookingEmailData) {
  try {
    console.log("Sending booking confirmation email to:", bookingData.customerEmail)

    const { data, error } = await resend.emails.send({
      from: "Lashed by Deedee <bookings@lashedbydeedee.com>",
      to: [bookingData.customerEmail],
      subject: "Booking Confirmation - Lashed by Deedee",
      react: BookingConfirmationEmail(bookingData),
    })

    if (error) {
      console.error("Failed to send booking confirmation:", error)
      return { success: false, error: error.message }
    }

    console.log("Booking confirmation sent successfully:", data?.id)
    return { success: true, data }
  } catch (error) {
    console.error("Email sending error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function sendBookingNotificationToAdmin(bookingData: BookingEmailData) {
  try {
    console.log("Sending booking notification to admin")

    const { data, error } = await resend.emails.send({
      from: "Lashed by Deedee <bookings@lashedbydeedee.com>",
      to: ["admin@lashedbydeedee.com"],
      subject: `New Booking: ${bookingData.customerName} - ${bookingData.bookingDate}`,
      html: `
        <h2>New Booking Received</h2>
        <p><strong>Customer:</strong> ${bookingData.customerName}</p>
        <p><strong>Email:</strong> ${bookingData.customerEmail}</p>
        <p><strong>Services:</strong> ${bookingData.services.join(", ")}</p>
        <p><strong>Date:</strong> ${bookingData.bookingDate}</p>
        <p><strong>Time:</strong> ${bookingData.bookingTime}</p>
        <p><strong>Total Amount:</strong> ₦${bookingData.totalAmount.toLocaleString()}</p>
        <p><strong>Deposit Paid:</strong> ₦${bookingData.depositAmount.toLocaleString()}</p>
        <p><strong>Payment Reference:</strong> ${bookingData.paymentReference}</p>
      `,
    })

    if (error) {
      console.error("Failed to send admin notification:", error)
      return { success: false, error: error.message }
    }

    console.log("Admin notification sent successfully:", data?.id)
    return { success: true, data }
  } catch (error) {
    console.error("Admin email sending error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
