// Check what's currently in your database
const { createClient } = require("@supabase/supabase-js")

const SUPABASE_URL = "https://cqnfxvgdamevrvlniryr.supabase.co"
const SUPABASE_SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbmZ4dmdkYW1ldnJ2bG5pcnlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTMyNzEwMSwiZXhwIjoyMDY0OTAzMTAxfQ.T0TUi8QEh-d7L-P4lCqHoX7l7rVS99SNaoTomqInJyI"

console.log("🔍 CHECKING CURRENT BLOCKED DATES IN DATABASE")
console.log("=============================================")

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function checkCurrentData() {
  try {
    // Check blocked dates
    console.log("📅 BLOCKED DATES:")
    const { data: blockedDates, error: datesError } = await supabase
      .from("blocked_dates")
      .select("*")
      .order("blocked_date")

    if (datesError) {
      console.log("❌ Error fetching blocked dates:", datesError.message)
    } else {
      if (blockedDates && blockedDates.length > 0) {
        blockedDates.forEach((date, index) => {
          console.log(`   ${index + 1}. ${date.blocked_date} (${date.reason || "No reason"})`)
        })
      } else {
        console.log("   No blocked dates found")
      }
    }

    // Check blocked time slots
    console.log("\n⏰ BLOCKED TIME SLOTS:")
    const { data: blockedSlots, error: slotsError } = await supabase
      .from("blocked_time_slots")
      .select("*")
      .order("blocked_date")
      .order("blocked_time")

    if (slotsError) {
      console.log("❌ Error fetching blocked time slots:", slotsError.message)
    } else {
      if (blockedSlots && blockedSlots.length > 0) {
        blockedSlots.forEach((slot, index) => {
          console.log(`   ${index + 1}. ${slot.blocked_date} at ${slot.blocked_time} (${slot.reason || "No reason"})`)
        })
      } else {
        console.log("   No blocked time slots found")
      }
    }

    // Check bookings
    console.log("\n📋 RECENT BOOKINGS:")
    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("*")
      .order("booking_date", { ascending: false })
      .limit(5)

    if (bookingsError) {
      console.log("❌ Error fetching bookings:", bookingsError.message)
    } else {
      if (bookings && bookings.length > 0) {
        bookings.forEach((booking, index) => {
          console.log(
            `   ${index + 1}. ${booking.booking_date} at ${booking.booking_time} - ${booking.client_name} (${booking.status})`,
          )
        })
      } else {
        console.log("   No bookings found")
      }
    }

    console.log("\n✅ Database check completed!")
  } catch (error) {
    console.error("❌ Database check failed:", error.message)
  }
}

checkCurrentData()
