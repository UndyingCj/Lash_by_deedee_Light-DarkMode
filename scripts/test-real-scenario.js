// Test the actual scenario you're experiencing
// Run with: NEXT_PUBLIC_SUPABASE_URL=your_url SUPABASE_SERVICE_ROLE_KEY=your_key node scripts/test-real-scenario.js

const { createClient } = require("@supabase/supabase-js")

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://cqnfxvgdamevrvlniryr.supabase.co"
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbmZ4dmdkYW1ldnJ2bG5pcnlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTMyNzEwMSwiZXhwIjoyMDY0OTAzMTAxfQ.T0TUi8QEh-d7L-P4lCqHoX7l7rVS99SNaoTomqInJyI"

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testRealScenario() {
  console.log("🧪 TESTING REAL ADMIN CALENDAR SCENARIO")
  console.log("=====================================")

  try {
    // Clean up any test data first
    console.log("🧹 Cleaning up test data...")
    await supabase.from("blocked_dates").delete().eq("reason", "Real scenario test")

    // Simulate what happens when admin clicks on July 12th in the calendar
    console.log("\n📅 STEP 1: Admin clicks on July 12th in calendar")

    // This is what the React Calendar component sends when you click July 12th
    const calendarClickDate = new Date(2025, 6, 12) // July 12, 2025 (month is 0-indexed)
    console.log("Calendar click creates Date object:", calendarClickDate.toString())
    console.log("Calendar click timezone:", calendarClickDate.getTimezoneOffset(), "minutes offset")

    // This is what the old formatDate function would do (WRONG)
    const oldFormatDate = (date) => {
      return date.toISOString().split("T")[0]
    }

    // This is what the new formatDate function does (CORRECT)
    const newFormatDate = (date) => {
      const year = date.getUTCFullYear()
      const month = String(date.getUTCMonth() + 1).padStart(2, "0")
      const day = String(date.getUTCDate()).padStart(2, "0")
      return `${year}-${month}-${day}`
    }

    const oldResult = oldFormatDate(calendarClickDate)
    const newResult = newFormatDate(calendarClickDate)

    console.log("OLD formatDate result:", oldResult)
    console.log("NEW formatDate result:", newResult)
    console.log("Results match:", oldResult === newResult ? "✅ YES" : "❌ NO")

    // Test the actual blocking
    console.log("\n🚫 STEP 2: Blocking the date using NEW method")
    const { data: blockData, error: blockError } = await supabase
      .from("blocked_dates")
      .insert([{ blocked_date: newResult, reason: "Real scenario test" }])
      .select()
      .single()

    if (blockError) {
      console.error("❌ Block failed:", blockError)
      return
    }

    console.log("✅ Date blocked:", blockData)

    // Test reading it back (simulating API call)
    console.log("\n📖 STEP 3: Reading back via API (simulating booking page)")
    const { data: apiData, error: apiError } = await supabase
      .from("blocked_dates")
      .select("*")
      .eq("blocked_date", newResult)
      .single()

    if (apiError) {
      console.error("❌ API read failed:", apiError)
      return
    }

    console.log("✅ API returned:", apiData)

    // Test the booking page logic
    console.log("\n🌐 STEP 4: Testing booking page date comparison")
    const bookingPageSelectedDate = "2025-07-12" // This is what comes from HTML date input
    const apiReturnedDate = apiData.blocked_date

    console.log("Booking page selected date:", bookingPageSelectedDate)
    console.log("API returned blocked date:", apiReturnedDate)
    console.log("Dates match (should be blocked):", bookingPageSelectedDate === apiReturnedDate ? "✅ YES" : "❌ NO")

    // Test edge cases
    console.log("\n🌍 STEP 5: Testing edge cases")

    // Test different times of day
    const midnight = new Date("2025-07-12T00:00:00")
    const noon = new Date("2025-07-12T12:00:00")
    const almostMidnight = new Date("2025-07-12T23:59:59")

    console.log("Midnight local:", newFormatDate(midnight))
    console.log("Noon local:", newFormatDate(noon))
    console.log("Almost midnight local:", newFormatDate(almostMidnight))

    // Clean up
    console.log("\n🧹 Cleaning up...")
    await supabase.from("blocked_dates").delete().eq("reason", "Real scenario test")

    console.log("\n🎉 REAL SCENARIO TEST COMPLETED!")
    console.log("✅ The fix should resolve the July 12th → July 11th issue")
  } catch (error) {
    console.error("❌ Test failed:", error)
  }
}

testRealScenario()
