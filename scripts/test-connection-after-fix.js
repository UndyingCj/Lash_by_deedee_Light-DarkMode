import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = "https://cqnfxvgdamevrvlniryr.supabase.co"
const SUPABASE_SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbmZ4dmdkYW1ldnJ2bG5pcnlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDU3Mjg3NCwiZXhwIjoyMDUwMTQ4ODc0fQ.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbmZ4dmdkYW1ldnJ2bG5pcnlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDU3Mjg3NCwiZXhwIjoyMDUwMTQ4ODc0fQ"

console.log("🔧 TESTING DATABASE CONNECTION AFTER RLS FIX")
console.log("=".repeat(50))

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function testConnection() {
  try {
    console.log("🔌 Testing basic connection...")

    // Test 1: Simple connection test
    const { data: healthCheck, error: healthError } = await supabase
      .from("bookings")
      .select("count(*)", { count: "exact", head: true })

    if (healthError) {
      console.log("❌ Basic connection failed:", healthError.message)
      console.log("🔧 Error details:", healthError)
      return false
    }

    console.log("✅ Basic connection successful!")
    console.log(`📊 Total bookings: ${healthCheck || 0}`)

    // Test 2: Try to read blocked_dates
    console.log("\n📅 Testing blocked_dates access...")
    const { data: blockedDates, error: blockedError } = await supabase.from("blocked_dates").select("*").limit(5)

    if (blockedError) {
      console.log("❌ Blocked dates access failed:", blockedError.message)
      console.log("🔧 Error details:", blockedError)
      return false
    }

    console.log("✅ Blocked dates access successful!")
    console.log(`📊 Sample blocked dates: ${blockedDates?.length || 0} records`)

    // Test 3: Check for July 31st specifically
    console.log("\n🎯 Testing July 31st query...")
    const { data: july31, error: july31Error } = await supabase
      .from("blocked_dates")
      .select("*")
      .eq("blocked_date", "2025-07-31")

    if (july31Error) {
      console.log("❌ July 31st query failed:", july31Error.message)
      return false
    }

    console.log("✅ July 31st query successful!")

    if (july31 && july31.length > 0) {
      console.log("🚫 JULY 31ST IS BLOCKED:")
      july31.forEach((record) => {
        console.log(`   📅 Date: ${record.blocked_date}`)
        console.log(`   📝 Reason: ${record.reason || "No reason"}`)
        console.log(`   🕐 Created: ${record.created_at}`)
      })
      console.log("\n❌ PROBLEM: July 31st is blocked but frontend shows available!")
      console.log("🔧 SOLUTION: Frontend sync issue - API not returning blocked dates")
    } else {
      console.log("✅ July 31st is NOT blocked - frontend is correct")
    }

    // Test 4: Check all blocked dates
    console.log("\n📋 All blocked dates in system:")
    const { data: allBlocked, error: allError } = await supabase.from("blocked_dates").select("*").order("blocked_date")

    if (allError) {
      console.log("❌ Could not fetch all blocked dates:", allError.message)
    } else {
      console.log(`📊 Total blocked dates: ${allBlocked?.length || 0}`)
      if (allBlocked && allBlocked.length > 0) {
        allBlocked.forEach((date, index) => {
          const isJuly31 = date.blocked_date === "2025-07-31"
          const marker = isJuly31 ? "🎯" : "📅"
          console.log(`${marker} ${index + 1}. ${date.blocked_date} ${date.reason ? `(${date.reason})` : ""}`)
        })
      }
    }

    console.log("\n✅ ALL TESTS PASSED - Database connection is working!")
    return true
  } catch (error) {
    console.log("❌ Unexpected error:", error.message)
    console.log("🔧 Full error:", error)
    return false
  }
}

testConnection().then((success) => {
  if (success) {
    console.log("\n🎉 Database is ready! You can now run the availability debug script.")
  } else {
    console.log("\n❌ Database connection issues persist. Check Supabase dashboard.")
  }
})
