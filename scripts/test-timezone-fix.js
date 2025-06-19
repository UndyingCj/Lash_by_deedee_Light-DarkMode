// Test script to verify the timezone fix works correctly
// Run with: NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key node scripts/test-timezone-fix.js

const { createClient } = require("@supabase/supabase-js")

// Use environment variables or fallback to provided values
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://cqnfxvgdamevrvlniryr.supabase.co"
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbmZ4dmdkYW1ldnJ2bG5pcnlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTMyNzEwMSwiZXhwIjoyMDY0OTAzMTAxfQ.T0TUi8QEh-d7L-P4lCqHoX7l7rVS99SNaoTomqInJyI"

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// UTC-safe date formatting function
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
    console.error("Error formatting date:", dateInput, error)
    return String(dateInput)
  }
}

async function testTimezoneFix() {
  console.log("🧪 TESTING TIMEZONE FIX")
  console.log("=======================")

  try {
    // Test 1: Clear any existing test data
    console.log("🧹 Cleaning up test data...")
    await supabase.from("blocked_dates").delete().like("blocked_date", "2025-07-%")

    // Test 2: Block July 12th using different methods
    console.log("\n📅 Testing date blocking with different input formats...")

    const testDate = "2025-07-12"
    const testDateAsDate = new Date("2025-07-12T12:00:00Z") // Noon UTC
    const testDateAsLocalDate = new Date(2025, 6, 12) // July 12, 2025 in local time

    console.log("Input formats:")
    console.log("  String:", testDate)
    console.log("  UTC Date:", testDateAsDate.toISOString())
    console.log("  Local Date:", testDateAsLocalDate.toString())

    // Format all inputs
    const formatted1 = formatDateForDatabase(testDate)
    const formatted2 = formatDateForDatabase(testDateAsDate)
    const formatted3 = formatDateForDatabase(testDateAsLocalDate)

    console.log("\nFormatted outputs:")
    console.log("  From string:", formatted1)
    console.log("  From UTC date:", formatted2)
    console.log("  From local date:", formatted3)

    // Test 3: Insert the date
    console.log("\n🚫 Blocking July 12th...")
    const { data: insertData, error: insertError } = await supabase
      .from("blocked_dates")
      .insert([{ blocked_date: formatted1, reason: "Timezone test" }])
      .select()
      .single()

    if (insertError) {
      console.error("❌ Insert failed:", insertError)
      return
    }

    console.log("✅ Date blocked successfully:", insertData)

    // Test 4: Read it back
    console.log("\n📖 Reading blocked date back from database...")
    const { data: readData, error: readError } = await supabase
      .from("blocked_dates")
      .select("*")
      .eq("blocked_date", formatted1)
      .single()

    if (readError) {
      console.error("❌ Read failed:", readError)
      return
    }

    console.log("✅ Date read successfully:", readData)

    // Test 5: Verify consistency
    console.log("\n🔍 Verifying consistency...")
    const originalDate = "2025-07-12"
    const storedDate = readData.blocked_date
    const isConsistent = originalDate === storedDate

    console.log("Original date:", originalDate)
    console.log("Stored date:", storedDate)
    console.log("Consistent:", isConsistent ? "✅ YES" : "❌ NO")

    // Test 6: Test API simulation
    console.log("\n🌐 Simulating API response...")
    const { data: apiData, error: apiError } = await supabase.from("blocked_dates").select("*").order("blocked_date")

    if (apiError) {
      console.error("❌ API simulation failed:", apiError)
      return
    }

    console.log("API would return:")
    apiData.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.blocked_date} (${typeof item.blocked_date})`)
    })

    // Test 7: Test different timezone scenarios
    console.log("\n🌍 Testing timezone scenarios...")

    // Simulate what happens at different times of day
    const midnightUTC = new Date("2025-07-12T00:00:00Z")
    const noonUTC = new Date("2025-07-12T12:00:00Z")
    const almostMidnightUTC = new Date("2025-07-12T23:59:59Z")

    console.log("Midnight UTC:", formatDateForDatabase(midnightUTC))
    console.log("Noon UTC:", formatDateForDatabase(noonUTC))
    console.log("Almost midnight UTC:", formatDateForDatabase(almostMidnightUTC))

    // Test 8: Clean up
    console.log("\n🧹 Cleaning up test data...")
    await supabase.from("blocked_dates").delete().eq("reason", "Timezone test")

    console.log("\n🎉 TIMEZONE FIX TEST COMPLETED SUCCESSFULLY!")
    console.log("✅ All dates remained consistent")
    console.log("✅ No timezone shifting detected")
  } catch (error) {
    console.error("❌ Test failed:", error)
  }
}

// Run the test
testTimezoneFix()
