// Test after RLS fix
const supabaseUrl = "https://cqnfxvgdamevrvlniryr.supabase.co"
const serviceRoleKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbmZ4dmdkYW1ldnJ2bG5pcnlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDU3Mjg3NCwiZXhwIjoyMDUwMTQ4ODc0fQ.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbmZ4dmdkYW1ldnJ2bG5pcnlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDU3Mjg3NCwiZXhwIjoyMDUwMTQ4ODc0fQ"

console.log("🔍 TESTING AFTER RLS FIX")
console.log("========================")

async function testAfterFix() {
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

    // Test database query
    console.log("\n📊 Testing blocked_dates query...")
    const { data: blockedDates, error: datesError } = await supabase
      .from("blocked_dates")
      .select("*")
      .order("blocked_date")

    if (datesError) {
      console.error("❌ Error fetching blocked dates:", datesError)
      return
    }

    console.log("✅ Database query successful!")
    console.log(`📋 Found ${blockedDates?.length || 0} blocked dates:`)

    blockedDates?.forEach((date, index) => {
      console.log(`  ${index + 1}. "${date.blocked_date}" (${date.reason || "No reason"})`)
    })

    // Test API endpoint
    console.log("\n🌐 Testing API endpoint...")
    try {
      const response = await fetch("/api/admin/availability")

      if (!response.ok) {
        console.error("❌ API request failed:", response.status, response.statusText)
        const errorText = await response.text()
        console.error("Error details:", errorText)
        return
      }

      const apiData = await response.json()
      console.log("✅ API request successful!")
      console.log(`📋 API returned ${apiData.blockedDates?.length || 0} blocked dates`)

      // Compare specific dates
      console.log("\n🎯 TESTING SPECIFIC DATES:")
      const testDates = ["2025-07-12", "2025-07-13", "2025-08-01", "2025-08-02"]

      testDates.forEach((testDate) => {
        const isBlockedInDB = blockedDates?.some((d) => d.blocked_date === testDate)
        const isBlockedInAPI = apiData.blockedDates?.some((d) => d.blocked_date === testDate)

        console.log(`${testDate}:`)
        console.log(`  Database: ${isBlockedInDB ? "🚫 BLOCKED" : "✅ Available"}`)
        console.log(`  API: ${isBlockedInAPI ? "🚫 BLOCKED" : "✅ Available"}`)
        console.log(`  Match: ${isBlockedInDB === isBlockedInAPI ? "✅ YES" : "❌ NO - MISMATCH!"}`)
        console.log("")
      })

      // Show what's actually blocked
      console.log("\n📋 ACTUALLY BLOCKED DATES:")
      if (blockedDates && blockedDates.length > 0) {
        blockedDates.forEach((date) => {
          console.log(`  🚫 ${date.blocked_date}`)
        })
      } else {
        console.log("  (No dates are blocked)")
      }
    } catch (apiError) {
      console.error("❌ API test failed:", apiError)
    }
  } catch (error) {
    console.error("❌ Test failed:", error)
  }
}

testAfterFix()
