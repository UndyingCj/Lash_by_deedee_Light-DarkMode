// Simple email logging system - no external dependencies required
// This system logs emails to console for development and testing

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

// Email logging function for development
async function logEmail(type: string, to: string, subject: string, content: string): Promise<boolean> {
  try {
    const timestamp = new Date().toISOString()
    const logEntry = {
      type: type.toUpperCase(),
      to,
      subject,
      timestamp,
      contentLength: content.length,
      preview: content.substring(0, 200) + "..."
    }
    
    console.log("📧 EMAIL LOG START")
    console.log(JSON.stringify(logEntry, null, 2))
    console.log("📧 EMAIL LOG END")
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 100))
    
    return true // Always return success for logging
  } catch (error) {
    console.error(`❌ Email logging error [${type}]:`, error)
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

    const success = await logEmail("customer_confirmation", data.customerEmail, subject, emailContent)
    
    return {
      success,
      message: success ? "Customer email logged successfully" : "Failed to log customer email",
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

    const success = await logEmail("admin_notification", "admin@lashedbydeedee.com", subject, emailContent)
    
    return {
      success,
      message: success ? "Admin email logged successfully" : "Failed to log admin email",
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

    const success = await logEmail("booking_reminder", data.customerEmail, subject, emailContent)
    
    return {
      success,
      message: success ? "Reminder email logged successfully" : "Failed to log reminder email",
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
