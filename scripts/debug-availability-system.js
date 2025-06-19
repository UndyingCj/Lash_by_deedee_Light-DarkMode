// Comprehensive debugging script for availability system
const { createClient } = require("@supabase/supabase-js")

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing environment variables")
  console.log("SUPABASE_URL:", supabaseUrl ? "✅ Set" : "❌ Missing")
  console.log("SERVICE_KEY:", supabaseServiceKey ? "✅ Set" : "❌ Missing")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function debugAvailabilitySystem() {
  console.log("🔍 DEBUGGING AVAILABILITY SYSTEM")
  console.log("================================")

  try {
    // 1. Test database connection
    console.log("\n1️⃣ Testing database connection...")
    const { data: connectionTest, error: connectionError } = await supabase.from("bookings").select("count(*)").limit(1)

    if (connectionError) {
      console.error("❌ Database connection failed:", connectionError)
      return
    }
    console.log("✅ Database connection successful")

    // 2. Check if tables exist
    console.log("\n2️⃣ Checking if tables exist...")

    const { data: blockedDatesCheck, error: blockedDatesError } = await supabase
      .from("blocked_dates")
      .select("count(*)")
      .limit(1)

    if (blockedDatesError) {
      console.error("❌ blocked_dates table issue:", blockedDatesError)
    } else {
      console.log("✅ blocked_dates table exists")
    }

    const { data: blockedSlotsCheck, error: blockedSlotsError } = await supabase
      .from("blocked_time_slots")
      .select("count(*)")
      .limit(1)

    if (blockedSlotsError) {
      console.error("❌ blocked_time_slots table issue:", blockedSlotsError)
    } else {
      console.log("✅ blocked_time_slots table exists")
    }

    // 3. Check current blocked dates
    console.log("\n3️⃣ Current blocked dates in database...")
    const { data: blockedDates, error: blockedDatesSelectError } = await supabase
      .from("blocked_dates")
      .select("*")
      .order("blocked_date")

    if (blockedDatesSelectError) {
      console.error("❌ Error fetching blocked dates:", blockedDatesSelectError)
    } else {
      console.log("📅 Blocked dates:", blockedDates)
    }

    // 4. Check current blocked time slots
    console.log("\n4️⃣ Current blocked time slots in database...")
    const { data: blockedSlots, error: blockedSlotsSelectError } = await supabase
      .from("blocked_time_slots")
      .select("*")
      .order("blocked_date", "blocked_time")

    if (blockedSlotsSelectError) {
      console.error("❌ Error fetching blocked slots:", blockedSlotsSelectError)
    } else {
      console.log("⏰ Blocked slots:", blockedSlots)
    }

    // 5. Test adding a blocked date
    console.log("\n5️⃣ Testing adding a blocked date...")
    const testDate = "2025-06-20"

    const { data: insertResult, error: insertError } = await supabase
      .from("blocked_dates")
      .upsert(
        [
          {
            blocked_date: testDate,
            reason: "Debug test - " + new Date().toISOString(),
          },
        ],
        {
          onConflict: "blocked_date",
        },
      )
      .select()

    if (insertError) {
      console.error("❌ Error inserting test date:", insertError)
    } else {
      console.log("✅ Test date inserted:", insertResult)
    }

    // 6. Test the API endpoint
    console.log("\n6️⃣ Testing API endpoint...")
    try {
      const apiResponse = await fetch("http://localhost:3000/api/admin/availability", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (apiResponse.ok) {
        const apiData = await apiResponse.json()
        console.log("✅ API response:", JSON.stringify(apiData, null, 2))
      } else {
        console.error("❌ API response error:", apiResponse.status, apiResponse.statusText)
        const errorText = await apiResponse.text()
        console.error("Error details:", errorText)
      }
    } catch (apiError) {
      console.error("❌ API request failed:", apiError.message)
      console.log("💡 This might be normal if the dev server is not running")
    }

    // 7. Check RLS policies
    console.log("\n7️⃣ Checking RLS policies...")
    const { data: rlsCheck, error: rlsError } = await supabase.rpc("check_rls_status").single()

    if (rlsError) {
      console.log("⚠️ Could not check RLS status (this might be normal)")
    } else {
      console.log("🔒 RLS status:", rlsCheck)
    }

    // 8. Final verification
    console.log("\n8️⃣ Final verification - fetching all data again...")
    const { data: finalBlockedDates } = await supabase.from("blocked_dates").select("*")

    const { data: finalBlockedSlots } = await supabase.from("blocked_time_slots").select("*")

    console.log("📊 FINAL STATE:")
    console.log("Blocked dates:", finalBlockedDates?.length || 0, "entries")
    console.log("Blocked slots:", finalBlockedSlots?.length || 0, "entries")

    if (finalBlockedDates?.length > 0) {
      console.log(
        "📅 Dates:",
        finalBlockedDates.map((d) => d.blocked_date),
      )
    }

    if (finalBlockedSlots?.length > 0) {
      console.log(
        "⏰ Slots:",
        finalBlockedSlots.map((s) => `${s.blocked_date} ${s.blocked_time}`),
      )
    }
  } catch (error) {
    console.error("💥 Unexpected error:", error)
  }
}

// Run the debug
debugAvailabilitySystem()
