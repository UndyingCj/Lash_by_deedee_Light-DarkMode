import { Resend } from "resend"
import { render } from "@react-email/render"
import TwoFactorEmail from "@/components/emails/two-factor-email"
import PasswordResetEmail from "@/components/emails/password-reset-email"
import BookingConfirmationEmail from "@/components/emails/booking-confirmation"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendTwoFactorCode(email: string, code: string) {
  try {
    const emailHtml = await render(TwoFactorEmail({ code }))

    const { data, error } = await resend.emails.send({
      from: "Lashed by Deedee <admin@lashedbydeedee.com>",
      to: [email],
      subject: "Your verification code",
      html: emailHtml,
    })

    if (error) {
      console.error("Failed to send 2FA email:", error)
      throw new Error(`Email sending failed: ${error.message}`)
    }

    console.log("2FA email sent successfully:", data?.id)
    return data
  } catch (error) {
    console.error("Error sending 2FA email:", error)
    throw error
  }
}

export async function sendPasswordResetEmail(email: string, resetToken: string) {
  try {
    const resetUrl = `https://lashedbydeedee.com/egusi/reset-password?token=${resetToken}`
    const emailHtml = await render(PasswordResetEmail({ resetUrl }))

    const { data, error } = await resend.emails.send({
      from: "Lashed by Deedee <admin@lashedbydeedee.com>",
      to: [email],
      subject: "Reset your password",
      html: emailHtml,
    })

    if (error) {
      console.error("Failed to send password reset email:", error)
      throw new Error(`Email sending failed: ${error.message}`)
    }

    console.log("Password reset email sent successfully:", data?.id)
    return data
  } catch (error) {
    console.error("Error sending password reset email:", error)
    throw error
  }
}

export async function sendBookingConfirmationEmail({
  customerName,
  customerEmail,
  services,
  date,
  time,
  totalAmount,
  depositAmount,
  paymentReference,
}: {
  customerName: string
  customerEmail: string
  services: string[]
  date: string
  time: string
  totalAmount: number
  depositAmount: number
  paymentReference?: string
}) {
  try {
    const emailHtml = await render(
      BookingConfirmationEmail({
        customerName,
        services,
        date,
        time,
        totalAmount,
        depositAmount,
        paymentReference,
      }),
    )

    const { data, error } = await resend.emails.send({
      from: "Lashed by Deedee <bookings@lashedbydeedee.com>",
      to: [customerEmail],
      subject: `Booking Confirmed - ${new Date(date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
      })} at ${time}`,
      html: emailHtml,
    })

    if (error) {
      console.error("Failed to send confirmation email:", error)
      throw new Error(`Email sending failed: ${error.message}`)
    }

    console.log("Confirmation email sent successfully:", data?.id)
    return data
  } catch (error) {
    console.error("Error sending confirmation email:", error)
    throw error
  }
}
