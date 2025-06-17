import { createClient } from "@supabase/supabase-js"

// Your actual Supabase credentials from the screenshot
const SUPABASE_URL = "https://cqnfxvgdamevrvlniryr.supabase.co"
const SUPABASE_SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbmZ4dmdkYW1ldnJ2bG5pcnlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDU3Mjg3NCwiZXhwIjoyMDUwMTQ4ODc0fQ.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbmZ4dmdkYW1ldnJ2bG5pcnlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDU3Mjg3NCwiZXhwIjoyMDUwMTQ4ODc0fQ"

console.log("🔍 DEBUGGING JULY 31ST AVAILABILITY ISSUE")
console.log("=".repeat(50))

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function debugAvailability() {
  try {
    console.log("🔌 Testing database connection...")

    // Test connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from("bookings")
      .select("count(*)", { count: "exact", head: true })

    if (connectionError) {
      console.log("❌ Database connection failed:", connectionError.message)
      return
    }

    console.log("✅ Database connection successful!")
    console.log(`📊 Total bookings in system: ${connectionTest || 0}`)

    // Check ALL blocked dates
    console.log("\n🚫 CHECKING ALL BLOCKED DATES...")
    const { data: allBlockedDates, error: blockedError } = await supabase
      .from("blocked_dates")
      .select("*")
      .order("blocked_date")

    if (blockedError) {
      console.log("❌ Error fetching blocked dates:", blockedError.message)
      console.log("🔧 This might be the RLS issue we saw earlier!")
    } else {
      console.log(`📅 Total blocked dates found: ${allBlockedDates?.length || 0}`)

      if (allBlockedDates && allBlockedDates.length > 0) {
        console.log("\n📋 ALL BLOCKED DATES:")
        allBlockedDates.forEach((date, index) => {
          const isJuly31 = date.blocked_date === "2025-07-31"
          const marker = isJuly31 ? "🎯" : "📅"
          console.log(`${marker} ${index + 1}. ${date.blocked_date} ${date.reason ? `(${date.reason})` : ""}`)
        })

        // THE BIG QUESTION: Is July 31st blocked?
        const july31Blocked = allBlockedDates.find((date) => date.blocked_date === "2025-07-31")

        console.log("\n" + "=".repeat(50))
        if (july31Blocked) {
          console.log("🎯 JULY 31ST, 2025 IS BLOCKED IN DATABASE! ✅")
          console.log(`   Reason: ${july31Blocked.reason || "No reason specified"}`)
          console.log("   📱 Frontend SHOULD show 'No available slots'")
        } else {
          console.log("🎯 JULY 31ST, 2025 IS NOT BLOCKED IN DATABASE ❌")
          console.log("   📱 Frontend SHOULD show 'Available slots'")
        }
        console.log("=".repeat(50))
      } else {
        console.log("📋 No blocked dates found in database")
        console.log("🎯 July 31st should show as AVAILABLE")
      }
    }

    // Check blocked time slots for July 31st
    console.log("\n⏰ CHECKING BLOCKED TIME SLOTS FOR JULY 31ST...")
    const { data: july31Slots, error: slotsError } = await supabase
      .from("blocked_time_slots")
      .select("*")
      .eq("blocked_date", "2025-07-31")
      .order("blocked_time")

    if (slotsError) {
      console.log("❌ Error fetching time slots:", slotsError.message)
    } else {
      console.log(`⏰ Blocked time slots for July 31st: ${july31Slots?.length || 0}`)
      if (july31Slots && july31Slots.length > 0) {
        july31Slots.forEach((slot, index) => {
          console.log(`   ${index + 1}. ${slot.blocked_time} ${slot.reason ? `(${slot.reason})` : ""}`)
        })
      }
    }

    // Check existing bookings for July 31st
    console.log("\n📅 CHECKING EXISTING BOOKINGS FOR JULY 31ST...")
    const { data: july31Bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("*")
      .eq("booking_date", "2025-07-31")
      .order("booking_time")

    if (bookingsError) {
      console.log("❌ Error fetching bookings:", bookingsError.message)
    } else {
      console.log(`📊 Existing bookings for July 31st: ${july31Bookings?.length || 0}`)
      if (july31Bookings && july31Bookings.length > 0) {
        july31Bookings.forEach((booking, index) => {
          console.log(`   ${index + 1}. ${booking.booking_time} - ${booking.client_name} (${booking.status})`)
        })
      }
    }

    // FINAL SUMMARY
    console.log("\n📋 FINAL DIAGNOSIS:")
    console.log("=".repeat(50))

    if (blockedError) {
      console.log("❌ PROBLEM: Cannot access blocked_dates table")
      console.log("🔧 SOLUTION: Fix RLS policies (run the RLS script)")
    } else {
      const july31Blocked = allBlockedDates?.find((date) => date.blocked_date === "2025-07-31")
      const july31HasSlots = july31Slots && july31Slots.length > 0
      const july31HasBookings = july31Bookings && july31Bookings.length > 0

      console.log("✅ Database access is working")

      if (july31Blocked) {
        console.log("🎯 July 31st IS BLOCKED - frontend should show 'No available slots'")
        console.log("❌ If frontend shows 'Available slots', there's a sync issue")
      } else if (july31HasSlots) {
        console.log("🎯 July 31st has blocked time slots - some times unavailable")
      } else {
        console.log("🎯 July 31st is AVAILABLE - frontend is correct")
      }

      if (july31HasBookings) {
        console.log(`📊 July 31st has ${july31Bookings.length} existing bookings`)
      }
    }

    console.log("=".repeat(50))
  } catch (error) {
    console.log("❌ Unexpected error:", error.message)
    console.log("🔧 Check your Supabase connection and credentials")
  }
}

debugAvailability()
