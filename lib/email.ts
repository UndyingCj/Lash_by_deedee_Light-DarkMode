import { Resend } from "resend"
import { BookingConfirmationEmail } from "@/components/emails/booking-confirmation"

const resend = new Resend(process.env.RESEND_API_KEY)

interface BookingEmailData {
  customerName: string
  customerEmail: string
  customerPhone: string
  services: string[]
  bookingDate: string
  bookingTime: string
  totalAmount: number
  depositAmount: number
  reference: string
  notes?: string
}

export async function sendBookingConfirmationEmail(data: BookingEmailData) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error("❌ RESEND_API_KEY not configured")
      return { success: false, error: "Email service not configured" }
    }

    console.log("📧 Sending booking confirmation email to:", data.customerEmail)

    const { data: emailResult, error } = await resend.emails.send({
      from: "Lashed by Deedee <bookings@lashedbydeedee.com>",
      to: [data.customerEmail],
      subject: "Booking Confirmed - Lashed by Deedee ✨",
      react: BookingConfirmationEmail({
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        services: data.services,
        bookingDate: data.bookingDate,
        bookingTime: data.bookingTime,
        totalAmount: data.totalAmount,
        depositAmount: data.depositAmount,
        reference: data.reference,
        notes: data.notes,
      }),
    })

    if (error) {
      console.error("❌ Email sending failed:", error)
      return { success: false, error: error.message }
    }

    console.log("✅ Booking confirmation email sent successfully:", emailResult?.id)
    return { success: true, data: emailResult }
  } catch (error) {
    console.error("❌ Email service error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Email sending failed",
    }
  }
}

export async function sendAdminNotificationEmail(data: BookingEmailData) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error("❌ RESEND_API_KEY not configured")
      return { success: false, error: "Email service not configured" }
    }

    const formattedDate = new Date(data.bookingDate + "T12:00:00Z").toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    const emailContent = `
      🎉 NEW BOOKING CONFIRMED!
      
      Customer Details:
      • Name: ${data.customerName}
      • Email: ${data.customerEmail}
      • Phone: ${data.customerPhone}
      
      Booking Details:
      • Date: ${formattedDate}
      • Time: ${data.bookingTime}
      • Services: ${data.services.join(", ")}
      • Total Amount: ₦${data.totalAmount.toLocaleString()}
      • Deposit Paid: ₦${data.depositAmount.toLocaleString()}
      • Balance Due: ₦${(data.totalAmount - data.depositAmount).toLocaleString()}
      • Payment Reference: ${data.reference}
      ${data.notes ? `• Notes: ${data.notes}` : ""}
      
      Please prepare for this appointment and confirm the time slot is blocked in your calendar.
    `

    const { data: emailResult, error } = await resend.emails.send({
      from: "Lashed by Deedee <bookings@lashedbydeedee.com>",
      to: ["admin@lashedbydeedee.com"],
      subject: `New Booking: ${data.customerName} - ${formattedDate} at ${data.bookingTime}`,
      text: emailContent,
    })

    if (error) {
      console.error("❌ Admin notification email failed:", error)
      return { success: false, error: error.message }
    }

    console.log("✅ Admin notification email sent successfully:", emailResult?.id)
    return { success: true, data: emailResult }
  } catch (error) {
    console.error("❌ Admin email service error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Admin email sending failed",
    }
  }
}

// Legacy function names for backward compatibility
export const sendBookingConfirmation = sendBookingConfirmationEmail
export const sendBookingNotificationToAdmin = sendAdminNotificationEmail
