// Simple email logging system (no external dependencies)
// All emails are logged to console for development/testing

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

export async function sendCustomerBookingConfirmation(data: EmailData) {
  try {
    console.log("📧 CUSTOMER BOOKING CONFIRMATION EMAIL:")
    console.log("To:", data.customerEmail)
    console.log("Subject: Booking Confirmed - Lashed by Deedee")
    console.log(`
Dear ${data.customerName},

🎉 Your booking has been confirmed!

BOOKING DETAILS:
- Services: ${data.services.join(", ")}
- Date: ${new Date(data.bookingDate + "T12:00:00Z").toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })}
- Time: ${data.bookingTime}
- Total Amount: ₦${data.totalAmount.toLocaleString()}
- Deposit Paid: ₦${data.depositAmount.toLocaleString()}
- Balance Due: ₦${(data.totalAmount - data.depositAmount).toLocaleString()}

PAYMENT DETAILS:
- Reference: ${data.paymentReference}
- Booking ID: ${data.bookingId || "N/A"}

IMPORTANT REMINDERS:
- Please arrive on time for your appointment
- Avoid wearing makeup on the day of your appointment
- Bring a valid ID for verification
- The remaining balance is due on the day of service

If you need to reschedule or have any questions, please contact us via WhatsApp.

Thank you for choosing Lashed by Deedee! ✨

Best regards,
Deedee
Lashed by Deedee
WhatsApp: +234 816 543 5528
Email: hello@lashedbydeedee.com
    `)

    return { success: true, message: "Customer confirmation email logged" }
  } catch (error) {
    console.error("❌ Error logging customer confirmation email:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function sendAdminBookingNotification(data: EmailData) {
  try {
    console.log("📧 ADMIN BOOKING NOTIFICATION EMAIL:")
    console.log("To: admin@lashedbydeedee.com")
    console.log("Subject: New Booking Confirmed - Payment Received")
    console.log(`
🎉 NEW BOOKING CONFIRMED

CUSTOMER DETAILS:
- Name: ${data.customerName}
- Email: ${data.customerEmail}
- Phone: ${data.customerPhone}

BOOKING DETAILS:
- Services: ${data.services.join(", ")}
- Date: ${new Date(data.bookingDate + "T12:00:00Z").toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })}
- Time: ${data.bookingTime}
- Notes: ${data.notes || "None"}

PAYMENT DETAILS:
- Reference: ${data.paymentReference}
- Total Amount: ₦${data.totalAmount.toLocaleString()}
- Deposit Paid: ₦${data.depositAmount.toLocaleString()}
- Balance Due: ₦${(data.totalAmount - data.depositAmount).toLocaleString()}
- Booking ID: ${data.bookingId || "N/A"}

Please prepare for this appointment and contact the customer if needed.

Dashboard: ${process.env.NEXT_PUBLIC_SITE_URL}/egusi/bookings
    `)

    return { success: true, message: "Admin notification email logged" }
  } catch (error) {
    console.error("❌ Error logging admin notification email:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function sendBookingReminderEmail(data: EmailData) {
  try {
    console.log("📧 BOOKING REMINDER EMAIL:")
    console.log("To:", data.customerEmail)
    console.log("Subject: Appointment Reminder - Lashed by Deedee")
    console.log(`
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
    `)

    return { success: true, message: "Booking reminder email logged" }
  } catch (error) {
    console.error("❌ Error logging booking reminder email:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function sendBookingCancellationEmail(data: EmailData, reason?: string) {
  try {
    console.log("📧 BOOKING CANCELLATION EMAIL:")
    console.log("To:", data.customerEmail)
    console.log("Subject: Booking Cancelled - Lashed by Deedee")
    console.log(`
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
    `)

    return { success: true, message: "Booking cancellation email logged" }
  } catch (error) {
    console.error("❌ Error logging booking cancellation email:", error)
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
