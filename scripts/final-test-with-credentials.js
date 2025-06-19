import { createClient } from "@supabase/supabase-js"

// Your actual credentials
const supabaseUrl = "https://cqnfxvgdamevrvlniryr.supabase.co"
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbmZ4dmdkYW1ldnJ2bG5pcnlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTMyNzEwMSwiZXhwIjoyMDY0OTAzMTAxfQ.T0TUi8QEh-d7L-P4lCqHoX7l7rVS99SNaoTomqInJyI"

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function finalTest() {
  console.log("🎯 FINAL COMPREHENSIVE TEST")
  console.log("===========================")

  try {
    // Test 1: Basic connection
    console.log("🔌 Test 1: Basic Connection...")
    const { data: connectionTest, error: connectionError } = await supabase
      .from("blocked_dates")
      .select("count", { count: "exact", head: true })

    if (connectionError) {
      console.log("❌ Connection failed:", connectionError.message)
      return
    }
    console.log("✅ Connection successful! Current blocked dates:", connectionTest)

    // Test 2: Clear any existing test data
    console.log("\n🧹 Test 2: Cleaning up...")
    await supabase.from("blocked_dates").delete().eq("reason", "Final test")
    await supabase.from("blocked_time_slots").delete().eq("reason", "Final test")
    console.log("✅ Cleanup complete")

    // Test 3: Insert July 12th with exact date
    console.log("\n📅 Test 3: Testing July 12th insertion...")
    const testDate = "2025-07-12"

    const { data: insertResult, error: insertError } = await supabase
      .from("blocked_dates")
      .insert({
        blocked_date: testDate,
        reason: "Final test",
      })
      .select()
      .single()

    if (insertError) {
      console.log("❌ Insert failed:", insertError.message)
      return
    }

    console.log("✅ Insert successful!")
    console.log("   Input date:  ", testDate)
    console.log("   Stored date: ", insertResult.blocked_date)
    console.log("   Exact match: ", insertResult.blocked_date === testDate ? "✅ PERFECT!" : "❌ MISMATCH!")

    // Test 4: Fetch all blocked dates
    console.log("\n📋 Test 4: Fetching all blocked dates...")
    const { data: allDates, error: fetchError } = await supabase.from("blocked_dates").select("*").order("blocked_date")

    if (fetchError) {
      console.log("❌ Fetch failed:", fetchError.message)
      return
    }

    console.log("✅ Fetch successful!")
    console.log("   Total blocked dates:", allDates.length)
    allDates.forEach((date, index) => {
      console.log(`   ${index + 1}. ${date.blocked_date} (${date.reason || "No reason"})`)
    })

    // Test 5: Test time slot
    console.log("\n⏰ Test 5: Testing time slot...")
    const { data: slotResult, error: slotError } = await supabase
      .from("blocked_time_slots")
      .insert({
        blocked_date: testDate,
        blocked_time: "2:00 PM",
        reason: "Final test",
      })
      .select()
      .single()

    if (slotError) {
      console.log("❌ Time slot insert failed:", slotError.message)
    } else {
      console.log("✅ Time slot insert successful!")
      console.log("   Date: ", slotResult.blocked_date)
      console.log("   Time: ", slotResult.blocked_time)
      console.log("   Match:", slotResult.blocked_date === testDate ? "✅ PERFECT!" : "❌ MISMATCH!")
    }

    // Test 6: Simulate API call
    console.log("\n🌐 Test 6: Simulating API response...")
    const { data: apiSimulation, error: apiError } = await supabase.from("blocked_dates").select("*")

    if (apiError) {
      console.log("❌ API simulation failed:", apiError.message)
    } else {
      console.log("✅ API simulation successful!")
      const testDateFound = apiSimulation.find((d) => d.reason === "Final test")
      if (testDateFound) {
        console.log("   Found test date:", testDateFound.blocked_date)
        console.log(
          "   API would return:",
          JSON.stringify(
            {
              id: testDateFound.id,
              blocked_date: testDateFound.blocked_date,
              reason: testDateFound.reason,
            },
            null,
            2,
          ),
        )
      }
    }

    // Test 7: Check database schema
    console.log("\n🔍 Test 7: Checking database schema...")
    const { data: schemaCheck, error: schemaError } = await supabase.rpc("sql", {
      query: `
          SELECT 
            column_name, 
            data_type, 
            is_nullable
          FROM information_schema.columns 
          WHERE table_name = 'blocked_dates' 
            AND column_name = 'blocked_date'
        `,
    })

    if (!schemaError && schemaCheck) {
      console.log("✅ Schema check successful!")
      console.log("   Column info:", schemaCheck)
    } else {
      console.log("⚠️ Schema check not available, but that's okay")
    }

    // Final cleanup
    console.log("\n🧹 Final cleanup...")
    await supabase.from("blocked_dates").delete().eq("reason", "Final test")
    await supabase.from("blocked_time_slots").delete().eq("reason", "Final test")
    console.log("✅ Cleanup complete!")

    console.log("\n🎉 ALL TESTS COMPLETED!")
    console.log("If you saw ✅ PERFECT! for the date matches, your database is working correctly!")
  } catch (error) {
    console.log("❌ Test failed with error:", error.message)
    console.log("Full error:", error)
  }
}

finalTest()
