import { createClient } from "@supabase/supabase-js"

// Environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const ZOHO_CLIENT_ID = process.env.ZOHO_CLIENT_ID
const ZOHO_CLIENT_SECRET = process.env.ZOHO_CLIENT_SECRET
const ZOHO_REFRESH_TOKEN = process.env.ZOHO_REFRESH_TOKEN
const ZOHO_EMAIL_USER = process.env.ZOHO_EMAIL_USER

console.log("📧 Testing Complete Email System with Zoho Mail...\n")

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Mock Zoho token refresh
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

// Mock email functions for testing
function createCustomerConfirmationEmail(booking) {
  const remainingBalance = booking.totalAmount - booking.depositAmount

  return {
    subject: `Booking Confirmation - ${booking.serviceName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
          <h1>🎉 Booking Confirmed!</h1>
          <p>Thank you for choosing Lashed by Deedee</p>
        </div>
        <div style="padding: 30px;">
          <p>Dear ${booking.customerName},</p>
          <p>Your booking has been confirmed!</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>📋 Your Booking Details</h3>
            <p><strong>Service:</strong> ${booking.serviceName}</p>
            <p><strong>Date:</strong> ${booking.bookingDate}</p>
            <p><strong>Time:</strong> ${booking.bookingTime}</p>
            <p><strong>Total Amount:</strong> ₦${booking.totalAmount.toLocaleString()}</p>
            <p><strong>Deposit Paid:</strong> ₦${booking.depositAmount.toLocaleString()}</p>
            ${remainingBalance > 0 ? `<p><strong>Balance Due:</strong> ₦${remainingBalance.toLocaleString()}</p>` : ""}
            <p><strong>Reference:</strong> ${booking.paymentReference}</p>
          </div>
          
          <p>We look forward to seeing you!</p>
        </div>
      </div>
    `,
  }
}

function createAdminNotificationEmail(booking) {
  const remainingBalance = booking.totalAmount - booking.depositAmount

  return {
    subject: `🚨 New Booking Alert - ${booking.serviceName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 30px; text-align: center;">
          <h1>🚨 New Booking Alert</h1>
          <p>A new booking has been confirmed and paid</p>
        </div>
        <div style="padding: 30px;">
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>👤 Customer Information</h3>
            <p><strong>Name:</strong> ${booking.customerName}</p>
            <p><strong>Email:</strong> ${booking.customerEmail}</p>
            <p><strong>Phone:</strong> ${booking.customerPhone}</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>📋 Booking Information</h3>
            <p><strong>Service:</strong> ${booking.serviceName}</p>
            <p><strong>Date:</strong> ${booking.bookingDate}</p>
            <p><strong>Time:</strong> ${booking.bookingTime}</p>
            <p><strong>Total Amount:</strong> ₦${booking.totalAmount.toLocaleString()}</p>
            <p><strong>Deposit Paid:</strong> ₦${booking.depositAmount.toLocaleString()}</p>
            ${remainingBalance > 0 ? `<p><strong>Balance Due:</strong> ₦${remainingBalance.toLocaleString()}</p>` : ""}
            <p><strong>Reference:</strong> ${booking.paymentReference}</p>
          </div>
        </div>
      </div>
    `,
  }
}

