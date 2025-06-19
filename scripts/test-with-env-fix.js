// Load environment variables properly
require("dotenv").config({ path: ".env.local" })

const { createClient } = require("@supabase/supabase-js")

// Get from environment variables (should work now)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log("🔧 Environment Check:")
console.log("SUPABASE_URL:", supabaseUrl ? "✅ Found" : "❌ Missing")
console.log("SERVICE_KEY:", supabaseServiceKey ? "✅ Found" : "❌ Missing")

if (!supabaseUrl || !supabaseServiceKey) {
  console.log("\n❌ Missing environment variables!")
  console.log("Make sure your .env.local file contains:")
  console.log("NEXT_PUBLIC_SUPABASE_URL=https://cqnfxvgdamevrvlniryr.supabase.co")
  console.log("SUPABASE_SERVICE_ROLE_KEY=your_service_role_key")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testDateHandling() {
  console.log("\n🧪 TESTING DATE HANDLING")
  console.log("========================")

  try {
    // 1. Test blocking June 20th with proper DATE format
    console.log("1️⃣ Blocking June 20th with DATE format...")
    const testDate = "2025-06-20" // Pure DATE string, no timestamp

    const { data: insertResult, error: insertError } = await supabase
      .from("blocked_dates")
      .upsert(
        [
          {
            blocked_date: testDate, // This should stay as 2025-06-20
            reason: "Test with proper DATE format",
          },
        ],
        {
          onConflict: "blocked_date",
        },
      )
      .select()

    if (insertError) {
      console.error("❌ Error inserting:", insertError.message)
      return
    }

    console.log("✅ Inserted successfully:", insertResult)

    // 2. Read it back and verify no date shift
    console.log("\n2️⃣ Reading back to verify no date shift...")
    const { data: readBack, error: readError } = await supabase
      .from("blocked_dates")
      .select("*")
      .eq("blocked_date", testDate)

    if (readError) {
      console.error("❌ Error reading back:", readError.message)
      return
    }

    if (readBack && readBack.length > 0) {
      const storedDate = readBack[0].blocked_date
      console.log(`✅ Original: ${testDate}`)
      console.log(`✅ Stored:   ${storedDate}`)
      console.log(`✅ Match:    ${testDate === storedDate ? "YES" : "NO"}`)

      if (testDate === storedDate) {
        console.log("🎉 DATE HANDLING IS NOW FIXED!")
      } else {
        console.log("❌ Still has date shift issue")
      }
    } else {
      console.log("❌ No data found")
    }

    // 3. Test API endpoint
    console.log("\n3️⃣ Testing API endpoint...")
    const response = await fetch("http://localhost:3000/api/admin/availability")

    if (response.ok) {
      const apiData = await response.json()
      console.log("✅ API Response:", {
        success: apiData.success,
        blockedDatesCount: apiData.blockedDates?.length || 0,
        firstBlockedDate: apiData.blockedDates?.[0]?.blocked_date || "none",
      })

      const june20InApi = apiData.blockedDates?.some((d) => d.blocked_date === "2025-06-20")
      console.log(`🎯 June 20th in API: ${june20InApi ? "✅ YES" : "❌ NO"}`)
    } else {
      console.log("❌ API request failed:", response.status)
    }
  } catch (error) {
    console.error("💥 Test failed:", error.message)
  }
}

testDateHandling()
