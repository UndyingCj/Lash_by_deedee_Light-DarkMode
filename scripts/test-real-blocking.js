import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://cqnfxvgdamevrvlniryr.supabase.co"
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbmZ4dmdkYW1ldnJ2bG5pcnlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTMyNzEwMSwiZXhwIjoyMDY0OTAzMTAxfQ.T0TUi8QEh-d7L-P4lCqHoX7l7rVS99SNaoTomqInJyI"

const supabase = createClient(supabaseUrl, supabaseKey)

async function testRealBlocking() {
  console.log("🧪 TESTING REAL BLOCKING SCENARIO")
  console.log("=================================")

  const testDate = "2025-07-12"

  try {
    // 1. Clear any existing test data
    console.log("🧹 Cleaning up existing test data...")
    await supabase.from("blocked_dates").delete().eq("blocked_date", testDate)

    // 2. Block the date (simulate admin clicking)
    console.log("🚫 Blocking date:", testDate)
    const { data: insertData, error: insertError } = await supabase
      .from("blocked_dates")
      .insert({
        blocked_date: testDate,
        reason: "Test blocking - timezone fix",
      })
      .select()

    if (insertError) {
      console.log("❌ Failed to block date:", insertError.message)
      return
    }

    console.log("✅ Date blocked successfully:", insertData)

    // 3. Read it back (simulate booking page loading)
    console.log("📖 Reading blocked dates (like booking page does)...")
    const { data: readData, error: readError } = await supabase
      .from("blocked_dates")
      .select("*")
      .eq("blocked_date", testDate)

    if (readError) {
      console.log("❌ Failed to read blocked dates:", readError.message)
      return
    }

    console.log("📊 Read back from database:", readData)

    // 4. Verify consistency
    if (readData && readData.length > 0) {
      const storedDate = readData[0].blocked_date
      console.log("\n🎯 CONSISTENCY CHECK:")
      console.log("Original date:", testDate)
      console.log("Stored date:  ", storedDate)

      if (storedDate === testDate) {
        console.log("✅ SUCCESS: Dates match perfectly!")
      } else {
        console.log("❌ PROBLEM: Date mismatch detected!")
      }
    }

    // 5. Clean up
    console.log("\n🧹 Cleaning up test data...")
    await supabase.from("blocked_dates").delete().eq("blocked_date", testDate)
    console.log("✅ Cleanup complete")
  } catch (error) {
    console.log("❌ Test failed:", error.message)
  }
}

testRealBlocking()