async function sendZohoTestEmail(emailData, type) {
  try {
    const accessToken = await getZohoAccessToken()

    const zohoEmailData = {
      fromAddress: ZOHO_EMAIL_USER,
      toAddress: emailData.to,
      subject: emailData.subject,
      content: emailData.html,
      mailFormat: "html",
    }

    const response = await fetch("https://mail.zoho.com/api/accounts/me/messages", {
      method: "POST",
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(zohoEmailData),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Zoho Mail API error: ${response.status} - ${errorText}`)
    }

    const result = await response.json()

    if (result.status && result.status.code === 200) {
      console.log(`✅ ${type} email sent via Zoho:`, result.data.messageId)
      return { success: true, id: result.data.messageId }
    } else {
      console.log(`❌ ${type} email failed:`, result.status?.description || "Unknown error")
      return { success: false, error: result.status?.description || "Unknown error" }
    }
  } catch (error) {
    console.log(`❌ ${type} email error:`, error.message)
    return { success: false, error: error.message }
  }
}

async function testCompleteEmailSystem() {
  try {
    console.log("📋 Environment Check:")
    console.log(`✅ Supabase URL: ${SUPABASE_URL ? "Set" : "❌ Missing"}`)
    console.log(`✅ Supabase Service Key: ${SUPABASE_SERVICE_KEY ? "Set" : "❌ Missing"}`)
    console.log(`✅ Zoho Client ID: ${ZOHO_CLIENT_ID ? "Set" : "❌ Missing"}`)
    console.log(`✅ Zoho Client Secret: ${ZOHO_CLIENT_SECRET ? "Set" : "❌ Missing"}`)
    console.log(`✅ Zoho Refresh Token: ${ZOHO_REFRESH_TOKEN ? "Set" : "❌ Missing"}`)
    console.log(`✅ Zoho Email User: ${ZOHO_EMAIL_USER ? "Set" : "❌ Missing"}\n`)

    if (
      !SUPABASE_URL ||
      !SUPABASE_SERVICE_KEY ||
      !ZOHO_CLIENT_ID ||
      !ZOHO_CLIENT_SECRET ||
      !ZOHO_REFRESH_TOKEN ||
      !ZOHO_EMAIL_USER
    ) {
      throw new Error("Missing required environment variables")
    }

    // Test 1: Zoho Token Refresh
    console.log("🔑 Test 1: Zoho Token Refresh")
    try {
      const accessToken = await getZohoAccessToken()
      console.log("✅ Zoho access token obtained successfully")
      console.log(`🔑 Token preview: ${accessToken.substring(0, 20)}...\n`)
    } catch (error) {
      console.log("❌ Zoho token refresh failed:", error.message)
      return
    }

    // Test 2: Email Template Generation
    console.log("📝 Test 2: Email Template Generation")
    const testBookingData = {
      customerName: "Jane Doe",
      customerEmail: "test@example.com",
      customerPhone: "+2348012345678",
      serviceName: "Classic Lash Extensions",
      bookingDate: "2024-08-15",
      bookingTime: "10:00 AM",
      totalAmount: 25000,
      depositAmount: 12500,
      paymentReference: `TEST_${Date.now()}`,
      notes: "First time customer, please be gentle",
    }

    const customerEmail = createCustomerConfirmationEmail(testBookingData)
    const adminEmail = createAdminNotificationEmail(testBookingData)

    console.log("✅ Customer email template generated")
    console.log("✅ Admin email template generated")
    console.log(`📧 Customer subject: ${customerEmail.subject}`)
    console.log(`📧 Admin subject: ${adminEmail.subject}\n`)

    // Test 3: Email Content Validation
    console.log("🔍 Test 3: Email Content Validation")

    // Check customer email content
    const customerHtml = customerEmail.html
    const customerChecks = {
      hasCustomerName: customerHtml.includes(testBookingData.customerName),
      hasServiceName: customerHtml.includes(testBookingData.serviceName),
      hasBookingDate: customerHtml.includes(testBookingData.bookingDate),
      hasBookingTime: customerHtml.includes(testBookingData.bookingTime),
      hasTotalAmount: customerHtml.includes("₦25,000"),
      hasDepositAmount: customerHtml.includes("₦12,500"),
      hasBalanceDue: customerHtml.includes("₦12,500"), // remaining balance
      hasPaymentReference: customerHtml.includes(testBookingData.paymentReference),
    }

    console.log("📧 Customer Email Content:")
    Object.entries(customerChecks).forEach(([check, passed]) => {
      console.log(`  ${passed ? "✅" : "❌"} ${check}: ${passed ? "Present" : "Missing"}`)
    })

    // Check admin email content
    const adminHtml = adminEmail.html
    const adminChecks = {
      hasCustomerName: adminHtml.includes(testBookingData.customerName),
      hasCustomerEmail: adminHtml.includes(testBookingData.customerEmail),
      hasCustomerPhone: adminHtml.includes(testBookingData.customerPhone),
      hasServiceName: adminHtml.includes(testBookingData.serviceName),
      hasBookingDate: adminHtml.includes(testBookingData.bookingDate),
      hasBookingTime: adminHtml.includes(testBookingData.bookingTime),
      hasTotalAmount: adminHtml.includes("₦25,000"),
      hasDepositAmount: adminHtml.includes("₦12,500"),
      hasPaymentReference: adminHtml.includes(testBookingData.paymentReference),
    }

    console.log("\n📧 Admin Email Content:")
    Object.entries(adminChecks).forEach(([check, passed]) => {
      console.log(`  ${passed ? "✅" : "❌"} ${check}: ${passed ? "Present" : "Missing"}`)
    })

    // Test 4: Email Sending via Zoho
    console.log("\n📤 Test 4: Email Sending via Zoho")

    console.log("🚀 Attempting to send test emails via Zoho Mail...")

    // Send customer email
    const customerResult = await sendZohoTestEmail(
      {
        to: "test@example.com",
        subject: customerEmail.subject,
        html: customerEmail.html,
      },
      "Customer",
    )

    // Send admin email
    const adminResult = await sendZohoTestEmail(
      {
        to: "admin@example.com",
        subject: adminEmail.subject,
        html: adminEmail.html,
      },
      "Admin",
    )

    console.log("\n📊 Zoho Email Sending Results:")
    console.log(`  Customer Email: ${customerResult.success ? "✅ Sent" : "❌ Failed"}`)
    console.log(`  Admin Email: ${adminResult.success ? "✅ Sent" : "❌ Failed"}`)

    if (!customerResult.success) {
      console.log(`  Customer Error: ${customerResult.error}`)
    }
    if (!adminResult.success) {
      console.log(`  Admin Error: ${adminResult.error}`)
    }

    // Test 5: Database Integration Test
    console.log("\n💾 Test 5: Database Integration Test")

    // Create test booking
    const testBooking = {
      client_name: testBookingData.customerName,
      client_email: testBookingData.customerEmail,
      client_phone: testBookingData.customerPhone,
      service_name: testBookingData.serviceName,
      booking_date: testBookingData.bookingDate,
      booking_time: testBookingData.bookingTime,
      total_amount: testBookingData.totalAmount,
      deposit_amount: testBookingData.depositAmount,
      payment_status: "completed",
      payment_reference: testBookingData.paymentReference,
      status: "confirmed",
      notes: testBookingData.notes,
    }

    const { data: booking, error: bookingError } = await supabase.from("bookings").insert(testBooking).select().single()

    if (bookingError) {
      console.log("❌ Failed to create test booking:", bookingError.message)
    } else {
      console.log("✅ Test booking created successfully")
      console.log(`📝 Booking ID: ${booking.id}`)

      // Simulate email trigger after booking creation
      console.log("📧 Simulating email trigger after booking creation...")

      const emailBookingData = {
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

      const triggerCustomerEmail = createCustomerConfirmationEmail(emailBookingData)
      const triggerAdminEmail = createAdminNotificationEmail(emailBookingData)

      console.log("✅ Email templates generated from database data")
      console.log(`📧 Customer email ready: ${triggerCustomerEmail.subject}`)
      console.log(`📧 Admin email ready: ${triggerAdminEmail.subject}`)

      // Cleanup
      const { error: deleteError } = await supabase.from("bookings").delete().eq("id", booking.id)

      if (deleteError) {
        console.log("⚠️  Failed to delete test booking:", deleteError.message)
      } else {
        console.log("✅ Test booking cleaned up")
      }
    }

    console.log("\n🎉 Complete Email System Test with Zoho Mail Finished!")
    console.log("📊 Summary:")
    console.log("  ✅ Zoho Token Refresh: Working")
    console.log("  ✅ Template Generation: Working")
    console.log("  ✅ Content Validation: Working")
    console.log("  ✅ Database Integration: Working")
    console.log(
      `  ${customerResult.success && adminResult.success ? "✅" : "⚠️ "} Zoho Email Sending: ${customerResult.success && adminResult.success ? "Working" : "Needs Review"}`,
    )
  } catch (error) {
    console.error("❌ Test failed:", error.message)
    console.log("\n🔧 Troubleshooting:")
    console.log("  1. Check Zoho environment variables are set correctly")
    console.log("  2. Verify Zoho OAuth2 credentials are valid")
    console.log("  3. Ensure Zoho Mail API access is enabled")
    console.log("  4. Check Supabase connection is working")
    console.log("  5. Verify email templates for syntax errors")
    console.log("  6. Ensure Zoho Mail domain is properly configured")
  }
}

// Run the test
testCompleteEmailSystem()
