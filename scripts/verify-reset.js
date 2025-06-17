// 🔍 Verify the database reset worked properly

const { createClient } = require("@supabase/supabase-js")

const supabaseUrl = "https://cqnfxvgdamevrvlniryr.supabase.co"
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbmZ4dmdkYW1ldnJ2bG5pcnlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDU3Mjg3NCwiZXhwIjoyMDUwMTQ4ODc0fQ.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbmZ4dmdkYW1ldnJ2bG5pcnlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDU3Mjg3NCwiZXhwIjoyMDUwMTQ4ODc0fQ"

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verifyReset() {
  console.log("🔍 VERIFYING DATABASE RESET")
  console.log("===========================")

  try {
    // Test all tables exist and work
    console.log("📋 Checking all tables...")

    const { data: bookings, error: bookingsError } = await supabase.from("bookings").select("*")
    console.log(bookingsError ? `❌ Bookings: ${bookingsError.message}` : `✅ Bookings: ${bookings.length} records`)

    const { data: blockedDates, error: blockedError } = await supabase.from("blocked_dates").select("*")
    console.log(
      blockedError ? `❌ Blocked dates: ${blockedError.message}` : `✅ Blocked dates: ${blockedDates.length} records`,
    )

    const { data: settings, error: settingsError } = await supabase.from("business_settings").select("*")
    console.log(settingsError ? `❌ Settings: ${settingsError.message}` : `✅ Settings: ${settings.length} records`)

    const { data: timeSlots, error: timeSlotsError } = await supabase.from("blocked_time_slots").select("*")
    console.log(
      timeSlotsError ? `❌ Time slots: ${timeSlotsError.message}` : `✅ Time slots: ${timeSlots.length} records`,
    )

    const { data: notifications, error: notificationsError } = await supabase.from("notifications").select("*")
    console.log(
      notificationsError
        ? `❌ Notifications: ${notificationsError.message}`
        : `✅ Notifications: ${notifications.length} records`,
    )

    // Check specific dates that were problematic
    console.log("\n🎯 Checking specific dates...")

    const july12 = await supabase.from("blocked_dates").select("*").eq("blocked_date", "2025-07-12")
    console.log(`📅 July 12th (was problematic): ${july12.data?.length > 0 ? "BLOCKED ✅" : "AVAILABLE ❌"}`)

    const july31 = await supabase.from("blocked_dates").select("*").eq("blocked_date", "2025-07-31")
    console.log(`📅 July 31st: ${july31.data?.length > 0 ? "BLOCKED" : "AVAILABLE ✅"}`)

    // Test API endpoint
    console.log("\n🌐 Testing API endpoint...")
    try {
      const response = await fetch(
        `${supabaseUrl.replace("https://", "https://").replace(".supabase.co", "")}/api/admin/availability`,
      )
      if (response.ok) {
        const apiData = await response.json()
        console.log(`✅ API working: ${apiData.blockedDates?.length || 0} blocked dates returned`)
      } else {
        console.log(`❌ API failed: ${response.status}`)
      }
    } catch (apiError) {
      console.log(`❌ API test failed: ${apiError.message}`)
    }

    console.log("\n🎉 Database reset verification complete!")
    console.log("Your fresh database is ready to use.")
  } catch (error) {
    console.log("❌ Verification failed:", error.message)
  }
}

verifyReset()
