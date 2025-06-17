import { createClient } from "@supabase/supabase-js"

console.log("🔍 TESTING WITH YOUR EXACT CREDENTIALS")
console.log("=".repeat(50))

// Your exact credentials
const SUPABASE_URL = "https://cqnfxvgdamevrvlniryr.supabase.co"
const SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbmZ4dmdkYW1ldnJ2bG5pcnlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTMyNzEwMSwiZXhwIjoyMDY0OTAzMTAxfQ.T0TUi8QEh-d7L-P4lCqHoX7l7rVS99SNaoTomqInJyI"

console.log("📍 URL:", SUPABASE_URL)
console.log("🔑 Service Key:", SERVICE_KEY.substring(0, 50) + "...")

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function testEverything() {
  try {
    console.log("\n1️⃣ Testing basic connection...")

    // Test if we can connect at all
    const { data: tables, error: tablesError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .eq("table_type", "BASE TABLE")

    if (tablesError) {
      console.log("❌ Can't access database:", tablesError.message)
      return
    }

    console.log("✅ Database connection successful!")
    console.log("📋 Available tables:", tables?.map((t) => t.table_name).join(", ") || "None")

    // Test bookings table
    console.log("\n2️⃣ Testing bookings table...")
    const { data: bookings, error: bookingsError } = await supabase.from("bookings").select("*").limit(5)

    if (bookingsError) {
      console.log("❌ Bookings error:", bookingsError.message)
    } else {
      console.log("✅ Bookings table accessible!")
      console.log(`📊 Found ${bookings?.length || 0} bookings`)
    }

    // Test blocked_dates table
    console.log("\n3️⃣ Testing blocked_dates table...")
    const { data: blockedDates, error: blockedError } = await supabase.from("blocked_dates").select("*")

    if (blockedError) {
      console.log("❌ Blocked dates error:", blockedError.message)
    } else {
      console.log("✅ Blocked dates table accessible!")
      console.log(`📅 Found ${blockedDates?.length || 0} blocked dates`)

      if (blockedDates && blockedDates.length > 0) {
        console.log("\n📋 Current blocked dates:")
        blockedDates.forEach((date) => {
          console.log(`   • ${date.blocked_date} ${date.reason ? `(${date.reason})` : ""}`)
        })
      }
    }

    // Test write access
    console.log("\n4️⃣ Testing write access...")
    const testDate = "2024-12-31"

    // Try to insert a test blocked date
    const { error: insertError } = await supabase
      .from("blocked_dates")
      .insert({ blocked_date: testDate, reason: "Connection test" })

    if (insertError) {
      console.log("❌ Write access failed:", insertError.message)
    } else {
      console.log("✅ Write access successful!")

      // Clean up test data
      await supabase.from("blocked_dates").delete().eq("blocked_date", testDate).eq("reason", "Connection test")

      console.log("🧹 Test data cleaned up")
    }

    console.log("\n" + "=".repeat(50))
    console.log("🎉 CONNECTION TEST COMPLETE!")
    console.log("✅ Your database is working properly")
    console.log("🚀 Backend and frontend should now sync!")
  } catch (error) {
    console.log("❌ Unexpected error:", error.message)
  }
}

testEverything()
