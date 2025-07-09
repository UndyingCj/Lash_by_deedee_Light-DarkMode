// Test actual email sending with Resend API
import { Resend } from "resend"

console.log("📧 Real Email Sending Test")
console.log("=".repeat(50))

// Test data - UPDATE THE EMAIL ADDRESS
const testEmailData = {
  customerName: "Test Customer",
  customerEmail: "your-email@example.com", // ⚠️ CHANGE THIS TO YOUR EMAIL
  customerPhone: "+2348123456789",
  services: ["Classic Lashes"],
  bookingDate: "2025-01-20",
  bookingTime: "2:00 PM",
  totalAmount: 15000,
  depositAmount: 7500,
  reference: "TEST_" + Date.now(),
  notes: "This is a test booking to verify email functionality",
}

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY)

// Create customer email template
function createCustomerEmailTemplate(data) {
  const formattedDate = new Date(data.bookingDate + "T12:00:00Z").toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Booking Confirmation</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
        .highlight { color: #667eea; font-weight: bold; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>✨ Booking Confirmed!</h1>
        <p>Thank you for choosing Lashed by Deedee</p>
    </div>
    
    <div class="content">
        <h2>Hello ${data.customerName}! 👋</h2>
        <p>Your booking has been confirmed and your deposit has been received. We're excited to see you!</p>
        
        <div class="booking-details">
            <h3>📋 Booking Details</h3>
            <div class="detail-row">
                <span>📅 Date:</span>
                <span class="highlight">${formattedDate}</span>
            </div>
            <div class="detail-row">
                <span>⏰ Time:</span>
                <span class="highlight">${data.bookingTime}</span>
            </div>
            <div class="detail-row">
                <span>💅 Services:</span>
                <span class="highlight">${data.services.join(", ")}</span>
            </div>
            <div class="detail-row">
                <span>💰 Total Amount:</span>
                <span class="highlight">₦${data.totalAmount.toLocaleString()}</span>
            </div>
            <div class="detail-row">
                <span>💳 Deposit Paid:</span>
                <span class="highlight">₦${data.depositAmount.toLocaleString()}</span>
            </div>
            <div class="detail-row">
                <span>📝 Reference:</span>
                <span class="highlight">${data.reference}</span>
            </div>
        </div>

        <h3>📍 Location & Contact</h3>
        <p><strong>Phone:</strong> +234 XXX XXX XXXX</p>
        <p><strong>Email:</strong> bookings@lashedbydeedee.com</p>

        <h3>📝 Important Notes</h3>
        <ul>
            <li>Please arrive 5 minutes before your appointment</li>
            <li>Come with clean lashes (no makeup or mascara)</li>
            <li>Remaining balance: ₦${(data.totalAmount - data.depositAmount).toLocaleString()}</li>
            <li>Cancellation policy: 24 hours notice required</li>
        </ul>

        ${data.notes ? `<p><strong>Special Notes:</strong> ${data.notes}</p>` : ""}
    </div>

    <div class="footer">
        <p>Thank you for choosing Lashed by Deedee! ✨</p>
        <p>Follow us on social media for beauty tips and updates</p>
    </div>
</body>
</html>
  `
}

// Create admin email template
function createAdminEmailTemplate(data) {
  const formattedDate = new Date(data.bookingDate + "T12:00:00Z").toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>New Booking Alert</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
        .header { background: #dc3545; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; }
        .booking-info { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #dc3545; }
        .customer-info { background: #e9ecef; padding: 15px; border-radius: 6px; margin: 15px 0; }
        .highlight { color: #dc3545; font-weight: bold; }
        .status { background: #d4edda; color: #155724; padding: 10px; border-radius: 4px; text-align: center; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚨 New Booking Alert!</h1>
        <p>A new appointment has been booked</p>
    </div>
    
    <div class="content">
        <div class="status">
            ✅ Payment Confirmed - Deposit Received
        </div>

        <div class="booking-info">
            <h3>📅 Appointment Details</h3>
            <p><strong>Date:</strong> <span class="highlight">${formattedDate}</span></p>
            <p><strong>Time:</strong> <span class="highlight">${data.bookingTime}</span></p>
            <p><strong>Services:</strong> <span class="highlight">${data.services.join(", ")}</span></p>
        </div>

        <div class="customer-info">
            <h3>👤 Customer Information</h3>
            <p><strong>Name:</strong> ${data.customerName}</p>
            <p><strong>Email:</strong> <a href="mailto:${data.customerEmail}">${data.customerEmail}</a></p>
            <p><strong>Phone:</strong> <a href="tel:${data.customerPhone}">${data.customerPhone}</a></p>
        </div>

        <div class="booking-info">
            <h3>💰 Payment Details</h3>
            <p><strong>Total Amount:</strong> ₦${data.totalAmount.toLocaleString()}</p>
            <p><strong>Deposit Paid:</strong> ₦${data.depositAmount.toLocaleString()}</p>
            <p><strong>Balance Due:</strong> ₦${(data.totalAmount - data.depositAmount).toLocaleString()}</p>
            <p><strong>Payment Reference:</strong> ${data.reference}</p>
        </div>

        ${
          data.notes
            ? `
        <div class="booking-info">
            <h3>📝 Customer Notes</h3>
            <p>${data.notes}</p>
        </div>
        `
            : ""
        }
    </div>
</body>
</html>
  `
}

async function sendRealEmails() {
  try {
    console.log("🔍 Environment Check:")
    console.log("=".repeat(30))

    if (!process.env.RESEND_API_KEY) {
      console.log("❌ RESEND_API_KEY not found")
      console.log("Please set your Resend API key in environment variables")
      return
    }

    console.log("✅ RESEND_API_KEY found:", process.env.RESEND_API_KEY.substring(0, 10) + "...")

    console.log("\n📧 Sending Customer Confirmation Email...")
    console.log("=".repeat(45))

    // Send customer confirmation email
    const customerEmailHtml = createCustomerEmailTemplate(testEmailData)

    const customerEmailResult = await resend.emails.send({
      from: "Lashed by Deedee <bookings@lashedbydeedee.com>",
      to: [testEmailData.customerEmail],
      subject: "Booking Confirmed - Lashed by Deedee ✨",
      html: customerEmailHtml,
    })

    if (customerEmailResult.data) {
      console.log("✅ Customer email sent successfully!")
      console.log(`📧 Email ID: ${customerEmailResult.data.id}`)
      console.log(`📧 Sent to: ${testEmailData.customerEmail}`)
    } else {
      console.log("❌ Customer email failed:", customerEmailResult.error)
    }

    console.log("\n📧 Sending Admin Notification Email...")
    console.log("=".repeat(45))

    // Send admin notification email
    const formattedDate = new Date(testEmailData.bookingDate + "T12:00:00Z").toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    const adminEmailHtml = createAdminEmailTemplate(testEmailData)

    const adminEmailResult = await resend.emails.send({
      from: "Lashed by Deedee <bookings@lashedbydeedee.com>",
      to: ["lashedbydeedee@gmail.com", "bookings@lashedbydeedee.com"],
      subject: `New Booking: ${testEmailData.customerName} - ${formattedDate} at ${testEmailData.bookingTime}`,
      html: adminEmailHtml,
    })

    if (adminEmailResult.data) {
      console.log("✅ Admin email sent successfully!")
      console.log(`📧 Email ID: ${adminEmailResult.data.id}`)
      console.log(`📧 Sent to: lashedbydeedee@gmail.com, bookings@lashedbydeedee.com`)
    } else {
      console.log("❌ Admin email failed:", adminEmailResult.error)
    }

    // Final summary
    console.log("\n📊 Email Test Results:")
    console.log("=".repeat(35))

    const customerSuccess = !!customerEmailResult.data
    const adminSuccess = !!adminEmailResult.data

    console.log(`Customer Email: ${customerSuccess ? "✅ Sent" : "❌ Failed"}`)
    console.log(`Admin Email: ${adminSuccess ? "✅ Sent" : "❌ Failed"}`)

    if (customerSuccess && adminSuccess) {
      console.log("\n🎉 SUCCESS: Both emails sent successfully!")
      console.log("\n📬 Check these inboxes:")
      console.log(`   📧 Customer: ${testEmailData.customerEmail}`)
      console.log(`   📧 Admin: lashedbydeedee@gmail.com`)
      console.log(`   📧 Admin: bookings@lashedbydeedee.com`)
      console.log("\n✅ Your email system is working correctly!")
    } else {
      console.log("\n⚠️  Some emails failed to send")
      console.log("Check the error messages above for details")
    }
  } catch (error) {
    console.error("\n❌ Email test failed:", error.message)
    console.error("Stack trace:", error.stack)
  }
}

// Run the real email test
sendRealEmails()
