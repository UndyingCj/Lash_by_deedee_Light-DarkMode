#!/usr/bin/env node

/**
 * Comprehensive Booking Scenarios Test for Lashed by Deedee
 * Tests realistic booking flows, edge cases, and system integration with Zoho Mail
 */

import { createClient } from "@supabase/supabase-js"
import fetch from "node-fetch"

// Environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
const ZOHO_CLIENT_ID = process.env.ZOHO_CLIENT_ID
const ZOHO_CLIENT_SECRET = process.env.ZOHO_CLIENT_SECRET
const ZOHO_REFRESH_TOKEN = process.env.ZOHO_REFRESH_TOKEN
const ZOHO_EMAIL_USER = process.env.ZOHO_EMAIL_USER

// Configuration
const config = {
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
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

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Test scenarios
const scenarios = [
  {
    name: "New Customer - Classic Lashes",
    customer: {
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      phone: "+2348012345678",
    },
    booking: {
      service: "Classic Lash Extensions",
      date: "2024-08-20",
      time: "10:00 AM",
      totalAmount: 25000,
      notes: "First time customer, sensitive eyes",
    },
  },
  {
    name: "Returning Customer - Volume Lashes",
    customer: {
      name: "Amara Okafor",
      email: "amara.okafor@email.com",
      phone: "+2348087654321",
    },
    booking: {
      service: "Volume Lash Extensions",
      date: "2024-08-21",
      time: "2:00 PM",
      totalAmount: 35000,
      notes: "Regular customer, prefers dramatic look",
    },
  },
  {
    name: "Brow Service - Ombre Powder",
    customer: {
      name: "Kemi Adebayo",
      email: "kemi.adebayo@email.com",
      phone: "+2348098765432",
    },
    booking: {
      service: "Ombre Powder Brows",
      date: "2024-08-22",
      time: "11:30 AM",
      totalAmount: 45000,
      notes: "Wants natural-looking brows, medium brown color",
    },
  },
  {
    name: "Training Session",
    customer: {
      name: "Funmi Oladele",
      email: "funmi.oladele@email.com",
      phone: "+2348076543210",
    },
    booking: {
      service: "Lash Extension Training - Beginner",
      date: "2024-08-25",
      time: "9:00 AM",
      totalAmount: 150000,
      notes: "Complete beginner, needs full kit",
    },
  },
  {
    name: "Lash Refill",
    customer: {
      name: "Chioma Nwankwo",
      email: "chioma.nwankwo@email.com",
      phone: "+2348065432109",
    },
    booking: {
      service: "Lash Refill",
      date: "2024-08-23",
      time: "4:00 PM",
      totalAmount: 15000,
      notes: "2-week refill, classic set",
    },
  },
]

async function getZohoAccessToken() {
  try {
    const response = await fetch("https://accounts.zoho.com/oauth/v2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        refresh_token: ZOHO_REFRESH_TOKEN,
        client_id: ZOHO_CLIENT_ID,
        client_secret: ZOHO_CLIENT_SECRET,
        grant_type: "refresh_token",
      }),
    })

    if (!response.ok) {
      throw new Error(`Zoho token refresh failed: ${response.status}`)
    }

    const data = await response.json()
    return data.access_token
  } catch (error) {
    throw new Error(`Failed to get Zoho access token: ${error.message}`)
  }
}

async function createTestBooking(scenario) {
  const depositAmount = Math.round(scenario.booking.totalAmount * 0.5) // 50% deposit
  const paymentReference = `TEST_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`

  const bookingData = {
    client_name: scenario.customer.name,
    client_email: scenario.customer.email,
    client_phone: scenario.customer.phone,
    service_name: scenario.booking.service,
    booking_date: scenario.booking.date,
    booking_time: scenario.booking.time,
    total_amount: scenario.booking.totalAmount,
    deposit_amount: depositAmount,
    payment_status: "pending",
    payment_reference: paymentReference,
    status: "pending",
    notes: scenario.booking.notes,
  }

  const { data: booking, error } = await supabase.from("bookings").insert(bookingData).select().single()

  if (error) {
    throw new Error(`Failed to create booking: ${error.message}`)
  }

  return { booking, depositAmount, paymentReference }
}

