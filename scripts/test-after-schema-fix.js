import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://cqnfxvgdamevrvlniryr.supabase.co"
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbmZ4dmdkYW1ldnJ2bG5pcnlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTMyNzEwMSwiZXhwIjoyMDY0OTAzMTAxfQ.T0TUi8QEh-d7L-P4lCqHoX7l7rVS99SNaoTomqInJyI"

const supabase = createClient(supabaseUrl, supabaseKey)

async function testAfterFix() {
  console.log("🧪 TESTING AFTER SCHEMA FIX")
  console.log("===========================")

  const testDate = "2025-07-12"

  try {
    // Clean up any existing test data
    await supabase.from("blocked_dates").delete().eq("blocked_date", testDate)

    // Test 1: Insert a date
    console.log("📝 Inserting test date:", testDate)
    const { data: insertData, error: insertError } = await supabase
      .from("blocked_dates")
      .insert({
        blocked_date: testDate,
        reason: "Schema fix test",
      })
      .select()

    if (insertError) {
      console.log("❌ Insert failed:", insertError.message)
      return
    }

    console.log("✅ Insert successful:", insertData)

    // Test 2: Read it back
    console.log("📖 Reading back the data...")
    const { data: readData, error: readError } = await supabase
      .from("blocked_dates")
      .select("*")
      .eq("blocked_date", testDate)

    if (readError) {
      console.log("❌ Read failed:", readError.message)
      return
    }

    console.log("📊 Read data:", readData)

    // Test 3: Verify consistency
    if (readData && readData.length > 0) {
      const storedDate = readData[0].blocked_date
      console.log("\n🎯 CONSISTENCY TEST:")
      console.log("Original:", testDate)
      console.log("Stored:  ", storedDate)
      console.log("Type:    ", typeof storedDate)

      if (storedDate === testDate) {
        console.log("✅ SUCCESS: Perfect match!")
      } else {
        console.log("❌ Still have issues:", storedDate, "≠", testDate)
      }

      // Check if it's still a timestamp
      if (typeof storedDate === "string" && storedDate.includes("T")) {
        console.log("🚨 WARNING: Still getting timestamp format")
      } else {
        console.log("✅ GOOD: Getting date-only format")
      }
    }

    // Clean up
    await supabase.from("blocked_dates").delete().eq("blocked_date", testDate)
    console.log("🧹 Cleanup complete")
  } catch (error) {
    console.log("❌ Test failed:", error.message)
  }
}

testAfterFix()
