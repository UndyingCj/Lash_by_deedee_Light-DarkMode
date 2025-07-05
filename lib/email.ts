import { Resend } from "resend"
import BookingConfirmationEmail from "@/components/emails/booking-confirmation"

const resend = new Resend(process.env.RESEND_API_KEY)

interface BookingConfirmationData {
  to: string
  clientName: string
  service: string
  date: string
  time: string
  amount: number
}

export async function sendBookingConfirmation(data: BookingConfirmationData) {
  try {
    console.log("📧 Sending booking confirmation email to:", data.to)

    const { data: emailData, error } = await resend.emails.send({
      from: "Lashed by Deedee <bookings@lashedbydeedee.com>",
      to: [data.to],
      subject: "Booking Confirmation - Lashed by Deedee",
      react: BookingConfirmationEmail({
        clientName: data.clientName,
        service: data.service,
        date: data.date,
        time: data.time,
        amount: data.amount,
      }),
    })

    if (error) {
      console.error("❌ Email sending failed:", error)
      throw error
    }

    console.log("✅ Email sent successfully:", emailData?.id)
    return emailData
  } catch (error) {
    console.error("❌ Email error:", error)
    throw error
  }
}

export async function sendBookingNotification(bookingData: any) {
  try {
    console.log("📧 Sending booking notification to admin")

    const { data: emailData, error } = await resend.emails.send({
      from: "Lashed by Deedee <notifications@lashedbydeedee.com>",
      to: ["admin@lashedbydeedee.com"],
      subject: "New Booking Received",
      html: `
        <h2>New Booking Received</h2>
        <p><strong>Client:</strong> ${bookingData.client_name}</p>
        <p><strong>Email:</strong> ${bookingData.email}</p>
        <p><strong>Phone:</strong> ${bookingData.phone}</p>
        <p><strong>Service:</strong> ${bookingData.service}</p>
        <p><strong>Date:</strong> ${bookingData.booking_date}</p>
        <p><strong>Time:</strong> ${bookingData.booking_time}</p>
        <p><strong>Amount:</strong> ₦${bookingData.amount.toLocaleString()}</p>
        ${bookingData.notes ? `<p><strong>Notes:</strong> ${bookingData.notes}</p>` : ""}
      `,
    })

    if (error) {
      console.error("❌ Admin notification failed:", error)
      throw error
    }

    console.log("✅ Admin notification sent:", emailData?.id)
    return emailData
  } catch (error) {
    console.error("❌ Admin notification error:", error)
    throw error
  }
}
