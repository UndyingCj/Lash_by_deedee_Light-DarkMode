import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

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

export async function sendCustomerBookingConfirmation(data: BookingEmailData) {
  try {
    console.log("📧 Sending customer confirmation email to:", data.customerEmail)

    const servicesList = data.services.map(service => `• ${service}`).join('\n')
    const formattedDate = new Date(data.bookingDate + 'T12:00:00Z').toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

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

    const result = await resend.emails.send({
      from: 'Lashed by Deedee <bookings@lashedbydeedee.com>',
      to: [data.customerEmail],
      subject: `Booking Confirmed - ${formattedDate} at ${data.bookingTime}`,
      text: emailContent,
    })

    console.log("✅ Customer email sent successfully:", result.data?.id)
    return { success: true, id: result.data?.id }
  } catch (error) {
    console.error("❌ Failed to send customer email:", error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function sendAdminBookingNotification(data: BookingEmailData) {
  try {
    console.log("📧 Sending admin notification email")

    const servicesList = data.services.map(service => `• ${service}`).join('\n')
    const formattedDate = new Date(data.bookingDate + 'T12:00:00Z').toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

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
`

    const result = await resend.emails.send({
      from: 'Lashed by Deedee <bookings@lashedbydeedee.com>',
      to: ['admin@lashedbydeedee.com'],
      subject: `New Booking: ${data.customerName} - ${formattedDate}`,
      text: emailContent,
    })

    console.log("✅ Admin email sent successfully:", result.data?.id)
    return { success: true, id: result.data?.id }
  } catch (error) {
    console.error("❌ Failed to send admin email:", error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function sendBookingReminder(data: BookingEmailData) {
  try {
    console.log("📧 Sending booking reminder email to:", data.customerEmail)

    const servicesList = data.services.map(service => `• ${service}`).join('\n')
    const formattedDate = new Date(data.bookingDate + 'T12:00:00Z').toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

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

    const result = await resend.emails.send({
      from: 'Lashed by Deedee <bookings@lashedbydeedee.com>',
      to: [data.customerEmail],
      subject: `Reminder: Your appointment tomorrow at ${data.bookingTime}`,
      text: emailContent,
    })

    console.log("✅ Reminder email sent successfully:", result.data?.id)
    return { success: true, id: result.data?.id }
  } catch (error) {
    console.error("❌ Failed to send reminder email:", error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
