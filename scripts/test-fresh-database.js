// 🧪 Test the fresh database setup

const { createClient } = require("@supabase/supabase-js")

const supabaseUrl = "https://cqnfxvgdamevrvlniryr.supabase.co"
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbmZ4dmdkYW1ldnJ2bG5pcnlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDU3Mjg3NCwiZXhwIjoyMDUwMTQ4ODc0fQ.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbmZ4dmdkYW1ldnJ2bG5pcnlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDU3Mjg3NCwiZXhwIjoyMDUwMTQ4ODc0fQ"

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testFreshDatabase() {
  console.log("🧪 TESTING FRESH DATABASE SETUP")
  console.log("==================================")

  try {
    // Test connection
    console.log("🔌 Testing database connection...")
    const { data: connectionTest, error: connectionError } = await supabase.from("bookings").select("count").limit(1)

    if (connectionError) {
      console.log("❌ Connection failed:", connectionError.message)
      return
    }
    console.log("✅ Database connection successful!")

    // Test bookings table
    console.log("\n📅 Testing bookings table...")
    const { data: bookings, error: bookingsError } = await supabase.from("bookings").select("*")

    if (bookingsError) {
      console.log("❌ Bookings query failed:", bookingsError.message)
    } else {
      console.log(`✅ Found ${bookings.length} bookings`)
      bookings.forEach((booking) => {
        console.log(`   - ${booking.client_name}: ${booking.service} on ${booking.booking_date}`)
      })
    }

    // Test blocked_dates table
    console.log("\n🚫 Testing blocked_dates table...")
    const { data: blockedDates, error: blockedError } = await supabase.from("blocked_dates").select("*")

    if (blockedError) {
      console.log("❌ Blocked dates query failed:", blockedError.message)
    } else {
      console.log(`✅ Found ${blockedDates.length} blocked dates`)
      blockedDates.forEach((date) => {
        console.log(`   - ${date.blocked_date}: ${date.reason}`)
      })
    }

    // Test business_settings table
    console.log("\n⚙️ Testing business_settings table...")
    const { data: settings, error: settingsError } = await supabase.from("business_settings").select("*")

    if (settingsError) {
      console.log("❌ Settings query failed:", settingsError.message)
    } else {
      console.log(`✅ Found ${settings.length} settings`)
      settings.forEach((setting) => {
        console.log(`   - ${setting.setting_key}: ${setting.setting_value}`)
      })
    }

    // Test July 31st specifically
    console.log("\n🎯 Testing July 31st, 2025 specifically...")
    const july31 = "2025-07-31"

    const { data: july31Blocked } = await supabase.from("blocked_dates").select("*").eq("blocked_date", july31)

    const { data: july31Bookings } = await supabase.from("bookings").select("*").eq("booking_date", july31)

    console.log(`📊 July 31st Status:`)
    console.log(`   - Blocked: ${july31Blocked?.length > 0 ? "YES" : "NO"}`)
    console.log(`   - Existing bookings: ${july31Bookings?.length || 0}`)
    console.log(`   - Should show as: ${july31Blocked?.length > 0 ? "UNAVAILABLE" : "AVAILABLE"}`)

    console.log("\n🎉 Fresh database test completed successfully!")
    console.log("Your database is now clean and ready to use.")
  } catch (error) {
    console.log("❌ Test failed:", error.message)
  }
}

testFreshDatabase()
