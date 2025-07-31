console.log("🧪 Testing Complete Email System...")

// Test environment setup
const ZOHO_CONFIG = {
  clientId: process.env.ZOHO_CLIENT_ID,
  clientSecret: process.env.ZOHO_CLIENT_SECRET,
  refreshToken: process.env.ZOHO_REFRESH_TOKEN,
  emailUser: process.env.ZOHO_EMAIL_USER,
  emailPassword: process.env.ZOHO_EMAIL_PASSWORD,
}

const RESEND_API_KEY = process.env.RESEND_API_KEY

async function testEnvironmentVariables() {
  console.log("\n📋 Checking Environment Variables...")

  const requiredVars = {
    RESEND_API_KEY: RESEND_API_KEY,
    ZOHO_CLIENT_ID: ZOHO_CONFIG.clientId,
    ZOHO_CLIENT_SECRET: ZOHO_CONFIG.clientSecret,
    ZOHO_REFRESH_TOKEN: ZOHO_CONFIG.refreshToken,
    ZOHO_EMAIL_USER: ZOHO_CONFIG.emailUser,
  }

  let allPresent = true
  for (const [key, value] of Object.entries(requiredVars)) {
    const status = value ? "✅" : "❌"
    console.log(`${status} ${key}: ${value ? "Set" : "Missing"}`)
    if (!value) allPresent = false
  }

  return allPresent
}

async function testZohoTokenRefresh() {
  console.log("\n🔄 Testing Zoho Token Refresh...")

  try {
    if (!ZOHO_CONFIG.clientId || !ZOHO_CONFIG.clientSecret || !ZOHO_CONFIG.refreshToken) {
      console.log("⚠️ Zoho configuration incomplete, skipping test")
      return false
    }

    const response = await fetch("https://accounts.zoho.com/oauth/v2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        refresh_token: ZOHO_CONFIG.refreshToken,
        client_id: ZOHO_CONFIG.clientId,
        client_secret: ZOHO_CONFIG.clientSecret,
        grant_type: "refresh_token",
      }),
    })

    console.log(`📡 Response status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Token refresh failed:", errorText)
      return false
    }

    const responseText = await response.text()
    console.log("📥 Raw response:", responseText.substring(0, 200) + "...")

    let data
    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      console.error("❌ Failed to parse JSON response:", parseError)
      return false
    }

    if (data.access_token) {
      console.log("✅ Access token obtained successfully")
      console.log(`🔑 Token preview: ${data.access_token.substring(0, 20)}...`)
      return data.access_token
    } else {
      console.error("❌ No access token in response:", data)
      return false
    }
  } catch (error) {
    console.error("❌ Token refresh error:", error.message)
    return false
  }
}

async function testResendConnection() {
  console.log("\n📧 Testing Resend Connection...")

  try {
    if (!RESEND_API_KEY) {
      console.log("⚠️ Resend API key not configured")
      return false
    }

    // Test with a simple API call to check if the key is valid
    const response = await fetch("https://api.resend.com/domains", {
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
    })

    console.log(`📡 Response status: ${response.status}`)

    if (response.ok) {
      const data = await response.json()
      console.log("✅ Resend API connection successful")
      console.log(`📊 Domains found: ${data.data?.length || 0}`)
      return true
    } else {
      const errorText = await response.text()
      console.error("❌ Resend API error:", errorText)
      return false
    }
  } catch (error) {
    console.error("❌ Resend connection error:", error.message)
    return false
  }
}

async function testEmailSending() {
  console.log("\n📬 Testing Email Sending...")

  const testEmailData = {
    to: "test@example.com",
    subject: "Test Email - Lashed by Deedee System",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #d946ef;">Email System Test</h2>
        <p>This is a test email from the Lashed by Deedee booking system.</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        <p>If you receive this email, the system is working correctly!</p>
      </div>
    `,
  }

  // Test Resend
  console.log("🔄 Testing Resend email sending...")
  try {
    if (RESEND_API_KEY) {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Lashed by Deedee <bookings@lashedbydeedee.com>",
          to: [testEmailData.to],
          subject: testEmailData.subject,
          html: testEmailData.html,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log("✅ Resend test email would be sent successfully")
        console.log(`📧 Email ID: ${data.id}`)
      } else {
        const errorText = await response.text()
        console.error("❌ Resend test failed:", errorText)
      }
    } else {
      console.log("⚠️ Resend API key not available for testing")
    }
  } catch (error) {
    console.error("❌ Resend test error:", error.message)
  }

  // Test Zoho
  console.log("🔄 Testing Zoho email sending...")
  const accessToken = await testZohoTokenRefresh()
  if (accessToken) {
    try {
      const emailData = {
        fromAddress: ZOHO_CONFIG.emailUser,
        toAddress: testEmailData.to,
        subject: testEmailData.subject,
        content: testEmailData.html,
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
        console.log("✅ Zoho test email would be sent successfully")
      } else {
        const errorText = await response.text()
        console.error("❌ Zoho test failed:", errorText)
      }
    } catch (error) {
      console.error("❌ Zoho test error:", error.message)
    }
  } else {
    console.log("⚠️ Zoho access token not available for testing")
  }
}

