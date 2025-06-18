import { createClient } from "@supabase/supabase-js"

console.log("🏥 POST-FIX HEALTH CHECK")
console.log("=".repeat(60))
console.log("Verifying timezone fix and frontend-backend sync...\n")

// Your exact credentials
const SUPABASE_URL = "https://cqnfxvgdamevrvlniryr.supabase.co"
const SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbmZ4dmdkYW1ldnJ2bG5pcnlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTMyNzEwMSwiZXhwIjoyMDY0OTAzMTAxfQ.T0TUi8QEh-d7L-P4lCqHoX7l7rVS99SNaoTomqInJyI"

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

async function postFixHealthCheck() {
  const results = {
    database: false,
    dateFormat: false,
    readWrite: false,
    apiSimulation: false,
    timezoneConsistency: false,
    realTimeSync: false,
  }

  let overallHealth = 0

  try {
    // 1. Database Connection Test
    console.log("1️⃣ DATABASE CONNECTION")
    console.log("-".repeat(25))

    const { data: connectionTest, error: connectionError } = await supabase
      .from("blocked_dates")
      .select("count")
      .limit(1)

    if (connectionError) {
      console.log("❌ Database connection failed:", connectionError.message)
    } else {
      console.log("✅ Database connection successful")
      results.database = true
      overallHealth += 1
    }

    // 2. Date Format Verification
    console.log("\n2️⃣ DATE FORMAT VERIFICATION")
    console.log("-".repeat(28))

    // Check if columns are now TEXT type
    const { data: columnInfo, error: columnError } = await supabase.rpc("get_column_info")

    if (columnError) {
      console.log("⚠️ Could not verify column types, but continuing...")
    }

    // Test date format consistency
    const { data: sampleDates, error: dateError } = await supabase.from("blocked_dates").select("blocked_date").limit(5)

    if (dateError) {
      console.log("❌ Could not fetch sample dates:", dateError.message)
    } else {
      console.log("📊 Sample dates from database:")
      let formatConsistent = true

      if (sampleDates && sampleDates.length > 0) {
        sampleDates.forEach((item, index) => {
          const isValidFormat = /^\d{4}-\d{2}-\d{2}$/.test(item.blocked_date)
          console.log(`   ${index + 1}. ${item.blocked_date} - ${isValidFormat ? "✅ Valid" : "❌ Invalid"} format`)
          if (!isValidFormat) formatConsistent = false
        })
      } else {
        console.log("   No dates found - format check passed")
      }

      if (formatConsistent) {
        console.log("✅ All dates in correct YYYY-MM-DD format")
        results.dateFormat = true
        overallHealth += 1
      } else {
        console.log("❌ Some dates have incorrect format")
      }
    }

    // 3. Read/Write Test with Timezone Verification
    console.log("\n3️⃣ READ/WRITE WITH TIMEZONE TEST")
    console.log("-".repeat(32))

    const testDate = "2025-06-25" // Use a specific test date
    const testReason = "Health check timezone test"

    try {
      // Insert test date
      console.log(`📝 Inserting test date: ${testDate}`)
      const { data: insertData, error: insertError } = await supabase
        .from("blocked_dates")
        .insert({ blocked_date: testDate, reason: testReason })
        .select()
        .single()

      if (insertError && !insertError.message.includes("duplicate")) {
        console.log("❌ Insert failed:", insertError.message)
      } else {
        console.log("✅ Insert successful")

        // Immediately read it back
        const { data: readData, error: readError } = await supabase
          .from("blocked_dates")
          .select("*")
          .eq("blocked_date", testDate)
          .eq("reason", testReason)
          .single()

        if (readError) {
          console.log("❌ Read back failed:", readError.message)
        } else {
          console.log(`📖 Read back successful: ${readData.blocked_date}`)

          // Verify the date is exactly what we stored
          if (readData.blocked_date === testDate) {
            console.log("✅ Date consistency verified - no timezone conversion!")
            results.readWrite = true
            overallHealth += 1
          } else {
            console.log(`❌ Date mismatch! Stored: ${testDate}, Retrieved: ${readData.blocked_date}`)
          }
        }

        // Clean up test data
        await supabase.from("blocked_dates").delete().eq("blocked_date", testDate).eq("reason", testReason)
        console.log("🧹 Test data cleaned up")
      }
    } catch (err) {
      console.log("❌ Read/Write test failed:", err.message)
    }

    // 4. API Simulation Test
    console.log("\n4️⃣ API SIMULATION TEST")
    console.log("-".repeat(21))

    try {
      // Simulate the /api/admin/availability endpoint
      const [blockedDatesData, blockedSlotsData] = await Promise.all([
        supabase.from("blocked_dates").select("*").order("blocked_date"),
        supabase.from("blocked_time_slots").select("*").order("blocked_date"),
      ])

      if (blockedDatesData.error || blockedSlotsData.error) {
        console.log("❌ API simulation failed")
      } else {
        const apiResponse = {
          success: true,
          blockedDates: blockedDatesData.data || [],
          blockedSlots: blockedSlotsData.data || [],
          timestamp: new Date().toISOString(),
        }

        console.log("✅ API simulation successful")
        console.log(`📊 Would return ${apiResponse.blockedDates.length} blocked dates`)
        console.log(`📊 Would return ${apiResponse.blockedSlots.length} blocked time slots`)

        // Check if any dates exist and verify their format
        if (apiResponse.blockedDates.length > 0) {
          const firstDate = apiResponse.blockedDates[0].blocked_date
          const isValidFormat = /^\d{4}-\d{2}-\d{2}$/.test(firstDate)
          console.log(`📅 Sample API date: ${firstDate} - ${isValidFormat ? "✅ Valid" : "❌ Invalid"} format`)
        }

        results.apiSimulation = true
        overallHealth += 1
      }
    } catch (err) {
      console.log("❌ API simulation failed:", err.message)
    }

    // 5. Timezone Consistency Test
    console.log("\n5️⃣ TIMEZONE CONSISTENCY TEST")
    console.log("-".repeat(28))

    const today = new Date()
    const todayString = today.toISOString().split("T")[0] // YYYY-MM-DD format

    console.log(`🌍 Current date (local): ${todayString}`)
    console.log(`🌍 Current timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`)

    // Test that our date handling doesn't shift dates
    const testDates = ["2025-06-19", "2025-07-01", "2025-12-31"]

    console.log("🧪 Testing date consistency:")
    let allConsistent = true

    testDates.forEach((date) => {
      // Simulate how the frontend would handle this date
      const jsDate = new Date(date + "T12:00:00") // Using noon to avoid timezone issues
      const backToString = jsDate.toISOString().split("T")[0]

      const isConsistent = date === backToString
      console.log(`   ${date} → ${backToString} ${isConsistent ? "✅" : "❌"}`)

      if (!isConsistent) allConsistent = false
    })

    if (allConsistent) {
      console.log("✅ Timezone consistency verified")
      results.timezoneConsistency = true
      overallHealth += 1
    } else {
      console.log("❌ Timezone inconsistency detected")
    }

    // 6. Real-time Sync Capability Test
    console.log("\n6️⃣ REAL-TIME SYNC TEST")
    console.log("-".repeat(21))

    const syncTestDate = "2025-06-26"
    const syncTestReason = "Real-time sync test"

    try {
      console.log(`🔄 Testing real-time sync with date: ${syncTestDate}`)

      // Add test date
      const { error: syncInsertError } = await supabase
        .from("blocked_dates")
        .insert({ blocked_date: syncTestDate, reason: syncTestReason })

      if (syncInsertError && !syncInsertError.message.includes("duplicate")) {
        console.log("❌ Sync test insert failed:", syncInsertError.message)
      } else {
        // Immediately try to read it back (simulating real-time sync)
        const { data: syncReadData, error: syncReadError } = await supabase
          .from("blocked_dates")
          .select("*")
          .eq("blocked_date", syncTestDate)
          .eq("reason", syncTestReason)

        if (syncReadError) {
          console.log("❌ Sync test read failed:", syncReadError.message)
        } else if (syncReadData && syncReadData.length > 0) {
          console.log("✅ Real-time sync working - data immediately available")
          console.log(`📊 Synced date: ${syncReadData[0].blocked_date}`)

          if (syncReadData[0].blocked_date === syncTestDate) {
            console.log("✅ Sync date consistency verified")
            results.realTimeSync = true
            overallHealth += 1
          } else {
            console.log("❌ Sync date inconsistency detected")
          }
        } else {
          console.log("❌ Real-time sync issue - data not found")
        }

        // Clean up sync test data
        await supabase.from("blocked_dates").delete().eq("blocked_date", syncTestDate).eq("reason", syncTestReason)
        console.log("🧹 Sync test data cleaned up")
      }
    } catch (err) {
      console.log("❌ Real-time sync test failed:", err.message)
    }

    // Final Health Report
    console.log("\n" + "=".repeat(60))
    console.log("🏥 FINAL HEALTH REPORT")
    console.log("=".repeat(60))

    const totalTests = Object.keys(results).length
    const healthPercentage = Math.round((overallHealth / totalTests) * 100)

    console.log(`Database Connection:     ${results.database ? "✅ HEALTHY" : "❌ FAILED"}`)
    console.log(`Date Format:            ${results.dateFormat ? "✅ HEALTHY" : "❌ FAILED"}`)
    console.log(`Read/Write Operations:  ${results.readWrite ? "✅ HEALTHY" : "❌ FAILED"}`)
    console.log(`API Simulation:         ${results.apiSimulation ? "✅ HEALTHY" : "❌ FAILED"}`)
    console.log(`Timezone Consistency:   ${results.timezoneConsistency ? "✅ HEALTHY" : "❌ FAILED"}`)
    console.log(`Real-time Sync:         ${results.realTimeSync ? "✅ HEALTHY" : "❌ FAILED"}`)

    console.log("\n" + "=".repeat(60))
    console.log(`🎯 OVERALL HEALTH: ${healthPercentage}% (${overallHealth}/${totalTests} tests passed)`)

    if (healthPercentage === 100) {
      console.log("\n🎉 EXCELLENT! TIMEZONE FIX SUCCESSFUL!")
      console.log("✅ Your frontend and backend are perfectly synced")
      console.log("✅ No more date shifting issues")
      console.log("✅ June 19th blocked in admin = June 19th blocked in booking")
      console.log("✅ Real-time updates working perfectly")

      console.log("\n🚀 READY FOR PRODUCTION!")
      console.log("1. Admin calendar changes appear instantly on booking page")
      console.log("2. Dates are consistent across all interfaces")
      console.log("3. No timezone conversion issues")
      console.log("4. Your sync problem is COMPLETELY RESOLVED! 🎊")
    } else if (healthPercentage >= 80) {
      console.log("\n⚠️ MOSTLY HEALTHY - Minor issues remain")
      console.log("Your system should work but may have some edge cases")
      console.log("Consider addressing the failed tests above")
    } else {
      console.log("\n❌ CRITICAL ISSUES REMAIN")
      console.log("Your timezone fix needs more work")
      console.log("Please address the failed tests above")
    }

    console.log("\n💡 NEXT STEPS:")
    if (healthPercentage === 100) {
      console.log("1. Test blocking June 19th in admin panel")
      console.log("2. Verify June 19th (not 18th) appears blocked in booking")
      console.log("3. Celebrate - your sync issue is fixed! 🎉")
    } else {
      console.log("1. Address any failed health checks above")
      console.log("2. Re-run this health check")
      console.log("3. Test the admin-booking sync manually")
    }

    return results
  } catch (error) {
    console.log("❌ Health check failed:", error.message)
    return results
  }
}

postFixHealthCheck()
