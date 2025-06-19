import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://cqnfxvgdamevrvlniryr.supabase.co"
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbmZ4dmdkYW1ldnJ2bG5pcnlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTMyNzEwMSwiZXhwIjoyMDY0OTAzMTAxfQ.T0TUi8QEh-d7L-P4lCqHoX7l7rVS99SNaoTomqInJyI"

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkCurrentData() {
  console.log("🔍 CHECKING CURRENT DATABASE DATA")
  console.log("=================================")

  try {
    // Check what's currently in blocked_dates
    console.log("📊 Checking blocked_dates table...")
    const { data: blockedDates, error: error1 } = await supabase.from("blocked_dates").select("*").limit(5)

    if (error1) {
      console.log("❌ Could not query blocked_dates:", error1.message)
    } else {
      console.log("📋 Current blocked_dates data:")
      if (blockedDates && blockedDates.length > 0) {
        blockedDates.forEach((row, index) => {
          console.log(`  ${index + 1}. blocked_date: "${row.blocked_date}" (type: ${typeof row.blocked_date})`)

          // Check if it's a timestamp
          if (typeof row.blocked_date === "string" && row.blocked_date.includes("T")) {
            console.log("     🚨 PROBLEM: This is a timestamp, not a date!")
          } else {
            console.log("     ✅ GOOD: This looks like a date")
          }
        })
      } else {
        console.log("  📭 No data found")
      }
    }

    // Check blocked_time_slots
    console.log("\n📊 Checking blocked_time_slots table...")
    const { data: blockedSlots, error: error2 } = await supabase.from("blocked_time_slots").select("*").limit(5)

    if (error2) {
      console.log("❌ Could not query blocked_time_slots:", error2.message)
    } else {
      console.log("📋 Current blocked_time_slots data:")
      if (blockedSlots && blockedSlots.length > 0) {
        blockedSlots.forEach((row, index) => {
          console.log(`  ${index + 1}. blocked_date: "${row.blocked_date}" (type: ${typeof row.blocked_date})`)

          if (typeof row.blocked_date === "string" && row.blocked_date.includes("T")) {
            console.log("     🚨 PROBLEM: This is a timestamp, not a date!")
          } else {
            console.log("     ✅ GOOD: This looks like a date")
          }
        })
      } else {
        console.log("  📭 No data found")
      }
    }

    // Test inserting a simple date
    console.log("\n🧪 Testing date insertion...")
    const testDate = "2025-07-12"

    // Clean up first
    await supabase.from("blocked_dates").delete().eq("reason", "Test insertion")

    const { data: insertResult, error: insertError } = await supabase
      .from("blocked_dates")
      .insert({
        blocked_date: testDate,
        reason: "Test insertion",
      })
      .select()

    if (insertError) {
      console.log("❌ Insert test failed:", insertError.message)
    } else {
      console.log("✅ Insert test successful:")
      console.log("   Input:  ", testDate)
      console.log("   Output: ", insertResult[0]?.blocked_date)
      console.log("   Type:   ", typeof insertResult[0]?.blocked_date)

      if (insertResult[0]?.blocked_date === testDate) {
        console.log("   🎯 PERFECT MATCH!")
      } else {
        console.log("   🚨 MISMATCH - this confirms the timezone issue!")
      }
    }

    // Clean up test data
    await supabase.from("blocked_dates").delete().eq("reason", "Test insertion")
  } catch (error) {
    console.log("❌ Check failed:", error.message)
  }
}

checkCurrentData()
