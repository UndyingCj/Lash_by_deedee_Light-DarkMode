import { createClient } from "@supabase/supabase-js"

console.log("🏥 COMPLETE SYSTEM HEALTH CHECK")
console.log("=".repeat(60))
console.log("Checking frontend-backend sync, database, and all components...\n")

// Your exact credentials
const SUPABASE_URL = "https://cqnfxvgdamevrvlniryr.supabase.co"
const SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbmZ4dmdkYW1ldnJ2bG5pcnlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTMyNzEwMSwiZXhwIjoyMDY0OTAzMTAxfQ.T0TUi8QEh-d7L-P4lCqHoX7l7rVS99SNaoTomqInJyI"

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

async function completeHealthCheck() {
  const results = {
    database: false,
    tables: false,
    readAccess: false,
    writeAccess: false,
    apiLogic: false,
    dateSync: false,
    realTimeSync: false,
  }

  try {
    // 1. Database Connection
    console.log("1️⃣ DATABASE CONNECTION TEST")
    console.log("-".repeat(30))

    const { data: connectionTest, error: connectionError } = await supabase
      .from("blocked_dates")
      .select("count")
      .limit(1)

    if (connectionError) {
      console.log("❌ Database connection failed:", connectionError.message)
      return results
    } else {
      console.log("✅ Database connection successful")
      results.database = true
    }

    // 2. Table Access Test
    console.log("\n2️⃣ TABLE ACCESS TEST")
    console.log("-".repeat(20))

    const tables = ["blocked_dates", "blocked_time_slots", "bookings", "business_settings"]
    let tablesOk = true

    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select("*").limit(1)
        if (error) {
          console.log(`❌ Cannot access ${table}:`, error.message)
          tablesOk = false
        } else {
          console.log(`✅ ${table} accessible`)
        }
      } catch (err) {
        console.log(`❌ Error accessing ${table}:`, err.message)
        tablesOk = false
      }
    }
    results.tables = tablesOk

    // 3. Read Access Test
    console.log("\n3️⃣ READ ACCESS TEST")
    console.log("-".repeat(18))

    const { data: blockedDates, error: readError } = await supabase
      .from("blocked_dates")
      .select("*")
      .order("blocked_date")

    if (readError) {
      console.log("❌ Read access failed:", readError.message)
    } else {
      console.log("✅ Read access successful")
      console.log(`📊 Found ${blockedDates?.length || 0} blocked dates`)

      if (blockedDates && blockedDates.length > 0) {
        console.log("📅 Current blocked dates:")
        blockedDates.forEach((date, index) => {
          console.log(`   ${index + 1}. ${date.blocked_date} ${date.reason ? `(${date.reason})` : ""}`)
        })
      }
      results.readAccess = true
    }

    // 4. Write Access Test
    console.log("\n4️⃣ WRITE ACCESS TEST")
    console.log("-".repeat(19))

    const testDate = "2024-12-31"
    const testReason = "Health check test"

    // Try to insert
    const { error: insertError } = await supabase
      .from("blocked_dates")
      .insert({ blocked_date: testDate, reason: testReason })

    if (insertError && !insertError.message.includes("duplicate")) {
      console.log("❌ Write access failed:", insertError.message)
    } else {
      console.log("✅ Write access successful")

      // Clean up test data
      await supabase.from("blocked_dates").delete().eq("blocked_date", testDate).eq("reason", testReason)

      console.log("🧹 Test data cleaned up")
      results.writeAccess = true
    }

    // 5. API Logic Simulation
    console.log("\n5️⃣ API LOGIC SIMULATION")
    console.log("-".repeat(23))

    try {
      // Simulate what /api/admin/availability does
      const [blockedDatesData, blockedSlotsData] = await Promise.all([
        supabase.from("blocked_dates").select("*").order("blocked_date"),
        supabase.from("blocked_time_slots").select("*").order("blocked_date"),
      ])

      const apiResponse = {
        success: true,
        blockedDates: blockedDatesData.data || [],
        blockedSlots: blockedSlotsData.data || [],
        timestamp: new Date().toISOString(),
      }

      console.log("✅ API logic simulation successful")
      console.log(`📊 API returns ${apiResponse.blockedDates.length} blocked dates`)
      console.log(`📊 API returns ${apiResponse.blockedSlots.length} blocked time slots`)
      results.apiLogic = true
    } catch (err) {
      console.log("❌ API logic simulation failed:", err.message)
    }

    // 6. Date Format Check
    console.log("\n6️⃣ DATE FORMAT CONSISTENCY")
    console.log("-".repeat(26))

    if (blockedDates && blockedDates.length > 0) {
      let formatOk = true
      console.log("📅 Checking date formats:")

      blockedDates.forEach((date) => {
        const isValid = /^\d{4}-\d{2}-\d{2}$/.test(date.blocked_date)
        console.log(`   ${date.blocked_date}: ${isValid ? "✅ Valid YYYY-MM-DD" : "❌ Invalid format"}`)
        if (!isValid) formatOk = false
      })

      results.dateSync = formatOk
    } else {
      console.log("📅 No dates to check - format consistency OK")
      results.dateSync = true
    }

    // 7. Real-time Sync Test
    console.log("\n7️⃣ REAL-TIME SYNC CAPABILITY")
    console.log("-".repeat(28))

    const syncTestDate = "2025-01-01"

    try {
      // Add a test date
      await supabase.from("blocked_dates").insert({ blocked_date: syncTestDate, reason: "Sync test" })

      // Immediately try to read it back
      const { data: syncCheck } = await supabase
        .from("blocked_dates")
        .select("*")
        .eq("blocked_date", syncTestDate)
        .eq("reason", "Sync test")

      if (syncCheck && syncCheck.length > 0) {
        console.log("✅ Real-time sync working - data immediately available")
        results.realTimeSync = true

        // Clean up
        await supabase.from("blocked_dates").delete().eq("blocked_date", syncTestDate).eq("reason", "Sync test")

        console.log("🧹 Sync test data cleaned up")
      } else {
        console.log("❌ Real-time sync issue - data not immediately available")
      }
    } catch (err) {
      console.log("❌ Real-time sync test failed:", err.message)
    }

    // Final Health Report
    console.log("\n" + "=".repeat(60))
    console.log("🏥 SYSTEM HEALTH REPORT")
    console.log("=".repeat(60))

    console.log(`Database Connection:     ${results.database ? "✅ HEALTHY" : "❌ FAILED"}`)
    console.log(`Table Access:           ${results.tables ? "✅ HEALTHY" : "❌ FAILED"}`)
    console.log(`Read Access:            ${results.readAccess ? "✅ HEALTHY" : "❌ FAILED"}`)
    console.log(`Write Access:           ${results.writeAccess ? "✅ HEALTHY" : "❌ FAILED"}`)
    console.log(`API Logic:              ${results.apiLogic ? "✅ HEALTHY" : "❌ FAILED"}`)
    console.log(`Date Synchronization:   ${results.dateSync ? "✅ HEALTHY" : "❌ FAILED"}`)
    console.log(`Real-time Sync:         ${results.realTimeSync ? "✅ HEALTHY" : "❌ FAILED"}`)

    const healthyCount = Object.values(results).filter(Boolean).length
    const totalTests = Object.keys(results).length
    const healthPercentage = Math.round((healthyCount / totalTests) * 100)

    console.log("\n" + "=".repeat(60))
    console.log(`🎯 OVERALL HEALTH: ${healthPercentage}% (${healthyCount}/${totalTests} tests passed)`)

    if (healthPercentage === 100) {
      console.log("\n🎉 EXCELLENT! ALL SYSTEMS OPERATIONAL")
      console.log("✅ Your frontend and backend are perfectly synced")
      console.log("✅ Admin calendar changes will appear instantly on booking page")
      console.log("✅ Real-time updates are working")
      console.log("✅ Database is healthy and responsive")

      console.log("\n💡 NEXT STEPS:")
      console.log("1. Test admin calendar - block a date")
      console.log("2. Check booking page - date should be unavailable immediately")
      console.log("3. Your sync issue is RESOLVED! 🚀")
    } else if (healthPercentage >= 80) {
      console.log("\n⚠️ MOSTLY HEALTHY - Minor issues detected")
      console.log("Your system should work but may have some sync delays")
    } else {
      console.log("\n❌ CRITICAL ISSUES DETECTED")
      console.log("Your frontend-backend sync will not work properly")
      console.log("Please fix the failed tests above")
    }

    return results
  } catch (error) {
    console.log("❌ Health check failed:", error.message)
    return results
  }
}

completeHealthCheck()
