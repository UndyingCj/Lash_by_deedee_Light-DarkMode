// Script to manually block July 31st if it should be blocked
import { supabaseAdmin } from "../lib/supabase-admin.js"

async function fixJuly31st() {
  console.log("🔧 Fixing July 31st availability...\n")

  try {
    // First check if it's already blocked
    const { data: existing, error: checkError } = await supabaseAdmin
      .from("blocked_dates")
      .select("*")
      .eq("blocked_date", "2025-07-31")

    if (checkError) {
      console.error("❌ Error checking existing data:", checkError)
      return
    }

    if (existing && existing.length > 0) {
      console.log("ℹ️ July 31st is already blocked in database:")
      existing.forEach((record) => {
        console.log(`   - ID: ${record.id}, Reason: ${record.reason}`)
      })
      console.log("\n🤔 The issue might be with the API or frontend sync.")
    } else {
      console.log("📝 July 31st is NOT blocked. Adding it now...")

      const { data: newBlock, error: insertError } = await supabaseAdmin
        .from("blocked_dates")
        .insert([
          {
            blocked_date: "2025-07-31",
            reason: "Manually blocked - sync fix",
          },
        ])
        .select()
        .single()

      if (insertError) {
        console.error("❌ Error blocking July 31st:", insertError)
      } else {
        console.log("✅ Successfully blocked July 31st!")
        console.log("📊 New record:", newBlock)
      }
    }

    // Test the API after the change
    console.log("\n🧪 Testing API after change...")

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/admin/availability`,
      )
      const apiData = await response.json()

      const july31InAPI = apiData.blockedDates?.some((date) => date.blocked_date === "2025-07-31")
      console.log(`🎯 July 31st now in API: ${july31InAPI ? "🚫 YES (BLOCKED)" : "❌ NO (STILL AVAILABLE)"}`)
    } catch (apiError) {
      console.error("❌ Error testing API:", apiError)
    }
  } catch (error) {
    console.error("❌ Fatal error:", error)
  }
}

// Run the fix
fixJuly31st()
