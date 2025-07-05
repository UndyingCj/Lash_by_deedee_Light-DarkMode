import { Resend } from "resend"
import BookingConfirmationEmail from "@/components/emails/booking-confirmation"

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

export async function sendBookingConfirmation(data: BookingEmailData) {
  try {
    console.log("Sending booking confirmation email to:", data.customerEmail)

    const { data: emailResult, error } = await resend.emails.send({
      from: "Lashed by Deedee <bookings@lashedbydeedee.com>",
      to: [data.customerEmail],
      subject: "Booking Confirmation - Lashed by Deedee",
      react: BookingConfirmationEmail(data),
    })

    if (error) {
      console.error("Failed to send booking confirmation email:", error)
      throw new Error(`Failed to send email: ${error.message}`)
    }

    console.log("Booking confirmation email sent successfully:", emailResult?.id)
    return emailResult
  } catch (error) {
    console.error("Error sending booking confirmation email:", error)
    throw error
  }
}

export async function sendBookingReminder(data: BookingEmailData) {
  try {
    console.log("Sending booking reminder email to:", data.customerEmail)

    const { data: emailResult, error } = await resend.emails.send({
      from: "Lashed by Deedee <bookings@lashedbydeedee.com>",
      to: [data.customerEmail],
      subject: "Booking Reminder - Lashed by Deedee",
      react: BookingConfirmationEmail({
        ...data,
        isReminder: true,
      }),
    })

    if (error) {
      console.error("Failed to send booking reminder email:", error)
      throw new Error(`Failed to send reminder email: ${error.message}`)
    }

    console.log("Booking reminder email sent successfully:", emailResult?.id)
    return emailResult
  } catch (error) {
    console.error("Error sending booking reminder email:", error)
    throw error
  }
}
