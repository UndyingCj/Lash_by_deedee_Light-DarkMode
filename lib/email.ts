import { Resend } from "resend"
import { BookingConfirmationEmail } from "@/components/emails/booking-confirmation"
import { render } from "@react-email/render"

const resend = new Resend(process.env.RESEND_API_KEY)

interface BookingDetails {
  customerName: string
  customerEmail: string
  services: string[]
  date: string
  time: string
  totalAmount: number
  depositAmount: number
}

export async function sendBookingConfirmation(booking: BookingDetails) {
  try {
    console.log("Sending booking confirmation to:", booking.customerEmail)

    const emailHtml = render(BookingConfirmationEmail(booking))

    const result = await resend.emails.send({
      from: "Lashed by Deedee <noreply@lashedbydeedee.com>", // Your professional no-reply email
      to: booking.customerEmail,
      reply_to: "bookings@lashedbydeedee.com", // Users can reply to your professional booking email
      subject: `Booking Confirmed - ${new Date(booking.date).toLocaleDateString()}`,
      html: emailHtml,
    })

    console.log("✅ Customer confirmation email sent:", result.data?.id)
    return { success: true, data: result.data }
  } catch (error) {
    console.error("❌ Failed to send customer email:", error)
    return { success: false, error: error.message }
  }
}

export async function sendBookingNotificationToAdmin(booking: BookingDetails) {
  try {
    console.log("Sending admin notification for booking:", booking.customerName)

    const result = await resend.emails.send({
      from: "Lashed by Deedee <noreply@lashedbydeedee.com>",
      to: "bookings@lashedbydeedee.com", // Only your professional Zoho email (forwards to Gmail automatically)
      subject: `🔔 New Booking: ${booking.customerName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; border-bottom: 2px solid #e91e63; padding-bottom: 10px;">
            New Booking Received! 🎉
          </h2>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Customer Details</h3>
            <p><strong>Name:</strong> ${booking.customerName}</p>
            <p><strong>Email:</strong> ${booking.customerEmail}</p>
          </div>
          
          <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Booking Details</h3>
            <p><strong>Services:</strong> ${booking.services.join(", ")}</p>
            <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}</p>
            <p><strong>Time:</strong> ${booking.time}</p>
            <p><strong>Total Amount:</strong> ₦${booking.totalAmount.toLocaleString()}</p>
            <p><strong>Deposit Required:</strong> ₦${booking.depositAmount.toLocaleString()}</p>
          </div>
          
          <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #ffeaa7;">
            <p style="margin: 0; color: #856404;">
              <strong>Action Required:</strong> Please confirm this booking and follow up with the customer for deposit payment.
            </p>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            This notification was sent automatically from your Lashed by Deedee booking system.
          </p>
        </div>
      `,
    })

    console.log("✅ Admin notification sent:", result.data?.id)
    return { success: true, data: result.data }
  } catch (error) {
    console.error("❌ Failed to send admin notification:", error)
    return { success: false, error: error.message }
  }
}
