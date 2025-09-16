// Zoho Mail API email system for Lashed by Deedee
import nodemailer from 'nodemailer'

export interface EmailData {
  customerName: string
  customerEmail: string
  customerPhone: string
  services: string[]
  bookingDate: string
  bookingTime: string
  totalAmount: number
  depositAmount: number
  paymentReference: string
  notes?: string
  bookingId?: string
}

// Create Email transporter (works with Gmail or Zoho)
function createEmailTransporter() {
  const emailUser = process.env.ZOHO_EMAIL_USER
  const isGmail = emailUser?.includes('@gmail.com')

  return nodemailer.createTransport({
    host: isGmail ? 'smtp.gmail.com' : 'smtp.zoho.com',
    port: 587,
    secure: false, // TLS
    auth: {
      user: process.env.ZOHO_EMAIL_USER,
      pass: process.env.ZOHO_EMAIL_PASSWORD,
    },
  })
}

export async function sendCustomerBookingConfirmation(data: EmailData) {
  try {
    console.log("📧 Sending professional customer booking confirmation to:", data.customerEmail)

    const transporter = createEmailTransporter()

    const formattedDate = new Date(data.bookingDate + "T12:00:00Z").toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #e91e63, #f06292); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
            .tagline { font-size: 16px; opacity: 0.9; }
            .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
            .booking-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; margin: 8px 0; }
            .label { font-weight: bold; color: #555; }
            .value { color: #333; }
            .amount { font-size: 18px; font-weight: bold; color: #e91e63; }
            .reminders { background: #fff3e0; padding: 20px; border-radius: 8px; border-left: 4px solid #ff9800; margin: 20px 0; }
            .footer { background: #f5f5f5; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
            .contact-info { margin: 10px 0; }
            .whatsapp { color: #25d366; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">💅 Lashed by Deedee</div>
                <div class="tagline">Where Beauty Meets Precision</div>
            </div>

            <div class="content">
                <h2 style="color: #e91e63; margin-top: 0;">🎉 Booking Confirmed!</h2>

                <p>Dear <strong>${data.customerName}</strong>,</p>

                <p>We're thrilled to confirm your appointment! Your booking has been successfully processed and we can't wait to enhance your natural beauty.</p>

                <div class="booking-details">
                    <h3 style="margin-top: 0; color: #333;">📋 Appointment Details</h3>
                    <div class="detail-row">
                        <span class="label">Services:</span>
                        <span class="value">${data.services.join(", ")}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Date:</span>
                        <span class="value">${formattedDate}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Time:</span>
                        <span class="value">${data.bookingTime}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Booking ID:</span>
                        <span class="value">${data.bookingId || "N/A"}</span>
                    </div>
                </div>

                <div class="booking-details">
                    <h3 style="margin-top: 0; color: #333;">💳 Payment Summary</h3>
                    <div class="detail-row">
                        <span class="label">Total Amount:</span>
                        <span class="value">₦${data.totalAmount.toLocaleString()}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Deposit Paid:</span>
                        <span class="value amount">₦${data.depositAmount.toLocaleString()}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Balance Due:</span>
                        <span class="value">₦${(data.totalAmount - data.depositAmount).toLocaleString()}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Payment Reference:</span>
                        <span class="value">${data.paymentReference}</span>
                    </div>
                </div>

                <div class="reminders">
                    <h3 style="margin-top: 0; color: #ff9800;">⚠️ Important Reminders</h3>
                    <ul style="margin: 0; padding-left: 20px;">
                        <li>Please arrive 10 minutes early for your appointment</li>
                        <li>Avoid wearing eye makeup on the day of your lash appointment</li>
                        <li>Bring a valid ID for verification</li>
                        <li>The remaining balance is due on the day of service</li>
                        <li>24-hour cancellation policy applies</li>
                    </ul>
                </div>

                <p style="margin-top: 30px;">We're excited to see you and create the perfect look that enhances your natural beauty! ✨</p>
            </div>

            <div class="footer">
                <div class="contact-info">
                    <strong>Contact Us:</strong><br>
                    <span class="whatsapp">📱 WhatsApp: +234 816 543 5528</span><br>
                    📧 Email: bookings@lashedbydeedee.com<br>
                    📍 Port Harcourt, Nigeria
                </div>
                <p style="margin: 20px 0 0 0; font-size: 12px; color: #666;">
                    Thank you for choosing Lashed by Deedee - Where Beauty Meets Precision
                </p>
            </div>
        </div>
    </body>
    </html>
    `

    const textContent = `
Dear ${data.customerName},

🎉 Your booking has been confirmed!

APPOINTMENT DETAILS:
- Services: ${data.services.join(", ")}
- Date: ${formattedDate}
- Time: ${data.bookingTime}
- Booking ID: ${data.bookingId || "N/A"}

PAYMENT SUMMARY:
- Total Amount: ₦${data.totalAmount.toLocaleString()}
- Deposit Paid: ₦${data.depositAmount.toLocaleString()}
- Balance Due: ₦${(data.totalAmount - data.depositAmount).toLocaleString()}
- Payment Reference: ${data.paymentReference}

IMPORTANT REMINDERS:
- Arrive 10 minutes early
- Avoid eye makeup for lash appointments
- Bring valid ID
- Remaining balance due on service day
- 24-hour cancellation policy applies

Contact us: WhatsApp +234 816 543 5528 | bookings@lashedbydeedee.com

Thank you for choosing Lashed by Deedee! ✨
    `

    const mailOptions = {
      from: `"Lashed by Deedee" <${process.env.ZOHO_EMAIL_USER}>`,
      to: data.customerEmail,
      subject: '✨ Booking Confirmed - Lashed by Deedee',
      text: textContent,
      html: htmlContent
    }

    const result = await transporter.sendMail(mailOptions)
    console.log("✅ Professional customer confirmation sent:", result.messageId)

    return { success: true, message: "Customer confirmation email sent", messageId: result.messageId }
  } catch (error) {
    console.error("❌ Error sending customer confirmation:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function sendAdminBookingNotification(data: EmailData) {
  try {
    console.log("📧 Sending professional admin notifications to both emails")

    const transporter = createEmailTransporter()

    const formattedDate = new Date(data.bookingDate + "T12:00:00Z").toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2e7d32, #4caf50); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
            .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
            .booking-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .customer-details { background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196f3; }
            .detail-row { display: flex; justify-content: space-between; margin: 8px 0; }
            .label { font-weight: bold; color: #555; }
            .value { color: #333; }
            .amount { font-size: 18px; font-weight: bold; color: #2e7d32; }
            .footer { background: #f5f5f5; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
            .dashboard-link { background: #e91e63; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🎉 New Booking Alert</div>
                <div>Lashed by Deedee - Admin Notification</div>
            </div>

            <div class="content">
                <h2 style="color: #2e7d32; margin-top: 0;">💰 Payment Received - Booking Confirmed!</h2>

                <p>Great news! A new booking has been confirmed and payment has been successfully processed.</p>

                <div class="customer-details">
                    <h3 style="margin-top: 0; color: #1976d2;">👤 Customer Information</h3>
                    <div class="detail-row">
                        <span class="label">Name:</span>
                        <span class="value"><strong>${data.customerName}</strong></span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Email:</span>
                        <span class="value">${data.customerEmail}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Phone:</span>
                        <span class="value">${data.customerPhone}</span>
                    </div>
                </div>

                <div class="booking-details">
                    <h3 style="margin-top: 0; color: #333;">📅 Appointment Details</h3>
                    <div class="detail-row">
                        <span class="label">Services:</span>
                        <span class="value"><strong>${data.services.join(", ")}</strong></span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Date:</span>
                        <span class="value">${formattedDate}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Time:</span>
                        <span class="value">${data.bookingTime}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Booking ID:</span>
                        <span class="value">${data.bookingId || "N/A"}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Notes:</span>
                        <span class="value">${data.notes || "None"}</span>
                    </div>
                </div>

                <div class="booking-details">
                    <h3 style="margin-top: 0; color: #333;">💰 Payment Information</h3>
                    <div class="detail-row">
                        <span class="label">Total Amount:</span>
                        <span class="value">₦${data.totalAmount.toLocaleString()}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Deposit Received:</span>
                        <span class="value amount">₦${data.depositAmount.toLocaleString()}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Balance Due:</span>
                        <span class="value">₦${(data.totalAmount - data.depositAmount).toLocaleString()}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Payment Reference:</span>
                        <span class="value">${data.paymentReference}</span>
                    </div>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.NEXT_PUBLIC_SITE_URL}/egusi/bookings" class="dashboard-link">
                        📊 View in Dashboard
                    </a>
                </div>

                <p style="margin-top: 30px; padding: 15px; background: #fff3e0; border-radius: 5px; border-left: 4px solid #ff9800;">
                    <strong>Action Required:</strong> Please prepare for this appointment and contact the customer if needed.
                </p>
            </div>

            <div class="footer">
                <p style="margin: 0; font-size: 12px; color: #666;">
                    Lashed by Deedee Admin Notification System
                </p>
            </div>
        </div>
    </body>
    </html>
    `

    const textContent = `
🎉 NEW BOOKING CONFIRMED - PAYMENT RECEIVED

CUSTOMER DETAILS:
- Name: ${data.customerName}
- Email: ${data.customerEmail}
- Phone: ${data.customerPhone}

APPOINTMENT DETAILS:
- Services: ${data.services.join(", ")}
- Date: ${formattedDate}
- Time: ${data.bookingTime}
- Booking ID: ${data.bookingId || "N/A"}
- Notes: ${data.notes || "None"}

PAYMENT INFORMATION:
- Total Amount: ₦${data.totalAmount.toLocaleString()}
- Deposit Received: ₦${data.depositAmount.toLocaleString()}
- Balance Due: ₦${(data.totalAmount - data.depositAmount).toLocaleString()}
- Payment Reference: ${data.paymentReference}

Dashboard: ${process.env.NEXT_PUBLIC_SITE_URL}/egusi/bookings

Please prepare for this appointment and contact the customer if needed.
    `

    // Send to both admin email addresses
    const adminEmails = [
      'bookings@lashedbydeedee.com',
      'lashedbydeedeee@gmail.com'
    ]

    const results = []

    for (const adminEmail of adminEmails) {
      const mailOptions = {
        from: `"Lashed by Deedee" <${process.env.ZOHO_EMAIL_USER}>`,
        to: adminEmail,
        subject: '🎉 New Booking Confirmed - Payment Received',
        text: textContent,
        html: htmlContent
      }

      try {
        const result = await transporter.sendMail(mailOptions)
        console.log(`✅ Admin notification sent to ${adminEmail}:`, result.messageId)
        results.push({ email: adminEmail, success: true, messageId: result.messageId })
      } catch (error) {
        console.error(`❌ Failed to send to ${adminEmail}:`, error)
        results.push({ email: adminEmail, success: false, error: error instanceof Error ? error.message : 'Unknown error' })
      }
    }

    const successCount = results.filter(r => r.success).length
    console.log(`✅ Admin notifications sent to ${successCount}/${adminEmails.length} addresses`)

    return {
      success: successCount > 0,
      message: `Admin notifications sent to ${successCount}/${adminEmails.length} addresses`,
      results
    }
  } catch (error) {
    console.error("❌ Error sending admin notifications:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function sendBookingReminderEmail(data: EmailData) {
  try {
    console.log("📧 Sending booking reminder email to:", data.customerEmail)

    const transporter = createEmailTransporter()

    const emailContent = `
Dear ${data.customerName},

⏰ This is a friendly reminder about your upcoming appointment!

APPOINTMENT DETAILS:
- Services: ${data.services.join(", ")}
- Date: ${new Date(data.bookingDate + "T12:00:00Z").toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })}
- Time: ${data.bookingTime}
- Balance Due: ₦${(data.totalAmount - data.depositAmount).toLocaleString()}

REMINDERS:
- Please arrive 10 minutes early
- Avoid wearing makeup
- Bring a valid ID
- Payment of remaining balance is due on arrival

Looking forward to seeing you!

Best regards,
Deedee
Lashed by Deedee
WhatsApp: +234 816 543 5528
    `

    const mailOptions = {
      from: `"Lashed by Deedee" <${process.env.ZOHO_EMAIL_USER}>`,
      to: data.customerEmail,
      subject: 'Appointment Reminder - Lashed by Deedee',
      text: emailContent,
      html: emailContent.replace(/\n/g, '<br>')
    }

    const result = await transporter.sendMail(mailOptions)
    console.log("✅ Booking reminder email sent successfully:", result.messageId)

    return { success: true, message: "Booking reminder email sent", messageId: result.messageId }
  } catch (error) {
    console.error("❌ Error sending booking reminder email:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function sendBookingCancellationEmail(data: EmailData, reason?: string) {
  try {
    console.log("📧 Sending booking cancellation email to:", data.customerEmail)

    const transporter = createEmailTransporter()

    const emailContent = `
Dear ${data.customerName},

We're sorry to inform you that your booking has been cancelled.

CANCELLED BOOKING DETAILS:
- Services: ${data.services.join(", ")}
- Date: ${new Date(data.bookingDate + "T12:00:00Z").toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })}
- Time: ${data.bookingTime}
- Reference: ${data.paymentReference}

${reason ? `REASON: ${reason}` : ""}

REFUND INFORMATION:
Your deposit of ₦${data.depositAmount.toLocaleString()} will be processed within 5-7 business days.

If you have any questions or would like to reschedule, please contact us via WhatsApp.

We apologize for any inconvenience caused.

Best regards,
Deedee
Lashed by Deedee
WhatsApp: +234 816 543 5528
    `

    const mailOptions = {
      from: `"Lashed by Deedee" <${process.env.ZOHO_EMAIL_USER}>`,
      to: data.customerEmail,
      subject: 'Booking Cancelled - Lashed by Deedee',
      text: emailContent,
      html: emailContent.replace(/\n/g, '<br>')
    }

    const result = await transporter.sendMail(mailOptions)
    console.log("✅ Booking cancellation email sent successfully:", result.messageId)

    return { success: true, message: "Booking cancellation email sent", messageId: result.messageId }
  } catch (error) {
    console.error("❌ Error sending booking cancellation email:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

// Test function to verify email system is working
export async function testEmailSystem() {
  console.log("🧪 Testing email system...")
  
  const testData: EmailData = {
    customerName: "Test Customer",
    customerEmail: "test@example.com",
    customerPhone: "+234 800 000 0000",
    services: ["Classic Lashes", "Brow Shaping"],
    bookingDate: "2024-02-15",
    bookingTime: "10:00 AM",
    totalAmount: 50000,
    depositAmount: 25000,
    paymentReference: "test_ref_123",
    notes: "Test booking",
    bookingId: "test_booking_123"
  }

  const results = await Promise.all([
    sendCustomerBookingConfirmation(testData),
    sendAdminBookingNotification(testData),
    sendBookingReminderEmail(testData),
    sendBookingCancellationEmail(testData, "Testing cancellation")
  ])

  console.log("✅ Email system test completed:", results)
  return results
}
