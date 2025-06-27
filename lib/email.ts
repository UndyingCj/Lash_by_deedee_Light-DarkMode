import { Resend } from "resend"
import { TwoFactorEmail } from "@/components/emails/two-factor-email"
import { PasswordResetEmail } from "@/components/emails/password-reset-email"
import { BookingConfirmationEmail } from "@/components/emails/booking-confirmation"

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
      console.error("❌ Error sending 2FA email:", error)
      throw new Error("Failed to send verification code")
    }

    console.log("✅ 2FA email sent successfully:", data?.id)
    return data
  } catch (error) {
    console.error("❌ 2FA email error:", error)
    throw error
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  try {
    const resetUrl = `https://lashedbydeedee.com/egusi/reset-password?token=${token}`

    const { data, error } = await resend.emails.send({
      from: "Lashed by Deedee <noreply@lashedbydeedee.com>",
      to: [email],
      subject: "Reset your password",
      react: PasswordResetEmail({ resetUrl }),
    })

    if (error) {
      console.error("❌ Error sending password reset email:", error)
      throw new Error("Failed to send password reset email")
    }

    console.log("✅ Password reset email sent successfully:", data?.id)
    return data
  } catch (error) {
    console.error("❌ Password reset email error:", error)
    throw error
  }
}

export async function sendBookingConfirmation(email: string, bookingDetails: any) {
  try {
    const { data, error } = await resend.emails.send({
      from: "Lashed by Deedee <bookings@lashedbydeedee.com>",
      to: [email],
      subject: "Booking Confirmation - Lashed by Deedee",
      react: BookingConfirmationEmail(bookingDetails),
    })

    if (error) {
      console.error("❌ Error sending booking confirmation:", error)
      throw new Error("Failed to send booking confirmation")
    }

    console.log("✅ Booking confirmation sent successfully:", data?.id)
    return data
  } catch (error) {
    console.error("❌ Booking confirmation error:", error)
    throw error
  }
}
