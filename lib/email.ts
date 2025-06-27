import { Resend } from "resend"
import BookingConfirmationEmail from "@/components/emails/booking-confirmation"
import TwoFactorEmail from "@/components/emails/two-factor-email"
import PasswordResetEmail from "@/components/emails/password-reset-email"

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

export async function sendBookingConfirmationEmail(data: BookingEmailData) {
  try {
    console.log("📧 Sending booking confirmation email to:", data.customerEmail)

    const { data: emailData, error } = await resend.emails.send({
      from: "Lashed by Deedee <bookings@lashedbydeedee.com>",
      to: [data.customerEmail],
      subject: "Booking Confirmation - Lashed by Deedee",
      react: BookingConfirmationEmail(data),
    })

    if (error) {
      console.error("❌ Failed to send booking confirmation email:", error)
      throw new Error(`Failed to send booking confirmation: ${error.message}`)
    }

    console.log("✅ Booking confirmation email sent successfully:", emailData?.id)
    return emailData
  } catch (error) {
    console.error("❌ Booking email error:", error)
    throw error
  }
}

export async function sendTwoFactorCode(email: string, code: string) {
  try {
    console.log("📧 Sending 2FA code to:", email)

    const { data, error } = await resend.emails.send({
      from: "Lashed by Deedee <noreply@lashedbydeedee.com>",
      to: [email],
      subject: "Your Admin Login Verification Code",
      react: TwoFactorEmail({ code }),
    })

    if (error) {
      console.error("❌ Failed to send 2FA email:", error)
      throw new Error(`Failed to send 2FA code: ${error.message}`)
    }

    console.log("✅ 2FA email sent successfully:", data?.id)
    return data
  } catch (error) {
    console.error("❌ 2FA email error:", error)
    throw error
  }
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  try {
    console.log("📧 Sending password reset email to:", email)

    const { data, error } = await resend.emails.send({
      from: "Lashed by Deedee <noreply@lashedbydeedee.com>",
      to: [email],
      subject: "Reset Your Admin Password",
      react: PasswordResetEmail({ resetUrl, email }),
    })

    if (error) {
      console.error("❌ Failed to send reset email:", error)
      throw new Error(`Failed to send reset email: ${error.message}`)
    }

    console.log("✅ Reset email sent successfully:", data?.id)
    return data
  } catch (error) {
    console.error("❌ Reset email error:", error)
    throw error
  }
}
