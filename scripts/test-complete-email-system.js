const { Resend } = require("resend")
const { createClient } = require("@supabase/supabase-js")

// Configuration
const config = {
  resend: {
    apiKey: process.env.RESEND_API_KEY,
    fromEmail: "bookings@lashedbydeedee.com",
    adminEmail: "admin@lashedbydeedee.com",
  },
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  testData: {
    customerName: "Jane Smith",
    customerEmail: "jane.smith@example.com",
    customerPhone: "+234 801 234 5678",
    serviceName: "Mega Volume Lashes",
    bookingDate: "2025-02-15",
    bookingTime: "2:00 PM",
    totalAmount: 30000,
    depositAmount: 15000,
    paymentReference: `EMAIL_TEST_${Date.now()}`,
  },
}

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
}

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green)
}

function logError(message) {
  log(`❌ ${message}`, colors.red)
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue)
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow)
}

function logStep(step, message) {
  log(`${colors.bright}${step}${colors.reset} ${message}`, colors.cyan)
}

// Email templates
function createCustomerConfirmationEmail(bookingData) {
  return {
    subject: `Booking Confirmation - ${bookingData.serviceName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .detail-label { font-weight: bold; color: #555; }
          .detail-value { color: #333; }
          .amount { font-size: 1.2em; font-weight: bold; color: #667eea; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 0.9em; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Booking Confirmed!</h1>
            <p>Thank you for choosing Lashed by Deedee</p>
          </div>
          <div class="content">
            <p>Dear ${bookingData.customerName},</p>
            <p>Your booking has been confirmed! We're excited to see you soon.</p>
            
            <div class="booking-details">
              <h3>📋 Booking Details</h3>
              <div class="detail-row">
                <span class="detail-label">Service:</span>
                <span class="detail-value">${bookingData.serviceName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span class="detail-value">${bookingData.bookingDate}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Time:</span>
                <span class="detail-value">${bookingData.bookingTime}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Total Amount:</span>
                <span class="detail-value amount">₦${bookingData.totalAmount.toLocaleString()}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Deposit Paid:</span>
                <span class="detail-value amount">₦${bookingData.depositAmount.toLocaleString()}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Reference:</span>
                <span class="detail-value">${bookingData.paymentReference}</span>
              </div>
            </div>

            <h3>📍 Location & Contact</h3>
            <p><strong>Address:</strong> Lagos, Nigeria</p>
            <p><strong>Phone:</strong> +234 XXX XXX XXXX</p>
            <p><strong>Email:</strong> info@lashedbydeedee.com</p>

            <h3>⏰ Important Reminders</h3>
            <ul>
              <li>Please arrive 10 minutes early for your appointment</li>
              <li>Bring a valid ID for verification</li>
              <li>Contact us if you need to reschedule (24hrs notice required)</li>
              <li>The remaining balance of ₦${(bookingData.totalAmount - bookingData.depositAmount).toLocaleString()} is due at your appointment</li>
            </ul>

            <div class="footer">
              <p>Thank you for choosing Lashed by Deedee!</p>
              <p>Follow us on social media for beauty tips and updates</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  }
}

function createAdminNotificationEmail(bookingData) {
  return {
    subject: `New Booking Alert - ${bookingData.serviceName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Booking Alert</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ff6b6b; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
          .detail-label { font-weight: bold; color: #555; }
          .detail-value { color: #333; }
          .amount { font-size: 1.1em; font-weight: bold; color: #ff6b6b; }
          .actions { background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 New Booking Alert</h1>
            <p>A new booking has been confirmed</p>
          </div>
          <div class="content">
            <div class="booking-details">
              <h3>👤 Customer Information</h3>
              <div class="detail-row">
                <span class="detail-label">Name:</span>
                <span class="detail-value">${bookingData.customerName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Email:</span>
                <span class="detail-value">${bookingData.customerEmail}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Phone:</span>
                <span class="detail-value">${bookingData.customerPhone}</span>
              </div>
              
              <h3>📋 Booking Information</h3>
              <div class="detail-row">
                <span class="detail-label">Service:</span>
                <span class="detail-value">${bookingData.serviceName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span class="detail-value">${bookingData.bookingDate}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Time:</span>
                <span class="detail-value">${bookingData.bookingTime}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Total Amount:</span>
                <span class="detail-value amount">₦${bookingData.totalAmount.toLocaleString()}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Deposit Paid:</span>
                <span class="detail-value amount">₦${bookingData.depositAmount.toLocaleString()}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Balance Due:</span>
                <span class="detail-value amount">₦${(bookingData.totalAmount - bookingData.depositAmount).toLocaleString()}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Reference:</span>
                <span class="detail-value">${bookingData.paymentReference}</span>
              </div>
            </div>

            <div class="actions">
              <h3>📝 Next Steps</h3>
              <ul>
                <li>Add appointment to calendar</li>
                <li>Prepare materials for ${bookingData.serviceName}</li>
                <li>Send reminder 24 hours before appointment</li>
                <li>Collect remaining balance: ₦${(bookingData.totalAmount - bookingData.depositAmount).toLocaleString()}</li>
              </ul>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  }
}

// Test functions
async function testEnvironmentVariables() {
  logStep("1.", "Testing Environment Variables")

  const requiredVars = ["RESEND_API_KEY", "NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]

  let allPresent = true

  for (const varName of requiredVars) {
    if (process.env[varName]) {
      logSuccess(`${varName} is set`)
    } else {
      logError(`${varName} is missing`)
      allPresent = false
    }
  }

  return allPresent
}

async function testResendConnection() {
  logStep("2.", "Testing Resend API Connection")

  try {
    const resend = new Resend(config.resend.apiKey)

    // Test with a simple API call
    const domains = await resend.domains.list()
    logSuccess("Resend API connection successful")
    logInfo(`Found ${domains.data.length} domains`)
    return true
  } catch (error) {
    logError(`Resend API connection failed: ${error.message}`)
    return false
  }
}

async function testCustomerEmail() {
  logStep("3.", "Testing Customer Confirmation Email")

  try {
    const resend = new Resend(config.resend.apiKey)
    const emailContent = createCustomerConfirmationEmail(config.testData)

    const result = await resend.emails.send({
      from: config.resend.fromEmail,
      to: [config.testData.customerEmail],
      subject: emailContent.subject,
      html: emailContent.html,
    })

    if (result.error) {
      logError(`Customer email failed: ${result.error.message}`)
      return false
    }

    logSuccess(`Customer email sent successfully`)
    logInfo(`Email ID: ${result.data.id}`)
    return true
  } catch (error) {
    logError(`Customer email error: ${error.message}`)
    return false
  }
}

async function testAdminEmail() {
  logStep("4.", "Testing Admin Notification Email")

  try {
    const resend = new Resend(config.resend.apiKey)
    const emailContent = createAdminNotificationEmail(config.testData)

    const result = await resend.emails.send({
      from: config.resend.fromEmail,
      to: [config.resend.adminEmail],
      subject: emailContent.subject,
      html: emailContent.html,
    })

    if (result.error) {
      logError(`Admin email failed: ${result.error.message}`)
      return false
    }

    logSuccess(`Admin email sent successfully`)
    logInfo(`Email ID: ${result.data.id}`)
    return true
  } catch (error) {
    logError(`Admin email error: ${error.message}`)
    return false
  }
}

async function testDatabaseIntegration() {
  logStep("5.", "Testing Database Integration")

  try {
    const supabase = createClient(config.supabase.url, config.supabase.serviceKey)

    // Create a test booking
    const testBooking = {
      client_name: config.testData.customerName,
      client_email: config.testData.customerEmail,
      client_phone: config.testData.customerPhone,
      phone: config.testData.customerPhone,
      email: config.testData.customerEmail,
      service_name: config.testData.serviceName,
      service: config.testData.serviceName,
      booking_date: config.testData.bookingDate,
      booking_time: config.testData.bookingTime,
      total_amount: config.testData.totalAmount,
      amount: config.testData.depositAmount,
      deposit_amount: config.testData.depositAmount,
      payment_reference: config.testData.paymentReference,
      status: "confirmed",
      payment_status: "completed",
      notes: "Email system test booking",
    }

    const { data: booking, error: insertError } = await supabase.from("bookings").insert(testBooking).select().single()

    if (insertError) {
      logError(`Database insert failed: ${insertError.message}`)
      return false
    }

    logSuccess(`Test booking created: ${booking.id}`)

    // Clean up
    await supabase.from("bookings").delete().eq("id", booking.id)
    logInfo("Test booking cleaned up")

    return true
  } catch (error) {
    logError(`Database integration error: ${error.message}`)
    return false
  }
}

async function testCompleteEmailFlow() {
  logStep("6.", "Testing Complete Email Flow")

  try {
    const resend = new Resend(config.resend.apiKey)

    // Send both emails in sequence
    const customerEmail = createCustomerConfirmationEmail(config.testData)
    const adminEmail = createAdminNotificationEmail(config.testData)

    // Send customer email
    const customerResult = await resend.emails.send({
      from: config.resend.fromEmail,
      to: [config.testData.customerEmail],
      subject: customerEmail.subject,
      html: customerEmail.html,
    })

    if (customerResult.error) {
      logError(`Customer email in flow failed: ${customerResult.error.message}`)
      return false
    }

    // Send admin email
    const adminResult = await resend.emails.send({
      from: config.resend.fromEmail,
      to: [config.resend.adminEmail],
      subject: adminEmail.subject,
      html: adminEmail.html,
    })

    if (adminResult.error) {
      logError(`Admin email in flow failed: ${adminResult.error.message}`)
      return false
    }

    logSuccess("Complete email flow successful")
    logInfo(`Customer email ID: ${customerResult.data.id}`)
    logInfo(`Admin email ID: ${adminResult.data.id}`)
    return true
  } catch (error) {
    logError(`Complete email flow error: ${error.message}`)
    return false
  }
}

// Main test runner
async function runEmailTests() {
  log("\n" + "=".repeat(60), colors.bright)
  log("📧 LASHED BY DEEDEE - EMAIL SYSTEM TEST", colors.bright)
  log("=".repeat(60), colors.bright)
  log(`Started at: ${new Date().toISOString()}`, colors.cyan)
  log("")

  const tests = [
    { name: "Environment Variables", test: testEnvironmentVariables },
    { name: "Resend Connection", test: testResendConnection },
    { name: "Customer Email", test: testCustomerEmail },
    { name: "Admin Email", test: testAdminEmail },
    { name: "Database Integration", test: testDatabaseIntegration },
    { name: "Complete Email Flow", test: testCompleteEmailFlow },
  ]

  const results = []

  for (const test of tests) {
    try {
      const result = await test.test()
      results.push({ name: test.name, success: result })
    } catch (error) {
      logError(`Test "${test.name}" threw an error: ${error.message}`)
      results.push({ name: test.name, success: false, error: error.message })
    }
    log("") // Add spacing between tests
  }

  // Summary
  log("=".repeat(60), colors.bright)
  log("📊 EMAIL SYSTEM TEST RESULTS", colors.bright)
  log("=".repeat(60), colors.bright)

  const passed = results.filter((r) => r.success).length
  const failed = results.filter((r) => !r.success).length

  results.forEach((result) => {
    if (result.success) {
      logSuccess(`${result.name}`)
    } else {
      logError(`${result.name}${result.error ? ` - ${result.error}` : ""}`)
    }
  })

  log("")
  log(`Total Tests: ${results.length}`, colors.bright)
  log(`Passed: ${passed}`, colors.green)
  log(`Failed: ${failed}`, failed > 0 ? colors.red : colors.green)
  log(`Success Rate: ${Math.round((passed / results.length) * 100)}%`, colors.cyan)

  log("")
  log(`Completed at: ${new Date().toISOString()}`, colors.cyan)
  log("=".repeat(60), colors.bright)

  if (failed === 0) {
    logSuccess("🎉 ALL EMAIL TESTS PASSED! Email system is fully functional.")
  } else {
    logError(`❌ ${failed} test(s) failed. Please check the errors above.`)
  }

  process.exit(failed === 0 ? 0 : 1)
}

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  logError(`Unhandled Rejection at: ${promise}, reason: ${reason}`)
  process.exit(1)
})

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  logError(`Uncaught Exception: ${error.message}`)
  process.exit(1)
})

// Run the tests
if (require.main === module) {
  runEmailTests()
}

module.exports = {
  runEmailTests,
  testEnvironmentVariables,
  testResendConnection,
  testCustomerEmail,
  testAdminEmail,
  testDatabaseIntegration,
  testCompleteEmailFlow,
}
