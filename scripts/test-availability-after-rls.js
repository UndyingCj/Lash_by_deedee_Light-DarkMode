import { createClient } from "@supabase/supabase-js"

// You need to replace these with your actual Supabase credentials
const SUPABASE_URL = "YOUR_SUPABASE_URL_HERE"
const SUPABASE_SERVICE_KEY = "YOUR_SUPABASE_SERVICE_KEY_HERE"

console.log("🔧 Testing Availability After RLS Fix...\n")

// Check if environment variables are set
if (!SUPABASE_URL || SUPABASE_URL === "YOUR_SUPABASE_URL_HERE") {
  console.log("❌ Please set your SUPABASE_URL in the script")
  console.log("📍 Find it in: Supabase Dashboard > Settings > API > Project URL")
  process.exit(1)
}

if (!SUPABASE_SERVICE_KEY || SUPABASE_SERVICE_KEY === "YOUR_SUPABASE_SERVICE_KEY_HERE") {
  console.log("❌ Please set your SUPABASE_SERVICE_KEY in the script")
  console.log("📍 Find it in: Supabase Dashboard > Settings > API > service_role key")
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function testAvailabilityAfterRLS() {
  try {
    console.log("🔍 Testing database connection...")

    // Test connection
    const { data: testData, error: testError } = await supabase
      .from("bookings")
      .select("count(*)", { count: "exact", head: true })

    if (testError) {
      console.log("❌ Database connection failed:", testError.message)
      return
    }

    console.log("✅ Database connection successful")
    console.log("📊 Total bookings in database:", testData?.length || 0)

    // Check blocked dates
    console.log("\n🚫 Checking blocked dates...")
    const { data: blockedDates, error: blockedError } = await supabase
      .from("blocked_dates")
      .select("*")
      .order("blocked_date")

    if (blockedError) {
      console.log("❌ Error fetching blocked dates:", blockedError.message)
    } else {
      console.log("📅 Total blocked dates:", blockedDates?.length || 0)

      if (blockedDates && blockedDates.length > 0) {
        console.log("📋 Blocked dates list:")
        blockedDates.forEach((date) => {
          console.log(`   • ${date.blocked_date} ${date.reason ? `(${date.reason})` : ""}`)
        })

        // Check specifically for July 31st, 2025
        const july31 = blockedDates.find((date) => date.blocked_date === "2025-07-31")
        if (july31) {
          console.log("\n🎯 July 31st, 2025 IS BLOCKED ✅")
          console.log("   Reason:", july31.reason || "No reason specified")
        } else {
          console.log("\n🎯 July 31st, 2025 is NOT BLOCKED ❌")
        }
      } else {
        console.log("📋 No blocked dates found")
      }
    }

    // Check bookings for July 31st
    console.log("\n📅 Checking bookings for July 31st, 2025...")
    const { data: july31Bookings, error: bookingError } = await supabase
      .from("bookings")
      .select("*")
      .eq("booking_date", "2025-07-31")

    if (bookingError) {
      console.log("❌ Error fetching July 31st bookings:", bookingError.message)
    } else {
      console.log("📊 Bookings for July 31st:", july31Bookings?.length || 0)
      if (july31Bookings && july31Bookings.length > 0) {
        july31Bookings.forEach((booking) => {
          console.log(`   • ${booking.booking_time} - ${booking.client_name} (${booking.status})`)
        })
      }
    }

    // Test the availability API endpoint
    console.log("\n🌐 Testing availability API...")
    try {
      const response = await fetch(
        `${SUPABASE_URL.replace("supabase.co", "supabase.co")}/functions/v1/availability?date=2025-07-31`,
        {
          headers: {
            Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
            "Content-Type": "application/json",
          },
        },
      )

      if (response.ok) {
        const apiData = await response.json()
        console.log("✅ API Response:", JSON.stringify(apiData, null, 2))
      } else {
        console.log("❌ API Error:", response.status, response.statusText)
      }
    } catch (apiError) {
      console.log("❌ API Request failed:", apiError.message)
    }

    console.log("\n📋 SUMMARY:")
    console.log("====================")
    console.log("1. Check if July 31st appears in blocked dates above")
    console.log("2. If it's blocked but showing available, there's a frontend sync issue")
    console.log("3. If it's not blocked, then the frontend is correct")
    console.log("4. Check the API response to see what data is being returned")
  } catch (error) {
    console.log("❌ Unexpected error:", error.message)
  }
}

testAvailabilityAfterRLS()
