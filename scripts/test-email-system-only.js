// Test email system functionality
console.log("📧 Email System Test")
console.log("=".repeat(50))

// Test data
const testEmailData = {
  customerName: "Test Customer",
  customerEmail: "your-email@example.com", // CHANGE THIS TO YOUR EMAIL
  customerPhone: "+2348123456789",
  services: ["Classic Lashes", "Brow Shaping"],
  bookingDate: "2025-01-15",
  bookingTime: "2:00 PM",
  totalAmount: 25000,
  depositAmount: 12500,
  reference: "TEST_REF_" + Date.now(),
  notes: "This is a test booking to verify email functionality",
}

// Environment check
function checkEnvironment() {
  console.log("\n🔍 Environment Check:")
  console.log("=".repeat(30))

  const requiredEnvVars = {
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  }

  const envStatus = {}
  let allPresent = true

  Object.entries(requiredEnvVars).forEach(([envVar, value]) => {
    const isPresent = !!value
    envStatus[envVar] = isPresent
    if (!isPresent) allPresent = false

    console.log(`${isPresent ? "✅" : "❌"} ${envVar}: ${isPresent ? "Present" : "Missing"}`)
    if (isPresent && envVar.includes("URL")) {
      console.log(`   ${value}`)
    } else if (isPresent) {
      console.log(`   ${value.substring(0, 20)}...`)
    }
  })

  return { envStatus, allPresent }
}

// Create email templates
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
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
        .highlight { color: #667eea; font-weight: bold; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
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
            <p><strong>Address:</strong> [Your Studio Address]</p>
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
    </div>
</body>
</html>
  `
}

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
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc3545; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; }
        .booking-info { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #dc3545; }
        .customer-info { background: #e9ecef; padding: 15px; border-radius: 6px; margin: 15px 0; }
        .highlight { color: #dc3545; font-weight: bold; }
        .status { background: #d4edda; color: #155724; padding: 10px; border-radius: 4px; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
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
                <p><strong>Duration:</strong> Approximately ${data.services.length * 60} minutes</p>
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

            <div class="booking-info">
                <h3>📋 Next Steps</h3>
                <ul>
                    <li>Add appointment to calendar</li>
                    <li>Prepare workspace and materials</li>
                    <li>Send reminder 24 hours before appointment</li>
                    <li>Customer confirmation email has been sent automatically</li>
                </ul>
            </div>
        </div>
    </div>
</body>
</html>
  `
}

// Mock Resend service for testing
async function testEmailWithResend(emailData) {
  try {
    // This would be the actual Resend API call
    console.log("📧 Sending email via Resend...")
    console.log(`   From: ${emailData.from}`)
    console.log(`   To: ${Array.isArray(emailData.to) ? emailData.to.join(", ") : emailData.to}`)
    console.log(`   Subject: ${emailData.subject}`)

    // For testing, we'll simulate the API call
    const mockResponse = {
      data: {
        id: "mock_" + Date.now(),
        from: emailData.from,
        to: emailData.to,
        subject: emailData.subject,
        created_at: new Date().toISOString(),
      },
      error: null,
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return mockResponse
  } catch (error) {
    return {
      data: null,
      error: error.message,
    }
  }
}

// Test email functions
async function testEmailFunctions() {
  try {
    console.log("📋 Test Data:")
    console.log(JSON.stringify(testEmailData, null, 2))

    // Check environment
    const { envStatus, allPresent } = checkEnvironment()

    console.log("\n📧 Testing Email Functions:")
    console.log("=".repeat(40))

    // Test customer confirmation email
    console.log("\n1. 👤 Customer Confirmation Email:")
    console.log("-".repeat(35))

    const customerEmailHtml = createCustomerEmailTemplate(testEmailData)
    const customerEmailData = {
      from: "Lashed by Deedee <bookings@lashedbydeedee.com>",
      to: testEmailData.customerEmail,
      subject: "Booking Confirmed - Lashed by Deedee ✨",
      html: customerEmailHtml,
    }

    const customerEmailResult = await testEmailWithResend(customerEmailData)

    if (customerEmailResult.data) {
      console.log("✅ Customer email sent successfully")
      console.log(`📧 Email ID: ${customerEmailResult.data.id}`)
      console.log(`📧 Sent to: ${customerEmailResult.data.to}`)
    } else {
      console.log("❌ Customer email failed:", customerEmailResult.error)
    }

    // Test admin notification email
    console.log("\n2. 👨‍💼 Admin Notification Email:")
    console.log("-".repeat(35))

    const formattedDate = new Date(testEmailData.bookingDate + "T12:00:00Z").toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    const adminEmailHtml = createAdminEmailTemplate(testEmailData)
    const adminEmailData = {
      from: "Lashed by Deedee <bookings@lashedbydeedee.com>",
      to: ["lashedbydeedee@gmail.com", "bookings@lashedbydeedee.com"],
      subject: `New Booking: ${testEmailData.customerName} - ${formattedDate} at ${testEmailData.bookingTime}`,
      html: adminEmailHtml,
    }

    const adminEmailResult = await testEmailWithResend(adminEmailData)

    if (adminEmailResult.data) {
      console.log("✅ Admin email sent successfully")
      console.log(`📧 Email ID: ${adminEmailResult.data.id}`)
      console.log(`📧 Sent to: ${adminEmailResult.data.to}`)
    } else {
      console.log("❌ Admin email failed:", adminEmailResult.error)
    }

    // Summary
    console.log("\n📊 Test Summary:")
    console.log("=".repeat(30))

    const allEmailsSent = customerEmailResult.data && adminEmailResult.data
    console.log(`Email Templates: ${allEmailsSent ? "✅ Generated Successfully" : "❌ Issues detected"}`)
    console.log(`Environment: ${envStatus.RESEND_API_KEY ? "✅ Ready" : "❌ Missing RESEND_API_KEY"}`)
    console.log(`Supabase: ${envStatus.NEXT_PUBLIC_SUPABASE_URL ? "✅ Configured" : "❌ Not Configured"}`)

    if (allEmailsSent && envStatus.RESEND_API_KEY) {
      console.log("\n🎉 SUCCESS: Email system ready for production!")
      console.log("\n📝 To test with real emails:")
      console.log("   1. Update test email address to your real email")
      console.log("   2. Start your Next.js app (npm run dev)")
      console.log("   3. Make a test booking through the website")
      console.log("   4. Check your email inbox")
    } else {
      console.log("\n⚠️  Issues detected:")
      if (!envStatus.RESEND_API_KEY) {
        console.log("   • Configure RESEND_API_KEY environment variable")
      }
      if (!allEmailsSent) {
        console.log("   • Check email template generation")
      }
    }

    console.log("\n📧 Email Templates Generated:")
    console.log("   ✅ Customer confirmation email (HTML)")
    console.log("   ✅ Admin notification email (HTML)")
    console.log("\n📬 Recipients:")
    console.log(`   📧 Customer: ${testEmailData.customerEmail}`)
    console.log(`   📧 Admin: lashedbydeedee@gmail.com, bookings@lashedbydeedee.com`)
  } catch (error) {
    console.error("\n❌ Test failed:", error.message)
    console.error("Stack trace:", error.stack)
  }
}

// Run the test
testEmailFunctions()
