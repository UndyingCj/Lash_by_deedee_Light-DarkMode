import { Resend } from "resend"
import { BookingConfirmationEmail } from "@/components/emails/booking-confirmation"

const resend = new Resend(process.env.RESEND_API_KEY)

export interface BookingEmailDetails {
  customerName: string
  customerEmail: string
  services: string[]
  date: string
  time: string
  totalAmount: number
  depositAmount: number
  paymentReference?: string
}

export async function sendBookingConfirmation(bookingDetails: BookingEmailDetails) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn("⚠️ RESEND_API_KEY not found, skipping email send")
      return { success: false, error: "Email service not configured" }
    }

    const { data, error } = await resend.emails.send({
      from: "Lashed by Deedee <bookings@lashedbydeedee.com>",
      to: [bookingDetails.customerEmail],
      subject: "Booking Confirmation - Lashed by Deedee",
      react: BookingConfirmationEmail({
        customerName: bookingDetails.customerName,
        services: bookingDetails.services,
        bookingDate: bookingDetails.date,
        bookingTime: bookingDetails.time,
        totalAmount: bookingDetails.totalAmount,
        depositAmount: bookingDetails.depositAmount,
        paymentReference: bookingDetails.paymentReference,
      }),
    })

    if (error) {
      console.error("❌ Error sending customer confirmation email:", error)
      return { success: false, error: error.message }
    }

    console.log("✅ Customer confirmation email sent:", data?.id)
    return { success: true, data }
  } catch (error) {
    console.error("❌ Failed to send customer confirmation email:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function sendBookingConfirmationEmail(bookingDetails: BookingEmailDetails) {
  // Alias for compatibility
  return sendBookingConfirmation(bookingDetails)
}

export async function sendBookingNotificationToAdmin(bookingDetails: BookingEmailDetails) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn("⚠️ RESEND_API_KEY not found, skipping admin notification")
      return { success: false, error: "Email service not configured" }
    }

    const { data, error } = await resend.emails.send({
      from: "Lashed by Deedee <bookings@lashedbydeedee.com>",
      to: ["admin@lashedbydeedee.com"], // Replace with actual admin email
      subject: `New Booking: ${bookingDetails.customerName}`,
      html: `
        <h2>New Booking Received</h2>
        <p><strong>Customer:</strong> ${bookingDetails.customerName}</p>
        <p><strong>Email:</strong> ${bookingDetails.customerEmail}</p>
        <p><strong>Services:</strong> ${bookingDetails.services.join(", ")}</p>
        <p><strong>Date:</strong> ${bookingDetails.date}</p>
        <p><strong>Time:</strong> ${bookingDetails.time}</p>
        <p><strong>Total Amount:</strong> ₦${bookingDetails.totalAmount.toLocaleString()}</p>
        <p><strong>Deposit Amount:</strong> ₦${bookingDetails.depositAmount.toLocaleString()}</p>
        ${bookingDetails.paymentReference ? `<p><strong>Payment Reference:</strong> ${bookingDetails.paymentReference}</p>` : ""}
      `,
    })

    if (error) {
      console.error("❌ Error sending admin notification email:", error)
      return { success: false, error: error.message }
    }

    console.log("✅ Admin notification email sent:", data?.id)
    return { success: true, data }
  } catch (error) {
    console.error("❌ Failed to send admin notification email:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function sendBookingReminder(bookingDetails: BookingEmailDetails) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn("⚠️ RESEND_API_KEY not found, skipping reminder email")
      return { success: false, error: "Email service not configured" }
    }

    const { data, error } = await resend.emails.send({
      from: "Lashed by Deedee <bookings@lashedbydeedee.com>",
      to: [bookingDetails.customerEmail],
      subject: "Appointment Reminder - Lashed by Deedee",
      html: `
        <h2>Appointment Reminder</h2>
        <p>Hi ${bookingDetails.customerName},</p>
        <p>This is a friendly reminder about your upcoming appointment:</p>
        <p><strong>Services:</strong> ${bookingDetails.services.join(", ")}</p>
        <p><strong>Date:</strong> ${bookingDetails.date}</p>
        <p><strong>Time:</strong> ${bookingDetails.time}</p>
        <p>We look forward to seeing you!</p>
        <p>Best regards,<br>Lashed by Deedee Team</p>
      `,
    })

    if (error) {
      console.error("❌ Error sending reminder email:", error)
      return { success: false, error: error.message }
    }

    console.log("✅ Reminder email sent:", data?.id)
    return { success: true, data }
  } catch (error) {
    console.error("❌ Failed to send reminder email:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}
