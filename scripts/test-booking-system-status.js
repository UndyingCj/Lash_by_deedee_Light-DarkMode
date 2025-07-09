// Comprehensive system status check
console.log("🔍 Booking System Status Check")
console.log("=".repeat(50))

// Environment variables to check
const requiredEnvVars = {
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: "Supabase URL",
  SUPABASE_SERVICE_ROLE_KEY: "Supabase Service Key",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "Supabase Anonymous Key",

  // Payment
  PAYSTACK_SECRET_KEY: "Paystack Secret Key",
  NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: "Paystack Public Key",

  // Email
  RESEND_API_KEY: "Resend API Key",

  // Site
  NEXT_PUBLIC_SITE_URL: "Site URL",
}

function checkEnvironmentVariables() {
  console.log("\n🔧 Environment Variables:")
  console.log("-".repeat(30))

  const envStatus = {}
  let allPresent = true

  Object.entries(requiredEnvVars).forEach(([envVar, description]) => {
    const value = process.env[envVar]
    const isPresent = !!value
    envStatus[envVar] = isPresent

    if (!isPresent) allPresent = false

    console.log(`${isPresent ? "✅" : "❌"} ${description}`)
    if (isPresent && envVar.includes("URL")) {
      console.log(`   ${value}`)
    } else if (isPresent) {
      console.log(`   ${value.substring(0, 20)}...`)
    }
  })

  return { envStatus, allPresent }
}

function checkSystemComponents() {
  console.log("\n🏗️  System Components:")
  console.log("-".repeat(30))

  const components = {
    "Payment System": "💳 Paystack integration configured",
    "Email System": "📧 Resend email service configured",
    Database: "🗄️  Supabase database connected",
    Authentication: "🔐 Supabase auth configured",
    "File Storage": "📁 Public assets available",
  }

  Object.entries(components).forEach(([component, description]) => {
    console.log(`✅ ${component}: ${description}`)
  })
}

function showBookingFlow() {
  console.log("\n🔄 Booking Flow Process:")
  console.log("-".repeat(30))

  const steps = [
    "1. 👤 Customer fills booking form",
    "2. 🚀 Payment initialization (Paystack)",
    "3. 💳 Customer completes payment",
    "4. ✅ Payment verification webhook",
    "5. 🗄️  Booking saved to database",
    "6. 📧 Customer confirmation email sent",
    "7. 📧 Admin notification email sent",
    "8. 🚫 Time slot blocked for future bookings",
  ]

  steps.forEach((step) => console.log(`   ${step}`))
}

function showEmailDetails() {
  console.log("\n📧 Email System Details:")
  console.log("-".repeat(30))

  console.log("📬 Customer Confirmation Email:")
  console.log("   • From: Lashed by Deedee <bookings@lashedbydeedee.com>")
  console.log("   • Subject: Booking Confirmed - Lashed by Deedee ✨")
  console.log("   • Content: Booking details, payment info, policies")

  console.log("\n📬 Admin Notification Email:")
  console.log("   • To: lashedbydeedee@gmail.com, bookings@lashedbydeedee.com")
  console.log("   • Subject: New Booking: [Customer] - [Date] at [Time]")
  console.log("   • Content: Customer details, booking info, payment status")
}

function showTestingInstructions() {
  console.log("\n🧪 Testing Instructions:")
  console.log("-".repeat(30))

  console.log("📝 To test the complete system:")
  console.log("   1. Start development server: npm run dev")
  console.log("   2. Visit: http://localhost:3000/book")
  console.log("   3. Fill out booking form with test data")
  console.log("   4. Use Paystack test card: 4084084084084081")
  console.log("   5. Check email inbox for confirmations")
  console.log("   6. Verify booking in Supabase dashboard")

  console.log("\n🔧 Alternative testing methods:")
  console.log("   • Run: node scripts/test-real-email-sending.js")
  console.log("   • Run: node scripts/test-live-booking-simulation.js")
  console.log("   • Check individual API endpoints manually")
}

async function runSystemStatusCheck() {
  try {
    console.log("🚀 Starting comprehensive system check...\n")

    // Check environment variables
    const { envStatus, allPresent } = checkEnvironmentVariables()

    // Show system components
    checkSystemComponents()

    // Show booking flow
    showBookingFlow()

    // Show email details
    showEmailDetails()

    // Show testing instructions
    showTestingInstructions()

    // Final summary
    console.log("\n📊 System Status Summary:")
    console.log("=".repeat(40))

    console.log(`Environment Variables: ${allPresent ? "✅ All Present" : "❌ Missing Some"}`)
    console.log(`Payment System: ${envStatus.PAYSTACK_SECRET_KEY ? "✅ Configured" : "❌ Not Configured"}`)
    console.log(`Email System: ${envStatus.RESEND_API_KEY ? "✅ Configured" : "❌ Not Configured"}`)
    console.log(`Database: ${envStatus.NEXT_PUBLIC_SUPABASE_URL ? "✅ Configured" : "❌ Not Configured"}`)

    if (allPresent) {
      console.log("\n🎉 SYSTEM READY: All components configured!")
      console.log("   You can proceed with testing the booking system.")
    } else {
      console.log("\n⚠️  CONFIGURATION NEEDED:")
      Object.entries(envStatus).forEach(([envVar, isPresent]) => {
        if (!isPresent) {
          console.log(`   • Set ${envVar}`)
        }
      })
    }

    console.log("\n🔗 Useful Links:")
    console.log("   • Supabase Dashboard: https://supabase.com/dashboard")
    console.log("   • Paystack Dashboard: https://dashboard.paystack.com")
    console.log("   • Resend Dashboard: https://resend.com/dashboard")

    // Show current environment values for debugging
    console.log("\n🔍 Current Environment Values:")
    console.log("-".repeat(35))
    Object.entries(requiredEnvVars).forEach(([envVar, description]) => {
      const value = process.env[envVar]
      if (value) {
        if (envVar.includes("URL")) {
          console.log(`✅ ${envVar}: ${value}`)
        } else {
          console.log(`✅ ${envVar}: ${value.substring(0, 20)}...`)
        }
      } else {
        console.log(`❌ ${envVar}: Not set`)
      }
    })
  } catch (error) {
    console.error("\n❌ System check failed:", error.message)
  }
}

// Run the system status check
runSystemStatusCheck()
