// Debug script to identify date mismatch between admin and frontend
const { createClient } = require("@supabase/supabase-js")

// Your Supabase credentials
const supabaseUrl = "https://cqnfxvgdamevrvlniryr.supabase.co"
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbmZ4dmdkYW1ldnJ2bG5pcnlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDU3Mjg3NCwiZXhwIjoyMDUwMTQ4ODc0fQ.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbmZ4dmdkYW1ldnJ2bG5pcnlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDU3Mjg3NCwiZXhwIjoyMDUwMTQ4ODc0fQ"

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Date normalization function (same as frontend)
function normalizeDateString(dateString) {
  try {
    // Ensure we're working with YYYY-MM-DD format consistently
    if (dateString.includes("T")) {
      return dateString.split("T")[0]
    }

    // If it's already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString
    }

    // Handle other formats by creating a date and formatting it properly
    const date = new Date(dateString + "T00:00:00")
    return date.toISOString().split("T")[0]
  } catch (error) {
    console.error("Error normalizing date:", dateString, error)
    return dateString
  }
}

async function debugDateMismatch() {
  console.log("🔍 DEBUGGING DATE MISMATCH ISSUE")
  console.log("==================================")

  try {
    // 1. Check database connection
    console.log("🔌 Testing database connection...")
    const { data: testData, error: testError } = await supabase.from("blocked_dates").select("count").limit(1)

    if (testError) {
      console.log("❌ Database connection failed:", testError.message)
      return
    }
    console.log("✅ Database connection successful")

    // 2. Get raw blocked dates from database
    console.log("\n📊 Fetching blocked dates from database...")
    const { data: blockedDates, error: datesError } = await supabase
      .from("blocked_dates")
      .select("*")
      .order("blocked_date")

    if (datesError) {
      console.log("❌ Error fetching blocked dates:", datesError.message)
      return
    }

    console.log("📋 Raw blocked dates from database:")
    blockedDates?.forEach((date, index) => {
      console.log(`  ${index + 1}. ${date.blocked_date} (ID: ${date.id})`)
      console.log(`     Created: ${date.created_at}`)
      console.log(`     Reason: ${date.reason || "No reason"}`)
    })

    // 3. Test date normalization
    console.log("\n🔧 Testing date normalization...")
    blockedDates?.forEach((date) => {
      const original = date.blocked_date
      const normalized = normalizeDateString(original)
      const jsDate = new Date(original + "T00:00:00")
      const localString = jsDate.toLocaleDateString("en-US")

      console.log(`  Original: ${original}`)
      console.log(`  Normalized: ${normalized}`)
      console.log(`  JS Date: ${jsDate.toISOString()}`)
      console.log(`  Local String: ${localString}`)
      console.log(`  ---`)
    })

    // 4. Test specific problematic dates
    console.log("\n🎯 Testing specific dates mentioned in issue...")

    const testDates = ["2025-07-12", "2025-07-13", "2025-08-01", "2025-08-02"]

    for (const testDate of testDates) {
      const isBlocked = blockedDates?.some((d) => d.blocked_date === testDate)
      const normalizedBlocked = blockedDates?.some((d) => normalizeDateString(d.blocked_date) === testDate)

      console.log(`  ${testDate}:`)
      console.log(`    Direct match: ${isBlocked ? "🚫 BLOCKED" : "✅ Available"}`)
      console.log(`    Normalized match: ${normalizedBlocked ? "🚫 BLOCKED" : "✅ Available"}`)
    }

    // 5. Simulate API response
    console.log("\n📡 Simulating API response format...")
    const apiResponse = {
      success: true,
      blockedDates: blockedDates || [],
      blockedSlots: [],
      timestamp: new Date().toISOString(),
    }

    console.log("API would return:")
    console.log(JSON.stringify(apiResponse, null, 2))

    // 6. Test frontend processing
    console.log("\n🖥️ Simulating frontend processing...")
    const frontendBlockedDates = []

    if (Array.isArray(apiResponse.blockedDates)) {
      apiResponse.blockedDates.forEach((item) => {
        if (item && item.blocked_date) {
          const normalizedDate = normalizeDateString(item.blocked_date)
          frontendBlockedDates.push(normalizedDate)
          console.log(`  ${item.blocked_date} → ${normalizedDate}`)
        }
      })
    }

    console.log("\n📋 Frontend would see these blocked dates:")
    frontendBlockedDates.forEach((date, index) => {
      console.log(`  ${index + 1}. ${date}`)
    })

    // 7. Summary and diagnosis
    console.log("\n🎯 DIAGNOSIS SUMMARY")
    console.log("===================")

    if (blockedDates && blockedDates.length > 0) {
      console.log(`✅ Found ${blockedDates.length} blocked dates in database`)

      // Check for the specific issue mentioned
      const july13Blocked = blockedDates.some((d) => d.blocked_date === "2025-07-13")
      const july12Blocked = blockedDates.some((d) => d.blocked_date === "2025-07-12")
      const aug2Blocked = blockedDates.some((d) => d.blocked_date === "2025-08-02")
      const aug1Blocked = blockedDates.some((d) => d.blocked_date === "2025-08-01")

      console.log("\n📅 Specific date analysis:")
      console.log(`  July 12, 2025: ${july12Blocked ? "🚫 BLOCKED in DB" : "✅ Available in DB"}`)
      console.log(`  July 13, 2025: ${july13Blocked ? "🚫 BLOCKED in DB" : "✅ Available in DB"}`)
      console.log(`  August 1, 2025: ${aug1Blocked ? "🚫 BLOCKED in DB" : "✅ Available in DB"}`)
      console.log(`  August 2, 2025: ${aug2Blocked ? "🚫 BLOCKED in DB" : "✅ Available in DB"}`)

      if (july13Blocked && !july12Blocked) {
        console.log("\n🎯 ISSUE IDENTIFIED: July 13 is blocked in DB but frontend shows July 12")
        console.log("   This suggests a timezone/date parsing issue in the frontend")
      }

      if (aug2Blocked && !aug1Blocked) {
        console.log("🎯 ISSUE IDENTIFIED: August 2 is blocked in DB but frontend shows August 1")
        console.log("   This confirms a systematic date shifting issue")
      }
    } else {
      console.log("❌ No blocked dates found in database")
    }

    console.log("\n✅ Debug complete! Check the analysis above.")
  } catch (error) {
    console.error("❌ Debug script failed:", error)
  }
}

// Run the debug
debugDateMismatch()
