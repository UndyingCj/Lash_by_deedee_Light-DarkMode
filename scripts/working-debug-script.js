// Working debug script with hardcoded credentials
const { createClient } = require("@supabase/supabase-js")

// Your actual Supabase credentials
const supabaseUrl = "https://cqnfxvgdamevrvlniryr.supabase.co"
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbmZ4dmdkYW1ldnJ2bG5pcnlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTMyNzEwMSwiZXhwIjoyMDY0OTAzMTAxfQ.T0TUi8QEh-d7L-P4lCqHoX7l7rVS99SNaoTomqInJyI"

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function debugSystem() {
  console.log("🔍 DEBUGGING AVAILABILITY SYSTEM")
  console.log("================================")

  try {
    // 1. Test connection
    console.log("1️⃣ Testing database connection...")
    const { data: connectionTest, error: connectionError } = await supabase
      .from("blocked_dates")
      .select("count(*)")
      .limit(1)

    if (connectionError) {
      console.error("❌ Connection failed:", connectionError.message)
      return
    }
    console.log("✅ Database connection successful")

    // 2. Check current blocked dates
    console.log("\n2️⃣ Current blocked dates...")
    const { data: blockedDates, error: blockedError } = await supabase
      .from("blocked_dates")
      .select("*")
      .order("blocked_date")

    if (blockedError) {
      console.error("❌ Error fetching blocked dates:", blockedError.message)
    } else {
      console.log(`📅 Found ${blockedDates?.length || 0} blocked dates:`)
      blockedDates?.forEach((date, index) => {
        console.log(`   ${index + 1}. ${date.blocked_date} - ${date.reason || "No reason"}`)
      })
    }

    // 3. Test adding June 20th
    console.log("\n3️⃣ Testing blocking June 20th...")
    const testDate = "2025-06-20"

    const { data: insertResult, error: insertError } = await supabase
      .from("blocked_dates")
      .upsert(
        [
          {
            blocked_date: testDate,
            reason: "Admin test - " + new Date().toISOString(),
          },
        ],
        {
          onConflict: "blocked_date",
        },
      )
      .select()

    if (insertError) {
      console.error("❌ Error blocking date:", insertError.message)
    } else {
      console.log("✅ June 20th blocked successfully:", insertResult)
    }

    // 4. Verify it's blocked
    console.log("\n4️⃣ Verifying June 20th is blocked...")
    const { data: verifyData, error: verifyError } = await supabase
      .from("blocked_dates")
      .select("*")
      .eq("blocked_date", testDate)

    if (verifyError) {
      console.error("❌ Error verifying:", verifyError.message)
    } else if (verifyData && verifyData.length > 0) {
      console.log("✅ June 20th is confirmed blocked:", verifyData[0])
    } else {
      console.log("❌ June 20th is NOT blocked in database")
    }

    // 5. Test API simulation
    console.log("\n5️⃣ Simulating API response...")
    const { data: allBlockedDates } = await supabase.from("blocked_dates").select("*").order("blocked_date")

    const { data: allBlockedSlots } = await supabase.from("blocked_time_slots").select("*").order("blocked_date")

    const apiResponse = {
      success: true,
      blockedDates: allBlockedDates || [],
      blockedSlots: allBlockedSlots || [],
      timestamp: new Date().toISOString(),
    }

    console.log("📡 API would return:")
    console.log(JSON.stringify(apiResponse, null, 2))

    // 6. Check if June 20th would be in API response
    const june20InApi = apiResponse.blockedDates.some((d) => d.blocked_date === "2025-06-20")
    console.log(`\n🎯 June 20th in API response: ${june20InApi ? "✅ YES" : "❌ NO"}`)

    console.log("\n" + "=".repeat(50))
    console.log("🎯 DIAGNOSIS:")
    if (june20InApi) {
      console.log("✅ Backend is working correctly")
      console.log("✅ June 20th is blocked in database")
      console.log("✅ API would return June 20th as blocked")
      console.log("\n💡 If booking page doesn't show it blocked, the issue is:")
      console.log("   1. Frontend not calling the API")
      console.log("   2. Frontend not processing API response")
      console.log("   3. Date format mismatch in frontend")
    } else {
      console.log("❌ Backend issue - June 20th not properly blocked")
    }
  } catch (error) {
    console.error("💥 Debug failed:", error.message)
  }
}

debugSystem()
