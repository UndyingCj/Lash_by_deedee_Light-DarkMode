import { Resend } from "resend"
import BookingConfirmationEmail from "@/components/emails/booking-confirmation"

const resend = new Resend(process.env.RESEND_API_KEY)

interface BookingConfirmationData {
  customerName: string
  customerEmail: string
  services: string[]
  date: string
  time: string
  totalAmount: number
  depositAmount: number
  paymentReference: string
}

export async function sendBookingConfirmationEmail(data: BookingConfirmationData) {
  try {
    const { data: emailData, error } = await resend.emails.send({
      from: "Lashed by Deedee <bookings@lashedbydeedee.com>",
      to: [data.customerEmail],
      subject: "Booking Confirmation - Lashed by Deedee",
      react: BookingConfirmationEmail(data),
    })

    if (error) {
      console.error("Error sending confirmation email:", error)
      throw new Error(`Failed to send confirmation email: ${error.message}`)
    }

    console.log("Confirmation email sent successfully:", emailData?.id)
    return emailData
  } catch (error) {
    console.error("Error in sendBookingConfirmationEmail:", error)
    throw error
  }
}
