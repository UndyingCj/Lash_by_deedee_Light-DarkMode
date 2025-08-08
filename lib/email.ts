// Production email system using Zoho Mail SMTP
// Sends actual emails in production, logs in development

interface BookingEmailData {
  customerName: string
  customerEmail: string
  customerPhone?: string
  services: string[]
  bookingDate: string
  bookingTime: string
  totalAmount: number
  depositAmount: number
  paymentReference: string
  notes?: string
  bookingId?: string
}

import nodemailer from 'nodemailer'

// Create transporter for Zoho Mail
const createTransporter = () => {
  const zohoUser = process.env.ZOHO_EMAIL_USER
  const zohoPass = process.env.ZOHO_EMAIL_PASSWORD
  
  if (!zohoUser || !zohoPass) {
    throw new Error('Zoho email credentials not configured')
  }
  
  return nodemailer.createTransporter({
    host: 'smtp.zoho.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: zohoUser,
      pass: zohoPass,
    },
    tls: {
      rejectUnauthorized: false
    }
  })
}

// Send actual email or log based on environment
async function sendEmail(type: string, to: string, subject: string, content: string): Promise<boolean> {
  try {
    // In development, just log the email
    if (process.env.NODE_ENV === 'development') {
      console.log("📧 EMAIL LOG START")
      console.log(`Type: ${type.toUpperCase()}`)
      console.log(`To: ${to}`)
      console.log(`Subject: ${subject}`)
      console.log(`Content Preview: ${content.substring(0, 200)}...`)
      console.log("📧 EMAIL LOG END")
      return true
    }

    // In production, send actual email
    const transporter = createTransporter()
    
    const mailOptions = {
      from: {
        name: 'Lashed by Deedee',
        address: process.env.ZOHO_EMAIL_USER || 'noreply@example.com'
      },
      to: to,
      subject: subject,
      html: content.replace(/\n/g, '<br>'),
      text: content
    }

    await transporter.sendMail(mailOptions)
    console.log(`✅ Email sent successfully [${type}] to ${to}`)
    return true

  } catch (error) {
    console.error(`❌ Email sending error [${type}]:`, error)
    return false
  }
}

