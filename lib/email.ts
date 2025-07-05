import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export interface BookingConfirmationData {
  customerName: string
  customerEmail: string
  services: string[]
  bookingDate: string
  bookingTime: string
  totalAmount: number
  depositAmount: number
  paymentReference: string
}

export async function sendBookingConfirmationEmail(data: BookingConfirmationData) {
  try {
    console.log("📧 Sending booking confirmation email to:", data.customerEmail)

    const { data: emailResult, error } = await resend.emails.send({
      from: "Lashed by Deedee <bookings@lashedbydeedee.com>",
      to: [data.customerEmail],
      subject: "Booking Confirmation - Lashed by Deedee",
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <div style="background: linear-gradient(135deg, #ec4899 0%, #be185d 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Booking Confirmed!</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Thank you for choosing Lashed by Deedee</p>
          </div>
          
          <div style="padding: 30px; background-color: #ffffff;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Hello ${data.customerName},</h2>
            
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 25px;">
              Your booking has been confirmed! We're excited to see you and provide you with our premium beauty services.
            </p>
            
            <div style="background-color: #fdf2f8; padding: 25px; border-radius: 8px; margin: 25px 0;">
              <h3 style="color: #be185d; margin-top: 0; margin-bottom: 15px;">Booking Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Services:</td>
                  <td style="padding: 8px 0; color: #1f2937;">${data.services.join(", ")}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Date:</td>
                  <td style="padding: 8px 0; color: #1f2937;">${new Date(
                    data.bookingDate + "T12:00:00Z",
                  ).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Time:</td>
                  <td style="padding: 8px 0; color: #1f2937;">${data.bookingTime}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Total Amount:</td>
                  <td style="padding: 8px 0; color: #1f2937;">₦${data.totalAmount.toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Deposit Paid:</td>
                  <td style="padding: 8px 0; color: #059669; font-weight: 600;">₦${data.depositAmount.toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Balance Due:</td>
                  <td style="padding: 8px 0; color: #dc2626;">₦${(data.totalAmount - data.depositAmount).toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Reference:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-family: monospace; font-size: 14px;">${data.paymentReference}</td>
                </tr>
              </table>
            </div>
            
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 25px 0;">
              <h4 style="color: #92400e; margin: 0 0 10px 0;">Important Reminders:</h4>
              <ul style="color: #78350f; margin: 0; padding-left: 20px;">
                <li>Please arrive 10 minutes before your appointment</li>
                <li>The remaining balance of ₦${(data.totalAmount - data.depositAmount).toLocaleString()} is due at your appointment</li>
                <li>Cancellations must be made at least 24 hours in advance</li>
                <li>Late arrivals may result in shortened service time</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://lashedbydeedee.com/contact" 
                 style="background-color: #be185d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">
                Contact Us
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; line-height: 1.5;">
              If you have any questions or need to reschedule, please don't hesitate to contact us. 
              We look forward to providing you with an amazing beauty experience!
            </p>
          </div>
          
          <div style="background-color: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
            <p style="margin: 0;">© 2025 Lashed by Deedee. All rights reserved.</p>
            <p style="margin: 5px 0 0 0;">This is an automated message, please do not reply directly to this email.</p>
          </div>
        </div>
      `,
    })

    if (error) {
      console.error("❌ Email send error:", error)
      throw error
    }

    console.log("✅ Booking confirmation email sent successfully:", emailResult?.id)
    return emailResult
  } catch (error) {
    console.error("❌ Failed to send booking confirmation email:", error)
    throw error
  }
}
