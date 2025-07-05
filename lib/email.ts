import { Resend } from "resend"
import BookingConfirmationEmail from "@/components/emails/booking-confirmation"

const resend = new Resend(process.env.RESEND_API_KEY)

interface BookingDetails {
  customerName: string
  customerEmail: string
  services: string[]
  date: string
  time: string
  totalAmount: number
  depositAmount: number
  paymentReference: string
}

export async function sendBookingConfirmation(bookingDetails: BookingDetails) {
  try {
    const { data, error } = await resend.emails.send({
      from: "Lashed by Deedee <bookings@lashedbydeedee.com>",
      to: [bookingDetails.customerEmail],
      subject: "Booking Confirmation - Lashed by Deedee",
      react: BookingConfirmationEmail(bookingDetails),
    })

    if (error) {
      console.error("Email sending error:", error)
      return { success: false, error }
    }

    console.log("Email sent successfully:", data)
    return { success: true, data }
  } catch (error) {
    console.error("Email sending exception:", error)
    return { success: false, error }
  }
}

export async function sendBookingNotificationToAdmin(bookingDetails: BookingDetails) {
  try {
    const { data, error } = await resend.emails.send({
      from: "Lashed by Deedee <bookings@lashedbydeedee.com>",
      to: ["admin@lashedbydeedee.com"],
      subject: `New Booking: ${bookingDetails.customerName}`,
      html: `
        <h2>New Booking Received</h2>
        <p><strong>Customer:</strong> ${bookingDetails.customerName}</p>
        <p><strong>Email:</strong> ${bookingDetails.customerEmail}</p>
        <p><strong>Services:</strong> ${bookingDetails.services.join(", ")}</p>
        <p><strong>Date:</strong> ${bookingDetails.date}</p>
        <p><strong>Time:</strong> ${bookingDetails.time}</p>
        <p><strong>Total Amount:</strong> ₦${bookingDetails.totalAmount.toLocaleString()}</p>
        <p><strong>Deposit Paid:</strong> ₦${bookingDetails.depositAmount.toLocaleString()}</p>
        <p><strong>Payment Reference:</strong> ${bookingDetails.paymentReference}</p>
      `,
    })

    if (error) {
      console.error("Admin email sending error:", error)
      return { success: false, error }
    }

    console.log("Admin email sent successfully:", data)
    return { success: true, data }
  } catch (error) {
    console.error("Admin email sending exception:", error)
    return { success: false, error }
  }
}
