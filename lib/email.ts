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
  paymentReference?: string
}

export async function sendBookingConfirmation(bookingDetails: BookingDetails) {
  try {
    console.log("📧 Sending booking confirmation email to:", bookingDetails.customerEmail)

    const { data, error } = await resend.emails.send({
      from: "Lashed by Deedee <bookings@lashedbydeedee.com>",
      to: [bookingDetails.customerEmail],
      subject: "Booking Confirmation - Lashed by Deedee ✨",
      react: BookingConfirmationEmail(bookingDetails),
    })

    if (error) {
      console.error("❌ Failed to send booking confirmation:", error)
      return { success: false, error }
    }

    console.log("✅ Booking confirmation sent successfully:", data?.id)
    return { success: true, data }
  } catch (error) {
    console.error("💥 Email sending error:", error)
    return { success: false, error }
  }
}

export async function sendBookingNotificationToAdmin(bookingDetails: BookingDetails) {
  try {
    console.log("📧 Sending admin notification for booking")

    const adminMessage = `
🌟 NEW BOOKING CONFIRMED 🌟

👤 CLIENT DETAILS:
Name: ${bookingDetails.customerName}
Email: ${bookingDetails.customerEmail}

💅 SERVICES:
${bookingDetails.services.join(", ")}

📅 APPOINTMENT:
Date: ${new Date(bookingDetails.date + "T12:00:00Z").toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })}
Time: ${bookingDetails.time}

💰 PAYMENT:
Total: ₦${bookingDetails.totalAmount.toLocaleString()}
Deposit Paid: ₦${bookingDetails.depositAmount.toLocaleString()}
${bookingDetails.paymentReference ? `Reference: ${bookingDetails.paymentReference}` : ""}

This booking has been automatically confirmed with payment.
    `

    const { data, error } = await resend.emails.send({
      from: "Lashed by Deedee <bookings@lashedbydeedee.com>",
      to: ["bookings@lashedbydeedee.com"],
      subject: `New Booking: ${bookingDetails.customerName} - ${bookingDetails.date}`,
      text: adminMessage,
    })

    if (error) {
      console.error("❌ Failed to send admin notification:", error)
      return { success: false, error }
    }

    console.log("✅ Admin notification sent successfully:", data?.id)
    return { success: true, data }
  } catch (error) {
    console.error("💥 Admin email error:", error)
    return { success: false, error }
  }
}
