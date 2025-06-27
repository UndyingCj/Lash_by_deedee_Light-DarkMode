import { Resend } from "resend"
import TwoFactorEmail from "@/components/emails/two-factor-email"
import PasswordResetEmail from "@/components/emails/password-reset-email"
import BookingConfirmationEmail from "@/components/emails/booking-confirmation"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendTwoFactorCode(email: string, code: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: "Lashed by Deedee <noreply@lashedbydeedee.com>",
      to: [email],
      subject: "Your verification code",
      react: TwoFactorEmail({ code }),
    })

    if (error) {
      console.error("Resend error:", error)
      throw new Error(`Failed to send email: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error("Email sending error:", error)
    throw error
  }
}

export async function sendPasswordResetEmail(email: string, resetUrl: string, name: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: "Lashed by Deedee <noreply@lashedbydeedee.com>",
      to: [email],
      subject: "Reset your password",
      react: PasswordResetEmail({ resetUrl, name }),
    })

    if (error) {
      console.error("Resend error:", error)
      throw new Error(`Failed to send email: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error("Email sending error:", error)
    throw error
  }
}

export async function sendBookingConfirmation(
  email: string,
  bookingDetails: {
    customerName: string
    services: string[]
    date: string
    time: string
    totalAmount: number
    depositAmount: number
    paymentReference: string
  },
) {
  try {
    const { data, error } = await resend.emails.send({
      from: "Lashed by Deedee <bookings@lashedbydeedee.com>",
      to: [email],
      subject: "Booking Confirmation - Lashed by Deedee",
      react: BookingConfirmationEmail(bookingDetails),
    })

    if (error) {
      console.error("Resend error:", error)
      throw new Error(`Failed to send email: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error("Email sending error:", error)
    throw error
  }
}
