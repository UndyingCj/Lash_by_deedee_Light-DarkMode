import { createClient } from "@supabase/supabase-js"

// Using the environment variables from your Coolify setup
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log("🔍 FINAL CONNECTION TEST")
console.log("=".repeat(50))

// Debug environment variables
console.log("Environment Variables Check:")
console.log("SUPABASE_URL:", SUPABASE_URL ? "✅ Available" : "❌ Missing")
console.log("SERVICE_KEY:", SUPABASE_SERVICE_KEY ? "✅ Available" : "❌ Missing")

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.log("\n❌ Environment variables not available in script context")
  console.log("🔧 Let's use the values directly from your Coolify config...")

  // Using your actual values from the screenshot
  const directUrl = "https://cqnfxvgdamevrvlniryr.supabase.co"
  const directKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbmZ4dmdkYW1ldnJ2bG5pcnlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDU3Mjg3NCwiZXhwIjoyMDUwMTQ4ODc0fQ.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbmZ4dmdkYW1ldnJ2bG5pcnlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDU3Mjg3NCwiZXhwIjoyMDUwMTQ4ODc0fQ"

  await testWithDirectValues(directUrl, directKey)
} else {
  await testWithEnvVars(SUPABASE_URL, SUPABASE_SERVICE_KEY)
}

async function testWithDirectValues(url, key) {
  console.log("\n🔧 Testing with direct values...")

  const supabase = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  await runTests(supabase)
}

async function testWithEnvVars(url, key) {
  console.log("\n🔧 Testing with environment variables...")

  const supabase = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  await runTests(supabase)
}

async function runTests(supabase) {
  try {
    console.log("\n1️⃣ Testing basic connection...")
    const { data: connectionTest, error: connectionError } = await supabase
      .from("bookings")
      .select("count(*)", { count: "exact", head: true })

    if (connectionError) {
      console.log("❌ Connection failed:", connectionError.message)
      return
    }

    console.log("✅ Connection successful!")
    console.log(`📊 Total bookings: ${connectionTest || 0}`)

    console.log("\n2️⃣ Testing blocked dates access...")
    const { data: blockedDates, error: blockedError } = await supabase
      .from("blocked_dates")
      .select("*")
      .order("blocked_date")

    if (blockedError) {
      console.log("❌ Blocked dates access failed:", blockedError.message)
      console.log("🔧 This is likely an RLS issue")
    } else {
      console.log("✅ Blocked dates access successful!")
      console.log(`📅 Total blocked dates: ${blockedDates?.length || 0}`)

      if (blockedDates && blockedDates.length > 0) {
        console.log("\n📋 Current blocked dates:")
        blockedDates.forEach((date, index) => {
          console.log(`   ${index + 1}. ${date.blocked_date} ${date.reason ? `(${date.reason})` : ""}`)
        })
      }
    }

    console.log("\n3️⃣ Testing write access...")
    const testDate = "2025-12-31"
    const { data: writeTest, error: writeError } = await supabase
      .from("blocked_dates")
      .upsert([{ blocked_date: testDate, reason: "Connection test" }])
      .select()

    if (writeError) {
      console.log("❌ Write access failed:", writeError.message)
    } else {
      console.log("✅ Write access successful!")

      // Clean up test data
      await supabase.from("blocked_dates").delete().eq("blocked_date", testDate)
      console.log("🧹 Test data cleaned up")
    }

    console.log("\n🎯 DIAGNOSIS:")
    console.log("=".repeat(30))

    if (!connectionError && !blockedError && !writeError) {
      console.log("✅ ALL SYSTEMS WORKING!")
      console.log("📱 Frontend should now sync with backend")
      console.log("🔄 Try making changes in admin panel")
    } else if (!connectionError && blockedError) {
      console.log("⚠️  CONNECTION OK, but RLS blocking access")
      console.log("🔧 Need to fix RLS policies")
    } else {
      console.log("❌ FUNDAMENTAL CONNECTION ISSUES")
      console.log("🔧 Check Supabase credentials")
    }
  } catch (error) {
    console.log("❌ Unexpected error:", error.message)
  }
}
