// Test the API endpoint directly to see what's being returned
const supabaseUrl = "https://cqnfxvgdamevrvlniryr.supabase.co"
const serviceRoleKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbmZ4dmdkYW1ldnJ2bG5pcnlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDU3Mjg3NCwiZXhwIjoyMDUwMTQ4ODc0fQ.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbmZ4dmdkYW1ldnJ2bG5pcnlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDU3Mjg3NCwiZXhwIjoyMDUwMTQ4ODc0fQ"

console.log("🔍 TESTING API ENDPOINT DIRECTLY")
console.log("================================")

async function testAPI() {
  try {
    console.log("🔌 Testing database connection...")

    // Import Supabase
    const { createClient } = await import("@supabase/supabase-js")

    // Create client
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    console.log("✅ Supabase client created")

    // Test direct database query
    console.log("\n📊 Querying blocked_dates table directly...")
    const { data: blockedDates, error: datesError } = await supabase
      .from("blocked_dates")
      .select("*")
      .order("blocked_date")

    if (datesError) {
      console.error("❌ Error fetching blocked dates:", datesError)
      return
    }

    console.log("📋 Raw blocked dates from database:")
    blockedDates?.forEach((date, index) => {
      console.log(`  ${index + 1}. ID: ${date.id}, Date: "${date.blocked_date}", Reason: "${date.reason || "N/A"}"`)

      // Test date parsing
      const originalDate = date.blocked_date
      const parsedDate = new Date(originalDate)
      const isoString = parsedDate.toISOString()
      const dateOnly = isoString.split("T")[0]

      console.log(`     Original: "${originalDate}"`)
      console.log(`     Parsed as Date: ${parsedDate}`)
      console.log(`     ISO String: ${isoString}`)
      console.log(`     Date Only: ${dateOnly}`)
      console.log(`     ⚠️  SHIFT DETECTED: ${originalDate !== dateOnly ? "YES" : "NO"}`)
      console.log("")
    })

    // Test the API endpoint
    console.log("\n🌐 Testing /api/admin/availability endpoint...")
    const response = await fetch("/api/admin/availability")

    if (!response.ok) {
      console.error("❌ API request failed:", response.status, response.statusText)
      return
    }

    const apiData = await response.json()
    console.log("📋 API Response:")
    console.log(JSON.stringify(apiData, null, 2))

    // Compare database vs API
    console.log("\n🔍 COMPARISON: Database vs API")
    console.log("================================")

    if (blockedDates && apiData.blockedDates) {
      console.log(`Database has ${blockedDates.length} blocked dates`)
      console.log(`API returns ${apiData.blockedDates.length} blocked dates`)

      blockedDates.forEach((dbDate, index) => {
        const apiDate = apiData.blockedDates[index]
        if (apiDate) {
          console.log(`${index + 1}. DB: "${dbDate.blocked_date}" → API: "${apiDate.blocked_date}"`)
          if (dbDate.blocked_date !== apiDate.blocked_date) {
            console.log(`   ⚠️  MISMATCH DETECTED!`)
          }
        }
      })
    }

    // Test specific dates
    console.log("\n🎯 TESTING SPECIFIC DATES")
    console.log("==========================")

    const testDates = ["2025-07-12", "2025-07-13", "2025-08-01", "2025-08-02"]

    testDates.forEach((testDate) => {
      const isBlockedInDB = blockedDates?.some((d) => d.blocked_date === testDate)
      const isBlockedInAPI = apiData.blockedDates?.some((d) => d.blocked_date === testDate)

      console.log(`${testDate}:`)
      console.log(`  Database: ${isBlockedInDB ? "🚫 BLOCKED" : "✅ Available"}`)
      console.log(`  API: ${isBlockedInAPI ? "🚫 BLOCKED" : "✅ Available"}`)
      console.log(`  Match: ${isBlockedInDB === isBlockedInAPI ? "✅ YES" : "❌ NO"}`)
      console.log("")
    })
  } catch (error) {
    console.error("❌ Test failed:", error)
  }
}

testAPI()
