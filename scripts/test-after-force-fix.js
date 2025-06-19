import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://cqnfxvgdamevrvlniryr.supabase.co"
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbmZ4dmdkYW1ldnJ2bG5pcnlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTMyNzEwMSwiZXhwIjoyMDY0OTAzMTAxfQ.T0TUi8QEh-d7L-P4lCqHoX7l7rVS99SNaoTomqInJyI"

const supabase = createClient(supabaseUrl, supabaseKey)

async function testAfterForceFix() {
  console.log("🧪 TESTING AFTER FORCE SCHEMA FIX")
  console.log("=================================")

  try {
    // Test 1: Insert July 12th
    console.log("📅 Test 1: Inserting July 12th, 2025...")

    // Clean up first
    await supabase.from("blocked_dates").delete().eq("reason", "Force fix test")

    const testDate = "2025-07-12"
    const { data: insertData, error: insertError } = await supabase
      .from("blocked_dates")
      .insert({
        blocked_date: testDate,
        reason: "Force fix test",
      })
      .select()

    if (insertError) {
      console.log("❌ Insert failed:", insertError.message)
      return
    }

    console.log("✅ Insert successful!")
    console.log("   Input:  ", testDate)
    console.log("   Output: ", insertData[0].blocked_date)
    console.log("   Match:  ", insertData[0].blocked_date === testDate ? "✅ PERFECT" : "❌ MISMATCH")

    // Test 2: Fetch via API
    console.log("\n🌐 Test 2: Fetching via API...")
    const response = await fetch("http://localhost:3000/api/admin/availability")

    if (response.ok) {
      const apiData = await response.json()
      console.log("✅ API fetch successful!")

      const foundDate = apiData.blockedDates?.find((d) => d.reason === "Force fix test")
      if (foundDate) {
        console.log("   API returned: ", foundDate.blocked_date)
        console.log("   Match:        ", foundDate.blocked_date === testDate ? "✅ PERFECT" : "❌ MISMATCH")
      } else {
        console.log("❌ Test date not found in API response")
      }
    } else {
      console.log("❌ API fetch failed:", response.status)
    }

    // Test 3: Time slot test
    console.log("\n⏰ Test 3: Testing time slot...")
    const { data: slotData, error: slotError } = await supabase
      .from("blocked_time_slots")
      .insert({
        blocked_date: testDate,
        blocked_time: "2:00 PM",
        reason: "Force fix test",
      })
      .select()

    if (slotError) {
      console.log("❌ Time slot insert failed:", slotError.message)
    } else {
      console.log("✅ Time slot insert successful!")
      console.log("   Date: ", slotData[0].blocked_date)
      console.log("   Time: ", slotData[0].blocked_time)
      console.log("   Match:", slotData[0].blocked_date === testDate ? "✅ PERFECT" : "❌ MISMATCH")
    }

    // Clean up
    console.log("\n🧹 Cleaning up test data...")
    await supabase.from("blocked_dates").delete().eq("reason", "Force fix test")
    await supabase.from("blocked_time_slots").delete().eq("reason", "Force fix test")
    console.log("✅ Cleanup complete!")

    console.log("\n🎉 SCHEMA FIX TEST COMPLETE!")
    console.log("If all tests show ✅ PERFECT matches, the issue is resolved!")
  } catch (error) {
    console.log("❌ Test failed:", error.message)
  }
}

testAfterForceFix()
