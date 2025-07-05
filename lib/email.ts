import { Resend } from "resend"
import BookingConfirmationEmail from "@/components/emails/booking-confirmation"

const resend = new Resend(process.env.RESEND_API_KEY)

export interface BookingEmailData {
  customerName: string
  customerEmail: string
  services: string[]
  date: string
  time: string
  totalAmount: number
  depositAmount: number
  paymentReference: string
}

export async function sendBookingConfirmation(data: BookingEmailData) {
  try {
    const { data: emailData, error } = await resend.emails.send({
      from: "Lashed by Deedee <bookings@lashedbydeedee.com>",
      to: [data.customerEmail],
      subject: "Booking Confirmation - Lashed by Deedee",
      react: BookingConfirmationEmail(data),
    })

    if (error) {
      console.error("Email sending error:", error)
      return { success: false, error }
    }

    console.log("Email sent successfully:", emailData)
    return { success: true, data: emailData }
  } catch (error) {
    console.error("Email sending failed:", error)
    return { success: false, error }
  }
}

export async function sendBookingNotificationToAdmin(data: BookingEmailData) {
  try {
    const { data: emailData, error } = await resend.emails.send({
      from: "Lashed by Deedee <bookings@lashedbydeedee.com>",
      to: ["admin@lashedbydeedee.com"],
      subject: `New Booking: ${data.customerName} - ${data.date}`,
      html: `
        <h2>New Booking Received</h2>
        <p><strong>Customer:</strong> ${data.customerName}</p>
        <p><strong>Email:</strong> ${data.customerEmail}</p>
        <p><strong>Services:</strong> ${data.services.join(", ")}</p>
        <p><strong>Date:</strong> ${data.date}</p>
        <p><strong>Time:</strong> ${data.time}</p>
        <p><strong>Total Amount:</strong> ₦${data.totalAmount.toLocaleString()}</p>
        <p><strong>Deposit Paid:</strong> ₦${data.depositAmount.toLocaleString()}</p>
        <p><strong>Payment Reference:</strong> ${data.paymentReference}</p>
      `,
    })

    if (error) {
      console.error("Admin email sending error:", error)
      return { success: false, error }
    }

    console.log("Admin email sent successfully:", emailData)
    return { success: true, data: emailData }
  } catch (error) {
    console.error("Admin email sending failed:", error)
    return { success: false, error }
  }
}
