import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendTwoFactorCode(email: string, code: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: "Lashed by Deedee <noreply@lashedbydeedee.com>",
      to: [email],
      subject: "Your Two-Factor Authentication Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #ec4899; margin: 0;">Lashed by Deedee</h1>
            <p style="color: #666; margin: 5px 0;">Admin Portal</p>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 8px; text-align: center;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Two-Factor Authentication</h2>
            <p style="color: #4b5563; margin-bottom: 30px;">
              Use this code to complete your login:
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #ec4899; font-family: monospace;">
                ${code}
              </span>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
              This code will expire in 10 minutes.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 12px;">
            <p>If you didn't request this code, please ignore this email.</p>
          </div>
        </div>
      `,
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

export async function sendPasswordResetEmail(email: string, resetUrl: string, name = "Admin") {
  try {
    const { data, error } = await resend.emails.send({
      from: "Lashed by Deedee <noreply@lashedbydeedee.com>",
      to: [email],
      subject: "Reset Your Password - Lashed by Deedee",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #ec4899; margin: 0;">Lashed by Deedee</h1>
            <p style="color: #666; margin: 5px 0;">Admin Portal</p>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 8px;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Reset Your Password</h2>
            <p style="color: #4b5563; margin-bottom: 30px;">
              Hi ${name}, you requested to reset your password. Click the button below to create a new password:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: #ec4899; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px;">
              This link will expire in 1 hour. If you didn't request this reset, please ignore this email.
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="color: #6b7280; font-size: 12px; word-break: break-all; margin: 5px 0;">
                ${resetUrl}
              </p>
            </div>
          </div>
        </div>
      `,
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
      subject: `Booking Confirmed - ${bookingDetails.services.join(", ")}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #ec4899; margin: 0;">Lashed by Deedee</h1>
            <p style="color: #666; margin: 5px 0;">Beauty & Lash Studio</p>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 8px;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Booking Confirmed! ✨</h2>
            <p style="color: #4b5563; margin-bottom: 30px;">
              Hi ${bookingDetails.customerName}, your booking has been confirmed. Here are the details:
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Service(s):</td>
                  <td style="padding: 8px 0; color: #1f2937;">${bookingDetails.services.join(", ")}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Date:</td>
                  <td style="padding: 8px 0; color: #1f2937;">${bookingDetails.date}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Time:</td>
                  <td style="padding: 8px 0; color: #1f2937;">${bookingDetails.time}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Amount Paid:</td>
                  <td style="padding: 8px 0; color: #1f2937;">₦${bookingDetails.depositAmount.toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Payment Reference:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-family: monospace;">${bookingDetails.paymentReference}</td>
                </tr>
              </table>
            </div>
            
            <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="color: #92400e; margin: 0; font-size: 14px;">
                <strong>Important:</strong> Please arrive 10 minutes before your appointment time. 
                If you need to reschedule, please contact us at least 24 hours in advance.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #4b5563; margin-bottom: 15px;">Questions? Contact us:</p>
              <p style="color: #ec4899; font-weight: bold; margin: 5px 0;">📧 lashedbydeedeee@gmail.com</p>
              <p style="color: #ec4899; font-weight: bold; margin: 5px 0;">📱 WhatsApp: +234 XXX XXX XXXX</p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 12px;">
            <p>Thank you for choosing Lashed by Deedee! ✨</p>
          </div>
        </div>
      `,
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

export async function sendBookingNotificationToAdmin(bookingDetails: {
  customerName: string
  customerEmail: string
  services: string[]
  date: string
  time: string
  totalAmount: number
  depositAmount: number
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: "Lashed by Deedee <bookings@lashedbydeedee.com>",
      to: ["lashedbydeedeee@gmail.com"],
      subject: `New Booking: ${bookingDetails.services.join(", ")} - ${bookingDetails.customerName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #ec4899; margin: 0;">Lashed by Deedee</h1>
            <p style="color: #666; margin: 5px 0;">New Booking Alert</p>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 8px;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">New Booking Received! 🎉</h2>
            <p style="color: #4b5563; margin-bottom: 30px;">
              You have a new booking from ${bookingDetails.customerName}:
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Customer:</td>
                  <td style="padding: 8px 0; color: #1f2937;">${bookingDetails.customerName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Email:</td>
                  <td style="padding: 8px 0; color: #1f2937;">${bookingDetails.customerEmail}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Service(s):</td>
                  <td style="padding: 8px 0; color: #1f2937;">${bookingDetails.services.join(", ")}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Date:</td>
                  <td style="padding: 8px 0; color: #1f2937;">${bookingDetails.date}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Time:</td>
                  <td style="padding: 8px 0; color: #1f2937;">${bookingDetails.time}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Deposit Paid:</td>
                  <td style="padding: 8px 0; color: #1f2937;">₦${bookingDetails.depositAmount.toLocaleString()}</td>
                </tr>
              </table>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://lashedbydeedee.com/egusi/bookings" 
                 style="background: #ec4899; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                View in Admin Panel
              </a>
            </div>
          </div>
        </div>
      `,
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
