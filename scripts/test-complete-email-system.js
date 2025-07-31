/**
 * Complete Email System Test for Lashed by Deedee
 * Tests all email functionality including templates, sending, and integration
 */

import { createClient } from "@supabase/supabase-js"

// Environment validation
const requiredEnvVars = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "RESEND_API_KEY"]

console.log("🔍 Checking environment variables...")
const missingVars = requiredEnvVars.filter((varName) => !process.env[varName])

if (missingVars.length > 0) {
  console.error("❌ Missing environment variables:", missingVars)
  process.exit(1)
}

console.log("✅ All required environment variables are present")

// Initialize Supabase client
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

// Test booking data
const testBooking = {
  customerName: "Sarah Johnson",
  customerEmail: "sarah.johnson@example.com",
  customerPhone: "+2348123456789",
  serviceName: "Volume Lash Extensions + Brow Shaping",
  bookingDate: "2025-08-20",
  bookingTime: "2:00 PM",
  totalAmount: 35000,
  depositAmount: 17500,
  paymentReference: `EMAIL_TEST_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
  notes: "Client prefers natural look, sensitive skin",
}

async function testResendConnection() {
  console.log("\n🧪 Testing Resend API Connection...")

  try {
    const response = await fetch("https://api.resend.com/domains", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    console.log("✅ Resend API connection successful")
    console.log("📊 Available domains:", data.data?.length || 0)

    return true
  } catch (error) {
    console.error("❌ Resend API connection failed:", error.message)
    return false
  }
}

async function testEmailTemplateGeneration() {
  console.log("\n🧪 Testing Email Template Generation...")

  try {
    // Import email functions dynamically
    const { createCustomerConfirmationEmail, createAdminNotificationEmail } = await import("../lib/email.js")

    // Test customer confirmation template
    const customerTemplate = createCustomerConfirmationEmail(testBooking)
    console.log("✅ Customer confirmation template generated")
    console.log("📧 Subject:", customerTemplate.subject)
    console.log("📄 HTML length:", customerTemplate.html.length, "characters")

    // Test admin notification template
    const adminTemplate = createAdminNotificationEmail(testBooking)
    console.log("✅ Admin notification template generated")
    console.log("📧 Subject:", adminTemplate.subject)
    console.log("📄 HTML length:", adminTemplate.html.length, "characters")

    // Validate template content
    const customerHasBookingDetails =
      customerTemplate.html.includes(testBooking.customerName) &&
      customerTemplate.html.includes(testBooking.serviceName) &&
      customerTemplate.html.includes(testBooking.paymentReference)

    const adminHasBookingDetails =
      adminTemplate.html.includes(testBooking.customerName) &&
      adminTemplate.html.includes(testBooking.serviceName) &&
      adminTemplate.html.includes(testBooking.customerPhone)

    if (!customerHasBookingDetails) {
      throw new Error("Customer template missing booking details")
    }

    if (!adminHasBookingDetails) {
      throw new Error("Admin template missing booking details")
    }

    console.log("✅ Template content validation passed")
    return true
  } catch (error) {
    console.error("❌ Email template generation failed:", error.message)
    return false
  }
}

async function testEmailSending() {
  console.log("\n🧪 Testing Email Sending...")

  try {
    // Import email functions
    const { sendCustomerConfirmationEmail, sendAdminNotificationEmail } = await import("../lib/email.js")

    // Test customer email
    console.log("📧 Sending customer confirmation email...")
    const customerResult = await sendCustomerConfirmationEmail(testBooking)

    if (!customerResult.success) {
      throw new Error(`Customer email failed: ${customerResult.error}`)
    }

    console.log("✅ Customer confirmation email sent successfully")
    console.log("📧 Email ID:", customerResult.id)

    // Test admin email
    console.log("📧 Sending admin notification email...")
    const adminResult = await sendAdminNotificationEmail(testBooking)

    if (!adminResult.success) {
      throw new Error(`Admin email failed: ${adminResult.error}`)
    }

    console.log("✅ Admin notification email sent successfully")
    console.log("📧 Email ID:", adminResult.id)

    return true
  } catch (error) {
    console.error("❌ Email sending failed:", error.message)
    return false
  }
}

async function testBulkEmailSending() {
  console.log("\n🧪 Testing Bulk Email Sending...")

  try {
    const { sendBookingEmails } = await import("../lib/email.js")

    console.log("📧 Sending both customer and admin emails concurrently...")
    const results = await sendBookingEmails(testBooking)

    console.log("📊 Bulk email results:")
    console.log("  Customer:", results.customer.success ? "✅ Success" : "❌ Failed")
    console.log("  Admin:", results.admin.success ? "✅ Success" : "❌ Failed")

    if (results.customer.success && results.admin.success) {
      console.log("✅ Bulk email sending successful")
      return true
    } else {
      throw new Error("One or more bulk emails failed")
    }
  } catch (error) {
    console.error("❌ Bulk email sending failed:", error.message)
    return false
  }
}

async function testDatabaseEmailIntegration() {
  console.log("\n🧪 Testing Database Email Integration...")

  try {
    // Create a test booking in the database
    const { data: booking, error: insertError } = await supabase
      .from("bookings")
      .insert({
        client_name: testBooking.customerName,
        client_email: testBooking.customerEmail,
        client_phone: testBooking.customerPhone,
        service_name: testBooking.serviceName,
        booking_date: testBooking.bookingDate,
        booking_time: testBooking.bookingTime,
        total_amount: testBooking.totalAmount,
        deposit_amount: testBooking.depositAmount,
        payment_reference: testBooking.paymentReference,
        payment_status: "completed",
        status: "confirmed",
        notes: testBooking.notes,
      })
      .select()
      .single()

    if (insertError) {
      throw insertError
    }

    console.log("✅ Test booking created in database")

    // Test email sending with database data
    const { sendBookingEmails } = await import("../lib/email.js")

    const emailData = {
      customerName: booking.client_name,
      customerEmail: booking.client_email,
      customerPhone: booking.client_phone,
      serviceName: booking.service_name,
      bookingDate: booking.booking_date,
      bookingTime: booking.booking_time,
      totalAmount: booking.total_amount,
      depositAmount: booking.deposit_amount,
      paymentReference: booking.payment_reference,
      notes: booking.notes,
    }

    const emailResults = await sendBookingEmails(emailData)

    if (emailResults.customer.success && emailResults.admin.success) {
      console.log("✅ Database-integrated email sending successful")
    } else {
      throw new Error("Database-integrated email sending failed")
    }

    // Clean up test data
    await supabase.from("bookings").delete().eq("payment_reference", testBooking.paymentReference)
    console.log("🧹 Test data cleaned up")

    return true
  } catch (error) {
    console.error("❌ Database email integration failed:", error.message)
    return false
  }
}

async function testEmailErrorHandling() {
  console.log("\n🧪 Testing Email Error Handling...")

  try {
    const { sendCustomerConfirmationEmail } = await import("../lib/email.js")

    // Test with invalid email
    const invalidBooking = {
      ...testBooking,
      customerEmail: "invalid-email-address",
    }

    const result = await sendCustomerConfirmationEmail(invalidBooking)

    if (result.success) {
      console.log("⚠️  Expected email to fail with invalid address, but it succeeded")
      return false
    } else {
      console.log("✅ Email error handling working correctly")
      console.log("📧 Error:", result.error)
      return true
    }
  } catch (error) {
    console.log("✅ Email error handling working correctly (caught exception)")
    console.log("📧 Error:", error.message)
    return true
  }
}

async function runEmailSystemTests() {
  console.log("🚀 Starting Complete Email System Tests for Lashed by Deedee")
  console.log("=".repeat(70))

  const results = {
    resendConnection: false,
    templateGeneration: false,
    emailSending: false,
    bulkEmailSending: false,
    databaseIntegration: false,
    errorHandling: false,
  }

  // Test 1: Resend API Connection
  results.resendConnection = await testResendConnection()

  // Test 2: Email Template Generation
  results.templateGeneration = await testEmailTemplateGeneration()

  // Test 3: Individual Email Sending
  results.emailSending = await testEmailSending()

  // Test 4: Bulk Email Sending
  results.bulkEmailSending = await testBulkEmailSending()

  // Test 5: Database Integration
  results.databaseIntegration = await testDatabaseEmailIntegration()

  // Test 6: Error Handling
  results.errorHandling = await testEmailErrorHandling()

  // Summary
  console.log("\n" + "=".repeat(70))
  console.log("📊 EMAIL SYSTEM TEST RESULTS")
  console.log("=".repeat(70))

  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? "✅ PASSED" : "❌ FAILED"
    const testName = test.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())
    console.log(`${testName.padEnd(25)} ${status}`)
  })

  const passedTests = Object.values(results).filter(Boolean).length
  const totalTests = Object.keys(results).length

  console.log("\n" + "-".repeat(70))
  console.log(`Overall Score: ${passedTests}/${totalTests} tests passed`)

  if (passedTests === totalTests) {
    console.log("🎉 All email system tests PASSED!")
    console.log("📧 Email system is ready for production")
    console.log("✨ Beautiful HTML templates are working perfectly")
  } else {
    console.log("⚠️  Some tests failed. Please review the issues above.")
    console.log("🔧 Fix the failing components before going live")
  }

  console.log("=".repeat(70))
}

// Run the tests
runEmailSystemTests().catch((error) => {
  console.error("💥 Email test suite crashed:", error)
  process.exit(1)
})
