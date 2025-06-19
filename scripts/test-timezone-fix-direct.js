// Direct test with your actual credentials - no environment variables needed
const { createClient } = require("@supabase/supabase-js")

// Your actual Supabase credentials
const SUPABASE_URL = "https://cqnfxvgdamevrvlniryr.supabase.co"
const SUPABASE_SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbmZ4dmdkYW1ldnJ2bG5pcnlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTMyNzEwMSwiZXhwIjoyMDY0OTAzMTAxfQ.T0TUi8QEh-d7L-P4lCqHoX7l7rVS99SNaoTomqInJyI"

console.log("🧪 TESTING TIMEZONE FIX WITH DIRECT CREDENTIALS")
console.log("===============================================")

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// UTC-safe date formatting function (same as in the fixed code)
const formatDateForDatabase = (dateInput) => {
  try {
    if (typeof dateInput === "string") {
      // If already in YYYY-MM-DD format, return as-is
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
        return dateInput
      }

      // If it's an ISO string, extract just the date part
      if (dateInput.includes("T")) {
        return dateInput.split("T")[0]
      }

      // Parse date components manually to avoid timezone conversion
      const parts = dateInput.split("-")
      if (parts.length === 3) {
        const year = parts[0].padStart(4, "0")
        const month = parts[1].padStart(2, "0")
        const day = parts[2].padStart(2, "0")
        return `${year}-${month}-${day}`
      }
    }

    if (dateInput instanceof Date) {
      // CRITICAL: Use UTC methods to prevent timezone conversion
      const year = dateInput.getUTCFullYear()
      const month = String(dateInput.getUTCMonth() + 1).padStart(2, "0")
      const day = String(dateInput.getUTCDate()).padStart(2, "0")
      return `${year}-${month}-${day}`
    }

    return String(dateInput)
  } catch (error) {
    console.error("Error formatting date for database:", dateInput, error)
    return String(dateInput)
  }
}

async function testTimezoneFix() {
  try {
    console.log("🔌 Testing database connection...")

    // Test connection
    const { data: testData, error: testError } = await supabase
      .from("blocked_dates")
      .select("count(*)", { count: "exact", head: true })

    if (testError) {
      console.log("❌ Database connection failed:", testError.message)
      return
    }

    console.log("✅ Database connection successful!")

    // Clean up any existing test data
    console.log("\n🧹 Cleaning up existing test data...")
    await supabase.from("blocked_dates").delete().eq("reason", "Timezone fix test")

    // Test the exact scenario: Admin clicks July 12th in calendar
    console.log("\n📅 TESTING ADMIN CALENDAR SCENARIO")
    console.log("==================================")

    // This simulates what happens when admin clicks July 12th in React Calendar
    const adminClickDate = new Date(2025, 6, 12) // July 12, 2025 (month is 0-indexed)
    console.log("1. Admin clicks July 12th in calendar")
    console.log("   React Calendar creates Date object:", adminClickDate.toString())
    console.log("   Your timezone offset:", adminClickDate.getTimezoneOffset(), "minutes")

    // OLD way (causes the bug)
    const oldWay = adminClickDate.toISOString().split("T")[0]
    console.log("2. OLD formatDate result:", oldWay, "(❌ This causes the bug)")

    // NEW way (fixes the bug)
    const newWay = formatDateForDatabase(adminClickDate)
    console.log("3. NEW formatDate result:", newWay, "(✅ This fixes the bug)")

    console.log("4. Results match:", oldWay === newWay ? "✅ YES" : "❌ NO - This is the bug!")

    // Test blocking the date with the NEW method
    console.log("\n🚫 BLOCKING DATE WITH NEW METHOD")
    const { data: blockData, error: blockError } = await supabase
      .from("blocked_dates")
      .insert([{ blocked_date: newWay, reason: "Timezone fix test" }])
      .select()
      .single()

    if (blockError) {
      console.log("❌ Failed to block date:", blockError.message)
      return
    }

    console.log("✅ Date blocked successfully:", blockData)

    // Test reading it back (simulates booking page API call)
    console.log("\n📖 TESTING BOOKING PAGE SCENARIO")
    console.log("=================================")

    const { data: apiData, error: apiError } = await supabase.from("blocked_dates").select("*").order("blocked_date")

    if (apiError) {
      console.log("❌ Failed to read blocked dates:", apiError.message)
      return
    }

    console.log("✅ API returned blocked dates:")
    apiData.forEach((date, index) => {
      console.log(`   ${index + 1}. ${date.blocked_date} (${date.reason})`)
    })

    // Test booking page date comparison
    const bookingPageDate = "2025-07-12" // This comes from HTML date input
    const isBlocked = apiData.some((d) => d.blocked_date === bookingPageDate)

    console.log("\n🎯 FINAL VERIFICATION")
    console.log("=====================")
    console.log("Booking page selected date:", bookingPageDate)
    console.log("Is date blocked in database:", isBlocked ? "✅ YES" : "❌ NO")
    console.log("Expected result: ✅ YES (July 12th should be blocked)")

    if (isBlocked) {
      console.log("\n🎉 SUCCESS! The timezone fix is working correctly!")
      console.log("✅ July 12th blocked in admin → July 12th blocked in booking page")
    } else {
      console.log("\n❌ ISSUE STILL EXISTS!")
      console.log("The date is not being blocked correctly")
    }

    // Clean up
    console.log("\n🧹 Cleaning up test data...")
    await supabase.from("blocked_dates").delete().eq("reason", "Timezone fix test")

    console.log("\n📋 SUMMARY")
    console.log("==========")
    if (oldWay !== newWay) {
      console.log("❌ OLD method would cause date shifting:", oldWay, "≠", newWay)
      console.log("✅ NEW method prevents date shifting")
      console.log("🔧 The fix should resolve your issue!")
    } else {
      console.log("ℹ️  In your timezone, both methods give the same result")
      console.log("🤔 The issue might be elsewhere - check browser timezone settings")
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message)
  }
}

testTimezoneFix()
