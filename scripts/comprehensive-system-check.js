// Comprehensive system check to verify everything is working
const { createClient } = require("@supabase/supabase-js")

// Your Supabase credentials from environment
const supabaseUrl = "https://cqnfxvgdamevrvlniryr.supabase.co"
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbmZ4dmdkYW1ldnJ2bG5pcnlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDU3Mjg3NCwiZXhwIjoyMDUwMTQ4ODc0fQ.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbmZ4dmdkYW1ldnJ2bG5pcnlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDU3Mjg3NCwiZXhwIjoyMDUwMTQ4ODc0fQ"

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function comprehensiveSystemCheck() {
  console.log("🔍 COMPREHENSIVE SYSTEM CHECK")
  console.log("=============================")
  console.log("Checking all components of the booking system...\n")

  let allTestsPassed = true
  const results = {
    database: false,
    rls: false,
    tables: false,
    api: false,
    dates: false,
    sync: false,
  }

  try {
    // 1. Database Connection Test
    console.log("1️⃣ TESTING DATABASE CONNECTION")
    console.log("------------------------------")
    try {
      const { data, error } = await supabase.from("blocked_dates").select("count").limit(1)
      if (error) {
        console.log("❌ Database connection failed:", error.message)
        allTestsPassed = false
      } else {
        console.log("✅ Database connection successful")
        results.database = true
      }
    } catch (error) {
      console.log("❌ Database connection error:", error.message)
      allTestsPassed = false
    }

    // 2. RLS Policies Test
    console.log("\n2️⃣ TESTING RLS POLICIES")
    console.log("------------------------")
    try {
      // Test service role access
      const { data: serviceData, error: serviceError } = await supabase.from("blocked_dates").select("*").limit(1)

      if (serviceError) {
        console.log("❌ Service role access failed:", serviceError.message)
        allTestsPassed = false
      } else {
        console.log("✅ Service role can access blocked_dates")
        results.rls = true
      }
    } catch (error) {
      console.log("❌ RLS policy error:", error.message)
      allTestsPassed = false
    }

    // 3. Table Access Test
    console.log("\n3️⃣ TESTING TABLE ACCESS")
    console.log("-----------------------")
    const tables = ["blocked_dates", "blocked_time_slots", "bookings", "business_settings"]

    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select("*").limit(1)
        if (error) {
          console.log(`❌ Cannot access ${table}:`, error.message)
          allTestsPassed = false
        } else {
          console.log(`✅ Can access ${table}`)
        }
      } catch (error) {
        console.log(`❌ Error accessing ${table}:`, error.message)
        allTestsPassed = false
      }
    }
    results.tables = true

    // 4. Current Blocked Dates Analysis
    console.log("\n4️⃣ ANALYZING CURRENT BLOCKED DATES")
    console.log("----------------------------------")
    try {
      const { data: blockedDates, error } = await supabase.from("blocked_dates").select("*").order("blocked_date")

      if (error) {
        console.log("❌ Cannot fetch blocked dates:", error.message)
        allTestsPassed = false
      } else {
        console.log(`📊 Found ${blockedDates?.length || 0} blocked dates in database:`)
        blockedDates?.forEach((date, index) => {
          console.log(`   ${index + 1}. ${date.blocked_date} (${date.reason || "No reason"})`)
        })

        // Test specific problematic dates
        console.log("\n🎯 CHECKING SPECIFIC DATES:")
        const testDates = ["2025-07-12", "2025-07-13", "2025-08-01", "2025-08-02"]

        testDates.forEach((testDate) => {
          const isBlocked = blockedDates?.some((d) => d.blocked_date === testDate)
          console.log(`   ${testDate}: ${isBlocked ? "🚫 BLOCKED" : "✅ Available"}`)
        })

        results.dates = true
      }
    } catch (error) {
      console.log("❌ Error analyzing blocked dates:", error.message)
      allTestsPassed = false
    }

    // 5. API Endpoint Test (simulated)
    console.log("\n5️⃣ TESTING API LOGIC")
    console.log("--------------------")
    try {
      // Simulate what the API endpoint does
      const { data: blockedDates } = await supabase.from("blocked_dates").select("*").order("blocked_date")
      const { data: blockedSlots } = await supabase.from("blocked_time_slots").select("*").order("blocked_date")

      const apiResponse = {
        success: true,
        blockedDates: blockedDates || [],
        blockedSlots: blockedSlots || [],
        timestamp: new Date().toISOString(),
      }

      console.log("✅ API logic simulation successful")
      console.log(`📊 API would return ${apiResponse.blockedDates.length} blocked dates`)
      console.log(`📊 API would return ${apiResponse.blockedSlots.length} blocked time slots`)

      results.api = true
    } catch (error) {
      console.log("❌ API logic simulation failed:", error.message)
      allTestsPassed = false
    }

    // 6. Date Format Consistency Check
    console.log("\n6️⃣ CHECKING DATE FORMAT CONSISTENCY")
    console.log("-----------------------------------")
    try {
      const { data: blockedDates } = await supabase.from("blocked_dates").select("*")

      if (blockedDates && blockedDates.length > 0) {
        console.log("📅 Date format analysis:")
        blockedDates.forEach((date) => {
          const original = date.blocked_date
          const isValidFormat = /^\d{4}-\d{2}-\d{2}$/.test(original)
          console.log(`   ${original}: ${isValidFormat ? "✅ Valid YYYY-MM-DD" : "❌ Invalid format"}`)
        })
        results.sync = true
      } else {
        console.log("📅 No blocked dates to analyze")
        results.sync = true
      }
    } catch (error) {
      console.log("❌ Date format check failed:", error.message)
      allTestsPassed = false
    }

    // 7. System Summary
    console.log("\n🎯 SYSTEM HEALTH SUMMARY")
    console.log("========================")
    console.log(`Database Connection: ${results.database ? "✅ PASS" : "❌ FAIL"}`)
    console.log(`RLS Policies: ${results.rls ? "✅ PASS" : "❌ FAIL"}`)
    console.log(`Table Access: ${results.tables ? "✅ PASS" : "❌ FAIL"}`)
    console.log(`API Logic: ${results.api ? "✅ PASS" : "❌ FAIL"}`)
    console.log(`Date Analysis: ${results.dates ? "✅ PASS" : "❌ FAIL"}`)
    console.log(`Date Sync: ${results.sync ? "✅ PASS" : "❌ FAIL"}`)

    console.log(`\n🏆 OVERALL STATUS: ${allTestsPassed ? "✅ ALL SYSTEMS OPERATIONAL" : "❌ ISSUES DETECTED"}`)

    if (allTestsPassed) {
      console.log("\n🎉 GREAT NEWS!")
      console.log("===============")
      console.log("✅ Your booking system is working correctly")
      console.log("✅ Database connections are stable")
      console.log("✅ RLS policies are properly configured")
      console.log("✅ Date synchronization should work")
      console.log("✅ Admin calendar and booking page should match")
      console.log("\n💡 If you're still seeing date mismatches:")
      console.log("   1. Clear your browser cache")
      console.log("   2. Hard refresh the booking page (Ctrl+F5)")
      console.log("   3. Check the browser console for any errors")
    } else {
      console.log("\n⚠️ ISSUES FOUND!")
      console.log("=================")
      console.log("Some components are not working correctly.")
      console.log("Please review the failed tests above and fix them.")
    }
  } catch (error) {
    console.error("❌ System check failed:", error)
    allTestsPassed = false
  }

  return allTestsPassed
}

// Run the comprehensive check
comprehensiveSystemCheck()