export async function sendCustomerBookingConfirmation(data: BookingEmailData) {
  try {
    console.log("📧 Preparing customer confirmation email for:", data.customerEmail)

    const servicesList = data.services.map(service => `• ${service}`).join('\n')
    const formattedDate = new Date(data.bookingDate + 'T12:00:00Z').toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    const subject = `✅ Booking Confirmed - ${formattedDate} at ${data.bookingTime}`
    
    const emailContent = `
Dear ${data.customerName},

🎉 Your booking has been confirmed! Thank you for choosing Lashed by Deedee.

📋 BOOKING DETAILS:
${servicesList}

📅 Date: ${formattedDate}
⏰ Time: ${data.bookingTime}

💰 PAYMENT SUMMARY:
Total Service Cost: ₦${data.totalAmount.toLocaleString()}
Deposit Paid: ₦${data.depositAmount.toLocaleString()}
Balance Due: ₦${(data.totalAmount - data.depositAmount).toLocaleString()}
Payment Reference: ${data.paymentReference}

📍 LOCATION:
Lashed by Deedee Studio
[Address will be provided via WhatsApp]

⚠️ IMPORTANT REMINDERS:
• Please arrive on time. Late arrivals may result in rescheduling
• Avoid wearing makeup to your appointment
• Bring a valid ID
• The remaining balance is due on the day of service

${data.notes ? `📝 Special Notes: ${data.notes}` : ''}

If you need to reschedule or have any questions, please contact us via WhatsApp.

Thank you for trusting us with your beauty needs! ✨

Best regards,
Deedee
Lashed by Deedee
WhatsApp: +234 816 543 5528
    `

    const success = await sendEmail("customer_confirmation", data.customerEmail, subject, emailContent)
    
    return {
      success,
      message: success ? "Customer email sent successfully" : "Failed to send customer email",
      id: `log_${Date.now()}_customer`
    }
  } catch (error) {
    console.error("❌ Error in sendCustomerBookingConfirmation:", error)
    return {
      success: false,
      message: "Error sending customer confirmation email",
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function sendAdminBookingNotification(data: BookingEmailData) {
  try {
    console.log("📧 Preparing admin notification email")

    const servicesList = data.services.map(service => `• ${service}`).join('\n')
    const formattedDate = new Date(data.bookingDate + 'T12:00:00Z').toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    const subject = `🚨 New Booking: ${data.customerName} - ${formattedDate}`
    
    const emailContent = `
🎉 NEW BOOKING CONFIRMED!

👤 CUSTOMER DETAILS:
Name: ${data.customerName}
Email: ${data.customerEmail}
Phone: ${data.customerPhone || 'Not provided'}

💅 SERVICES BOOKED:
${servicesList}

📅 APPOINTMENT:
Date: ${formattedDate}
Time: ${data.bookingTime}

💰 PAYMENT DETAILS:
Total Amount: ₦${data.totalAmount.toLocaleString()}
Deposit Paid: ₦${data.depositAmount.toLocaleString()}
Balance Due: ₦${(data.totalAmount - data.depositAmount).toLocaleString()}
Payment Reference: ${data.paymentReference}
Payment Status: COMPLETED ✅

${data.notes ? `📝 Special Notes: ${data.notes}` : ''}

${data.bookingId ? `🆔 Booking ID: ${data.bookingId}` : ''}

Please prepare for this appointment and contact the customer if needed.

📱 Next Steps:
1. Block ${data.bookingTime} on ${formattedDate} in your calendar
2. Prepare materials for: ${data.services.join(", ")}
3. Contact client if needed: ${data.customerPhone || data.customerEmail}
4. Set reminder for 24 hours before appointment

The time slot has been automatically blocked in the system.
    `

    const adminEmail = process.env.ZOHO_EMAIL_USER || 'admin@example.com'
    const success = await sendEmail("admin_notification", adminEmail, subject, emailContent)
    
    return {
      success,
      message: success ? "Admin email sent successfully" : "Failed to send admin email",
      id: `log_${Date.now()}_admin`
    }
  } catch (error) {
    console.error("❌ Error in sendAdminBookingNotification:", error)
    return {
      success: false,
      message: "Error sending admin notification email",
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function sendBookingReminder(data: BookingEmailData) {
  try {
    console.log("📧 Preparing booking reminder email for:", data.customerEmail)

    const servicesList = data.services.map(service => `• ${service}`).join('\n')
    const formattedDate = new Date(data.bookingDate + 'T12:00:00Z').toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    const subject = `⏰ Reminder: Your appointment tomorrow at ${data.bookingTime}`
    
    const emailContent = `
Dear ${data.customerName},

⏰ This is a friendly reminder about your upcoming appointment with Lashed by Deedee.

📋 APPOINTMENT DETAILS:
${servicesList}

📅 Date: ${formattedDate}
⏰ Time: ${data.bookingTime}

💰 BALANCE DUE: ₦${(data.totalAmount - data.depositAmount).toLocaleString()}

⚠️ REMINDERS:
• Please arrive 10 minutes early
• Avoid wearing makeup
• Bring a valid ID
• Payment of remaining balance is due on arrival

If you need to reschedule, please contact us at least 24 hours in advance.

Looking forward to seeing you! ✨

Best regards,
Deedee
Lashed by Deedee
WhatsApp: +234 816 543 5528
    `

    const success = await sendEmail("booking_reminder", data.customerEmail, subject, emailContent)
    
    return {
      success,
      message: success ? "Reminder email sent successfully" : "Failed to send reminder email",
      id: `log_${Date.now()}_reminder`
    }
  } catch (error) {
    console.error("❌ Error in sendBookingReminder:", error)
    return {
      success: false,
      message: "Error sending booking reminder email",
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Helper function to format booking data for emails
export function formatBookingData(booking: any) {
  return {
    customerName: booking.client_name || booking.customerName,
    customerEmail: booking.client_email || booking.customerEmail,
    customerPhone: booking.client_phone || booking.customerPhone || "",
    services: booking.service_name ? booking.service_name.split(", ") : [booking.service || "Service"],
    bookingDate: booking.booking_date || booking.bookingDate,
    bookingTime: booking.booking_time || booking.bookingTime,
    totalAmount: booking.total_amount || booking.totalAmount || 0,
    depositAmount: booking.deposit_amount || booking.depositAmount || 0,
    paymentReference: booking.payment_reference || booking.paymentReference || "",
    notes: booking.notes || "",
    bookingId: booking.id || booking.bookingId || "",
  }
}