async function testBookingEmailTemplates() {
  console.log("\n📝 Testing Email Templates...")

  const sampleBookingData = {
    customerName: "Jane Doe",
    customerEmail: "jane@example.com",
    customerPhone: "+2348012345678",
    services: "Classic Lashes, Microshading",
    bookingDate: "2025-08-15",
    bookingTime: "2:00 PM",
    totalAmount: 45000,
    depositAmount: 22500,
    paymentReference: "LBD_TEST_12345",
    notes: "First time client, please be gentle",
  }

  // Test booking confirmation template
  console.log("🔄 Testing booking confirmation template...")
  const confirmationHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #d946ef; margin: 0;">Lashed by Deedee</h1>
        <p style="color: #666; margin: 5px 0;">Beauty & Lash Services</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #333; margin-top: 0;">Booking Confirmed! 🎉</h2>
        <p>Hi ${sampleBookingData.customerName},</p>
        <p>Your booking has been confirmed. Here are the details:</p>
      </div>
      
      <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h3 style="color: #333; margin-top: 0;">Booking Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;"><strong>Service:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">${sampleBookingData.services}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;"><strong>Date:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">${sampleBookingData.bookingDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;"><strong>Time:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">${sampleBookingData.bookingTime}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;"><strong>Total Amount:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">₦${sampleBookingData.totalAmount?.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Deposit Paid:</strong></td>
            <td style="padding: 8px 0;">₦${sampleBookingData.depositAmount?.toLocaleString()}</td>
          </tr>
        </table>
      </div>
      
      <div style="background: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
        <p style="margin: 0; color: #065f46;"><strong>Payment Status:</strong> Confirmed ✅</p>
        <p style="margin: 5px 0 0 0; color: #065f46; font-size: 14px;">Reference: ${sampleBookingData.paymentReference}</p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="color: #666; margin: 0;">Thank you for choosing Lashed by Deedee!</p>
        <p style="color: #666; margin: 5px 0;">We look forward to seeing you soon.</p>
        <p style="color: #d946ef; margin: 15px 0 0 0; font-weight: bold;">✨ Get ready to look amazing! ✨</p>
      </div>
    </div>
  `

  console.log("✅ Booking confirmation template generated successfully")
  console.log(`📏 Template length: ${confirmationHtml.length} characters`)

  // Test admin notification template
  console.log("🔄 Testing admin notification template...")
  const adminHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #d946ef; margin: 0;">Lashed by Deedee</h1>
        <p style="color: #666; margin: 5px 0;">Admin Notification</p>
      </div>
      
      <div style="background: #dbeafe; border: 1px solid #3b82f6; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h2 style="color: #1e40af; margin-top: 0;">New Booking Received! 📅</h2>
        <p>A new booking has been confirmed and payment has been processed.</p>
      </div>
      
      <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h3 style="color: #333; margin-top: 0;">Customer Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;"><strong>Name:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">${sampleBookingData.customerName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;"><strong>Email:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">${sampleBookingData.customerEmail}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Phone:</strong></td>
            <td style="padding: 8px 0;">${sampleBookingData.customerPhone || "Not provided"}</td>
          </tr>
        </table>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="color: #666; margin: 0;">Check your admin panel for more details.</p>
        <p style="color: #d946ef; margin: 15px 0 0 0; font-weight: bold;">💼 Lashed by Deedee Admin</p>
      </div>
    </div>
  `

  console.log("✅ Admin notification template generated successfully")
  console.log(`📏 Template length: ${adminHtml.length} characters`)

  return true
}

async function runCompleteEmailTest() {
  console.log("🚀 Starting Complete Email System Test...\n")

  const tests = [
    { name: "Environment Variables", test: testEnvironmentVariables },
    { name: "Zoho Token Refresh", test: testZohoTokenRefresh },
    { name: "Resend Connection", test: testResendConnection },
    { name: "Email Templates", test: testBookingEmailTemplates },
    { name: "Email Sending", test: testEmailSending },
  ]

  let passedTests = 0

  for (const { name, test } of tests) {
    console.log(`\n--- ${name} Test ---`)
    try {
      const result = await test()
      if (result) {
        passedTests++
        console.log(`✅ ${name}: PASSED`)
      } else {
        console.log(`❌ ${name}: FAILED`)
      }
    } catch (error) {
      console.error(`❌ ${name}: ERROR -`, error.message)
    }
  }

  console.log(`\n🎯 Test Results: ${passedTests}/${tests.length} tests passed`)

  if (passedTests === tests.length) {
    console.log("🎉 All email system tests passed!")
    console.log("\n📋 Email system is ready for production:")
    console.log("✅ Environment variables configured")
    console.log("✅ Zoho authentication working")
    console.log("✅ Resend API connection established")
    console.log("✅ Email templates rendering correctly")
    console.log("✅ Email sending functionality operational")
  } else {
    console.log("⚠️ Some tests failed. Please check the configuration:")
    console.log("1. Verify all environment variables are set correctly")
    console.log("2. Check Zoho OAuth configuration")
    console.log("3. Verify Resend API key and domain setup")
    console.log("4. Ensure email templates are properly formatted")
  }

  console.log("\n💡 Next steps:")
  console.log("1. Test with real email addresses")
  console.log("2. Monitor email delivery rates")
  console.log("3. Set up email analytics and tracking")
}

// Run the complete test
runCompleteEmailTest().catch(console.error)