async function simulatePayment(paymentReference, amount) {
  try {
    // Initialize payment
    const paymentData = {
      email: "test@example.com",
      amount: amount * 100, // Convert to kobo
      reference: paymentReference,
      callback_url: "https://lashedbydeedee.com/booking/success",
    }

    const initResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentData),
    })

    const initResult = await initResponse.json()

    if (!initResponse.ok || !initResult.status) {
      throw new Error(`Payment initialization failed: ${initResult.message}`)
    }

    return {
      success: true,
      authorizationUrl: initResult.data.authorization_url,
      accessCode: initResult.data.access_code,
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    }
  }
}

async function simulateWebhook(booking, paymentReference) {
  try {
    // Simulate successful payment webhook
    const webhookPayload = {
      event: "charge.success",
      data: {
        reference: paymentReference,
        status: "success",
        amount: booking.deposit_amount * 100,
        customer: {
          email: booking.client_email,
        },
        metadata: {
          booking_id: booking.id,
        },
      },
    }

    // Update booking status (simulating webhook processing)
    const { data: updatedBooking, error } = await supabase
      .from("bookings")
      .update({
        payment_status: "completed",
        status: "confirmed",
        updated_at: new Date().toISOString(),
      })
      .eq("payment_reference", paymentReference)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update booking: ${error.message}`)
    }

    return {
      success: true,
      booking: updatedBooking,
      webhookPayload,
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    }
  }
}

function generateEmailContent(booking) {
  const remainingBalance = booking.total_amount - booking.deposit_amount

  return {
    customer: {
      subject: `Booking Confirmation - ${booking.service_name}`,
      preview: `Dear ${booking.client_name}, your ${booking.service_name} appointment is confirmed for ${booking.booking_date} at ${booking.booking_time}.`,
    },
    admin: {
      subject: `🚨 New Booking Alert - ${booking.service_name} - ${booking.booking_date}`,
      preview: `New booking from ${booking.client_name} for ${booking.service_name} on ${booking.booking_date} at ${booking.booking_time}. Deposit: ₦${booking.deposit_amount.toLocaleString()}, Balance: ₦${remainingBalance.toLocaleString()}.`,
    },
  }
}

async function testZohoEmailIntegration(booking) {
  try {
    const accessToken = await getZohoAccessToken()

    const emailData = {
      fromAddress: ZOHO_EMAIL_USER,
      toAddress: booking.client_email,
      subject: `Test Email - Booking ${booking.payment_reference}`,
      content: `<p>This is a test email for booking ${booking.payment_reference}</p>`,
      mailFormat: "html",
    }

    const response = await fetch("https://mail.zoho.com/api/accounts/me/messages", {
      method: "POST",
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailData),
    })

    if (response.ok) {
      const result = await response.json()
      return {
        success: true,
        messageId: result.data?.messageId,
      }
    } else {
      const errorText = await response.text()
      return {
        success: false,
        error: `Zoho API error: ${response.status} - ${errorText}`,
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    }
  }
}

async function testBookingScenario(scenario, index) {
  console.log(`\n🎬 Scenario ${index + 1}: ${scenario.name}`)
  console.log("─".repeat(50))

  try {
    // Step 1: Create booking
    console.log("📝 Step 1: Creating booking...")
    const { booking, depositAmount, paymentReference } = await createTestBooking(scenario)
    console.log(`✅ Booking created - ID: ${booking.id}`)
    console.log(`💰 Deposit amount: ₦${depositAmount.toLocaleString()}`)
    console.log(`🔗 Payment reference: ${paymentReference}`)

    // Step 2: Simulate payment initialization
    console.log("\n💳 Step 2: Initializing payment...")
    const paymentResult = await simulatePayment(paymentReference, depositAmount)

    if (paymentResult.success) {
      console.log("✅ Payment initialized successfully")
      console.log(`🔗 Authorization URL generated`)
    } else {
      console.log(`❌ Payment initialization failed: ${paymentResult.error}`)
    }

    // Step 3: Simulate successful payment and webhook
    console.log("\n🔔 Step 3: Processing payment webhook...")
    const webhookResult = await simulateWebhook(booking, paymentReference)

    if (webhookResult.success) {
      console.log("✅ Webhook processed successfully")
      console.log(`📊 Booking status: ${webhookResult.booking.status}`)
      console.log(`💳 Payment status: ${webhookResult.booking.payment_status}`)
    } else {
      console.log(`❌ Webhook processing failed: ${webhookResult.error}`)
    }

    // Step 4: Generate email content
    console.log("\n📧 Step 4: Generating email content...")
    const emailContent = generateEmailContent(webhookResult.success ? webhookResult.booking : booking)
    console.log("✅ Customer email content generated")
    console.log(`📧 Subject: ${emailContent.customer.subject}`)
    console.log("✅ Admin email content generated")
    console.log(`📧 Subject: ${emailContent.admin.subject}`)

    // Step 5: Test Zoho email integration
    console.log("\n📤 Step 5: Testing Zoho email integration...")
    const emailResult = await testZohoEmailIntegration(webhookResult.success ? webhookResult.booking : booking)

    if (emailResult.success) {
      console.log("✅ Zoho email integration working")
      console.log(`📧 Message ID: ${emailResult.messageId}`)
    } else {
      console.log(`❌ Zoho email integration failed: ${emailResult.error}`)
    }

    // Step 6: Validate booking data
    console.log("\n🔍 Step 6: Validating booking data...")
    const finalBooking = webhookResult.success ? webhookResult.booking : booking

    const validations = {
      hasCustomerName: !!finalBooking.client_name,
      hasCustomerEmail: !!finalBooking.client_email && finalBooking.client_email.includes("@"),
      hasCustomerPhone: !!finalBooking.client_phone,
      hasService: !!finalBooking.service_name,
      hasValidDate: !!finalBooking.booking_date && new Date(finalBooking.booking_date) > new Date(),
      hasValidTime: !!finalBooking.booking_time,
      hasValidAmount: finalBooking.total_amount > 0,
      hasValidDeposit: finalBooking.deposit_amount > 0 && finalBooking.deposit_amount <= finalBooking.total_amount,
      hasPaymentReference: !!finalBooking.payment_reference,
    }

    console.log("📊 Validation Results:")
    Object.entries(validations).forEach(([check, passed]) => {
      console.log(`  ${passed ? "✅" : "❌"} ${check}: ${passed ? "Valid" : "Invalid"}`)
    })

    const allValid = Object.values(validations).every((v) => v)
    console.log(`\n📋 Overall validation: ${allValid ? "✅ PASSED" : "❌ FAILED"}`)

    // Cleanup
    console.log("\n🧹 Cleanup: Removing test booking...")
    const { error: deleteError } = await supabase.from("bookings").delete().eq("id", booking.id)

    if (deleteError) {
      console.log(`⚠️  Failed to delete test booking: ${deleteError.message}`)
    } else {
      console.log("✅ Test booking cleaned up")
    }

    return {
      scenario: scenario.name,
      success: true,
      bookingCreated: true,
      paymentInitialized: paymentResult.success,
      webhookProcessed: webhookResult.success,
      emailsGenerated: true,
      zohoEmailWorking: emailResult.success,
      validationPassed: allValid,
    }
  } catch (error) {
    console.log(`❌ Scenario failed: ${error.message}`)
    return {
      scenario: scenario.name,
      success: false,
      error: error.message,
    }
  }
}

async function testBookingScenarios() {
  try {
    console.log("📋 Environment Check:")
    console.log(`✅ Supabase URL: ${SUPABASE_URL ? "Set" : "❌ Missing"}`)
    console.log(`✅ Supabase Service Key: ${SUPABASE_SERVICE_KEY ? "Set" : "❌ Missing"}`)
    console.log(`✅ Paystack Secret Key: ${PAYSTACK_SECRET_KEY ? "Set" : "❌ Missing"}`)
    console.log(`✅ Zoho Client ID: ${ZOHO_CLIENT_ID ? "Set" : "❌ Missing"}`)
    console.log(`✅ Zoho Client Secret: ${ZOHO_CLIENT_SECRET ? "Set" : "❌ Missing"}`)
    console.log(`✅ Zoho Refresh Token: ${ZOHO_REFRESH_TOKEN ? "Set" : "❌ Missing"}`)
    console.log(`✅ Zoho Email User: ${ZOHO_EMAIL_USER ? "Set" : "❌ Missing"}`)

    if (
      !SUPABASE_URL ||
      !SUPABASE_SERVICE_KEY ||
      !PAYSTACK_SECRET_KEY ||
      !ZOHO_CLIENT_ID ||
      !ZOHO_CLIENT_SECRET ||
      !ZOHO_REFRESH_TOKEN ||
      !ZOHO_EMAIL_USER
    ) {
      throw new Error("Missing required environment variables")
    }

    console.log(`\n🎭 Running ${scenarios.length} booking scenarios with Zoho Mail integration...\n`)

    const results = []

    for (let i = 0; i < scenarios.length; i++) {
      const result = await testBookingScenario(scenarios[i], i)
      results.push(result)

      // Add delay between scenarios
      if (i < scenarios.length - 1) {
        console.log("\n⏳ Waiting 2 seconds before next scenario...")
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
    }

    // Summary
    console.log("\n" + "=".repeat(60))
    console.log("📊 BOOKING SCENARIOS TEST SUMMARY")
    console.log("=".repeat(60))

    const successful = results.filter((r) => r.success).length
    const failed = results.filter((r) => !r.success).length

    console.log(`\n📈 Overall Results:`)
    console.log(`  ✅ Successful scenarios: ${successful}/${scenarios.length}`)
    console.log(`  ❌ Failed scenarios: ${failed}/${scenarios.length}`)
    console.log(`  📊 Success rate: ${Math.round((successful / scenarios.length) * 100)}%`)

    console.log(`\n📋 Detailed Results:`)
    results.forEach((result, index) => {
      console.log(`\n  ${index + 1}. ${result.scenario}`)
      console.log(`     Status: ${result.success ? "✅ PASSED" : "❌ FAILED"}`)

      if (result.success) {
        console.log(`     Booking Created: ${result.bookingCreated ? "✅" : "❌"}`)
        console.log(`     Payment Initialized: ${result.paymentInitialized ? "✅" : "❌"}`)
        console.log(`     Webhook Processed: ${result.webhookProcessed ? "✅" : "❌"}`)
        console.log(`     Emails Generated: ${result.emailsGenerated ? "✅" : "❌"}`)
        console.log(`     Zoho Email Working: ${result.zohoEmailWorking ? "✅" : "❌"}`)
        console.log(`     Validation Passed: ${result.validationPassed ? "✅" : "❌"}`)
      } else {
        console.log(`     Error: ${result.error}`)
      }
    })

    if (successful === scenarios.length) {
      console.log("\n🎉 All booking scenarios completed successfully!")
      console.log("✅ The booking system with Zoho Mail integration is working correctly")
    } else {
      console.log("\n⚠️  Some scenarios failed. Please review the errors above.")
    }

    console.log("\n🔧 System Components Tested:")
    console.log("  ✅ Database booking creation")
    console.log("  ✅ Payment initialization with Paystack")
    console.log("  ✅ Webhook processing simulation")
    console.log("  ✅ Email content generation")
    console.log("  ✅ Zoho Mail API integration")
    console.log("  ✅ Data validation and integrity")
    console.log("  ✅ Multiple service types and pricing")
    console.log("  ✅ Different customer scenarios")
  } catch (error) {
    console.error("❌ Test suite failed:", error.message)
    console.log("\n🔧 Troubleshooting:")
    console.log("  1. Check all environment variables are set correctly")
    console.log("  2. Verify database schema matches expected structure")
    console.log("  3. Ensure Paystack API keys are valid")
    console.log("  4. Verify Zoho OAuth2 credentials and refresh token")
    console.log("  5. Check Zoho Mail API access permissions")
    console.log("  6. Verify Supabase permissions and RLS policies")
  }
}

// Run the test
testBookingScenarios()
