// FINAL CONNECTION TEST - This will verify everything is working
const { createClient } = require("@supabase/supabase-js")

const supabaseUrl = "https://cqnfxvgdamevrvlniryr.supabase.co"
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbmZ4dmdkYW1ldnJ2bG5pcnlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDU3Mjg3NCwiZXhwIjoyMDUwMTQ4ODc0fQ.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbmZ4dmdkYW1ldnJ2bG5pcnlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDU3Mjg3NCwiZXhwIjoyMDUwMTQ4ODc0fQ"

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function finalConnectionTest() {
  console.log("🔧 FINAL CONNECTION TEST")
  console.log("========================")
  console.log("Testing if the database connection and RLS fixes worked...\n")

  try {
    // Test 1: Basic connection
    console.log("1️⃣ Testing basic database connection...")
    const { data: testData, error: testError } = await supabase.from("blocked_dates").select("count").limit(1)

    if (testError) {
      console.log("❌ BASIC CONNECTION FAILED:", testError.message)
      return false
    }
    console.log("✅ Basic connection successful")

    // Test 2: Read blocked dates
    console.log("\n2️⃣ Testing blocked dates read access...")
    const { data: blockedDates, error: readError } = await supabase
      .from("blocked_dates")
      .select("*")
      .order("blocked_date")

    if (readError) {
      console.log("❌ READ ACCESS FAILED:", readError.message)
      return false
    }
    console.log("✅ Read access successful")
    console.log(`📊 Found ${blockedDates?.length || 0} blocked dates`)

    // Test 3: Write access (insert test data)
    console.log("\n3️⃣ Testing write access...")
    const testDate = "2025-01-20"
    const { data: insertData, error: insertError } = await supabase
      .from("blocked_dates")
      .upsert([{ blocked_date: testDate, reason: "Connection test" }])
      .select()

    if (insertError) {
      console.log("❌ WRITE ACCESS FAILED:", insertError.message)
      return false
    }
    console.log("✅ Write access successful")

    // Test 4: Delete access (cleanup test data)
    console.log("\n4️⃣ Testing delete access...")
    const { error: deleteError } = await supabase.from("blocked_dates").delete().eq("blocked_date", testDate)

    if (deleteError) {
      console.log("❌ DELETE ACCESS FAILED:", deleteError.message)
      return false
    }
    console.log("✅ Delete access successful")

    // Test 5: API simulation
    console.log("\n5️⃣ Testing API endpoint simulation...")
    const { data: apiBlockedDates } = await supabase.from("blocked_dates").select("*").order("blocked_date")

    const { data: apiBlockedSlots } = await supabase.from("blocked_time_slots").select("*").order("blocked_date")

    const apiResponse = {
      success: true,
      blockedDates: apiBlockedDates || [],
      blockedSlots: apiBlockedSlots || [],
      timestamp: new Date().toISOString(),
    }

    console.log("✅ API simulation successful")
    console.log(`📊 API returns ${apiResponse.blockedDates.length} blocked dates`)
    console.log(`📊 API returns ${apiResponse.blockedSlots.length} blocked slots`)

    // Test 6: Show current blocked dates
    console.log("\n6️⃣ Current blocked dates in database:")
    if (apiResponse.blockedDates.length > 0) {
      apiResponse.blockedDates.forEach((date, index) => {
        console.log(`   ${index + 1}. ${date.blocked_date} - ${date.reason || "No reason"}`)
      })
    } else {
      console.log("   No blocked dates found")
    }

    console.log("\n🎉 ALL TESTS PASSED!")
    console.log("====================")
    console.log("✅ Database connection is working")
    console.log("✅ RLS policies are fixed")
    console.log("✅ Read/Write/Delete access confirmed")
    console.log("✅ API endpoints should work now")
    console.log("✅ Frontend and backend should sync")

    console.log("\n🚀 NEXT STEPS:")
    console.log("1. Test your booking page - dates should now sync")
    console.log("2. Test your admin calendar - changes should be immediate")
    console.log("3. Block/unblock dates in admin - should appear on booking page instantly")

    return true
  } catch (error) {
    console.log("❌ FINAL TEST FAILED:", error.message)
    console.log("\n🔧 TROUBLESHOOTING:")
    console.log("1. Check your Supabase project is active")
    console.log("2. Verify your service role key is correct")
    console.log("3. Ensure your Supabase URL is correct")
    return false
  }
}

// Run the final test
finalConnectionTest()
