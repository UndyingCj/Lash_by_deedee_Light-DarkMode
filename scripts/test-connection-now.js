import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://cqnfxvgdamevrvlniryr.supabase.co"
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbmZ4dmdkYW1ldnJ2bG5pcnlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTMyNzEwMSwiZXhwIjoyMDY0OTAzMTAxfQ.T0TUi8QEh-d7L-P4lCqHoX7l7rVS99SNaoTomqInJyI"

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  console.log("🧪 TESTING SUPABASE CONNECTION")
  console.log("===============================")

  try {
    // Test basic connection
    console.log("🔌 Testing database connection...")
    const { data, error } = await supabase.from("blocked_dates").select("*").limit(5)

    if (error) {
      console.log("❌ Connection failed:", error.message)
      return
    }

    console.log("✅ Connection successful!")
    console.log("📊 Current blocked dates:", data)

    // Test the timezone issue specifically
    console.log("\n🕐 TESTING TIMEZONE ISSUE")
    console.log("=========================")

    // Simulate what happens when admin clicks July 12th
    const testDate = "2025-07-12"
    console.log("📅 Admin clicks date:", testDate)

    // This is what the OLD code would do (causing the bug)
    const oldWay = new Date(testDate).toISOString().split("T")[0]
    console.log("❌ Old way (buggy):", oldWay)

    // This is what the NEW code does (fixed)
    const newWay = testDate // Just use the string directly
    console.log("✅ New way (fixed):", newWay)

    console.log("\n🎯 RESULT:")
    if (oldWay !== newWay) {
      console.log("🐛 BUG CONFIRMED: Old way changes", testDate, "to", oldWay)
      console.log("🔧 FIX APPLIED: New way keeps", testDate, "as", newWay)
    } else {
      console.log("✅ No timezone issue detected")
    }
  } catch (error) {
    console.log("❌ Test failed:", error.message)
  }
}

testConnection()
