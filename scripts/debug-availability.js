import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase environment variables")
  console.log("SUPABASE_URL:", supabaseUrl ? "✅ Set" : "❌ Missing")
  console.log("SUPABASE_SERVICE_ROLE_KEY:", supabaseKey ? "✅ Set" : "❌ Missing")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugAvailability() {
  console.log("🔍 DEBUGGING AVAILABILITY DATA...\n")

  try {
    // 1. Check all blocked dates
    console.log("📅 CHECKING ALL BLOCKED DATES:")
    const { data: blockedDates, error: blockedError } = await supabase
      .from("blocked_dates")
      .select("*")
      .order("date", { ascending: true })

    if (blockedError) {
      console.error("❌ Error fetching blocked dates:", blockedError)
      return
    }

    console.log(`Found ${blockedDates?.length || 0} blocked dates:`)
    blockedDates?.forEach((date) => {
      console.log(`  - ${date.date} (${date.reason || "No reason"})`)
    })

    // 2. Specifically check July 31st, 2025
    console.log("\n🎯 CHECKING JULY 31ST, 2025 SPECIFICALLY:")
    const { data: july31, error: july31Error } = await supabase
      .from("blocked_dates")
      .select("*")
      .eq("date", "2025-07-31")

    if (july31Error) {
      console.error("❌ Error checking July 31st:", july31Error)
    } else {
      if (july31 && july31.length > 0) {
        console.log("🔴 July 31st IS BLOCKED in database:", july31[0])
      } else {
        console.log("🟢 July 31st is NOT BLOCKED in database")
      }
    }

    // 3. Check all bookings for July 31st
    console.log("\n📋 CHECKING BOOKINGS FOR JULY 31ST:")
    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("*")
      .eq("date", "2025-07-31")

    if (bookingsError) {
      console.error("❌ Error fetching bookings:", bookingsError)
    } else {
      console.log(`Found ${bookings?.length || 0} bookings for July 31st:`)
      bookings?.forEach((booking) => {
        console.log(`  - ${booking.time} - ${booking.service} (${booking.status})`)
      })
    }

    // 4. Test the API endpoint directly
    console.log("\n🌐 TESTING API ENDPOINT:")
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/admin/availability`,
      )
      const apiData = await response.json()

      console.log("API Response Status:", response.status)
      console.log("API Response Data:", JSON.stringify(apiData, null, 2))

      // Check if July 31st is in the API response
      const july31InApi = apiData.blockedDates?.includes("2025-07-31")
      console.log(`July 31st in API blocked dates: ${july31InApi ? "🔴 YES" : "🟢 NO"}`)
    } catch (apiError) {
      console.error("❌ Error testing API:", apiError.message)
    }

    // 5. Summary
    console.log("\n📊 SUMMARY:")
    console.log("=".repeat(50))
    const july31Blocked = july31 && july31.length > 0
    console.log(`July 31st blocked in database: ${july31Blocked ? "🔴 YES" : "🟢 NO"}`)
    console.log(`Total blocked dates: ${blockedDates?.length || 0}`)
    console.log(`Total July 31st bookings: ${bookings?.length || 0}`)
  } catch (error) {
    console.error("❌ Debug failed:", error)
  }
}

// Run the debug
debugAvailability()
