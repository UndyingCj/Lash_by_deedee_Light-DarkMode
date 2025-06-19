import { createClient } from "@supabase/supabase-js"

// Your actual credentials
const supabaseUrl = "https://cqnfxvgdamevrvlniryr.supabase.co"
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbmZ4dmdkYW1ldnJ2bG5pcnlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTMyNzEwMSwiZXhwIjoyMDY0OTAzMTAxfQ.T0TUi8QEh-d7L-P4lCqHoX7l7rVS99SNaoTomqInJyI"

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testWithExistingData() {
  console.log("🎯 TESTING WITH EXISTING DATA")
  console.log("=============================")

  try {
    // Test 1: Check what's currently blocked
    console.log("📋 Current blocked dates:")
    const { data: currentDates, error: fetchError } = await supabase
      .from("blocked_dates")
      .select("*")
      .order("blocked_date")

    if (fetchError) {
      console.log("❌ Fetch failed:", fetchError.message)
      return
    }

    console.log(`✅ Found ${currentDates.length} blocked dates:`)
    currentDates.forEach((date, index) => {
      console.log(`   ${index + 1}. ${date.blocked_date} (${date.reason || "No reason"})`)
    })

    // Test 2: Try a different date that's not blocked
    const testDate = "2025-08-15" // Use a future date that's unlikely to be blocked
    console.log(`\n📅 Testing with ${testDate}...`)

    // First, make sure it's not already blocked
    const existing = currentDates.find((d) => d.blocked_date === testDate)
    if (existing) {
      console.log(`⚠️ ${testDate} is already blocked, trying another date...`)
      const testDate2 = "2025-09-20"
      console.log(`📅 Trying ${testDate2} instead...`)

      const { data: insertResult, error: insertError } = await supabase
        .from("blocked_dates")
        .insert({
          blocked_date: testDate2,
          reason: "Database test - safe to delete",
        })
        .select()
        .single()

      if (insertError) {
        console.log("❌ Insert failed:", insertError.message)
      } else {
        console.log("✅ Insert successful!")
        console.log("   Input date:  ", testDate2)
        console.log("   Stored date: ", insertResult.blocked_date)
        console.log("   Exact match: ", insertResult.blocked_date === testDate2 ? "✅ PERFECT!" : "❌ MISMATCH!")

        // Clean up
        await supabase.from("blocked_dates").delete().eq("id", insertResult.id)
        console.log("✅ Test data cleaned up")
      }
    } else {
      const { data: insertResult, error: insertError } = await supabase
        .from("blocked_dates")
        .insert({
          blocked_date: testDate,
          reason: "Database test - safe to delete",
        })
        .select()
        .single()

      if (insertError) {
        console.log("❌ Insert failed:", insertError.message)
      } else {
        console.log("✅ Insert successful!")
        console.log("   Input date:  ", testDate)
        console.log("   Stored date: ", insertResult.blocked_date)
        console.log("   Exact match: ", insertResult.blocked_date === testDate ? "✅ PERFECT!" : "❌ MISMATCH!")

        // Clean up
        await supabase.from("blocked_dates").delete().eq("id", insertResult.id)
        console.log("✅ Test data cleaned up")
      }
    }

    // Test 3: Check if July 12th is the problem
    console.log("\n🔍 Analyzing July 12th specifically...")
    const july12 = currentDates.find((d) => d.blocked_date.includes("2025-07-12"))
    if (july12) {
      console.log("✅ July 12th found in database:")
      console.log("   Stored as:", july12.blocked_date)
      console.log("   Type check:", typeof july12.blocked_date)
      console.log("   Reason:", july12.reason || "No reason")

      // Check if it's exactly "2025-07-12"
      if (july12.blocked_date === "2025-07-12") {
        console.log("✅ July 12th is stored correctly as DATE!")
      } else {
        console.log("⚠️ July 12th might have timezone issues:")
        console.log("   Expected: 2025-07-12")
        console.log("   Actual:  ", july12.blocked_date)
      }
    } else {
      console.log("❌ July 12th not found in current blocked dates")
    }

    console.log("\n🎉 DATABASE TEST COMPLETE!")
    console.log("\n💡 NEXT STEPS:")
    console.log("1. Start your Next.js server: npm run dev")
    console.log("2. Open http://localhost:3000/egusi/calendar")
    console.log("3. Try clicking on July 12th to see if it toggles correctly")
  } catch (error) {
    console.log("❌ Test failed:", error.message)
  }
}

testWithExistingData()
