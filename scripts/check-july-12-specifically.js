import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://cqnfxvgdamevrvlniryr.supabase.co"
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbmZ4dmdkYW1ldnJ2bG5pcnlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTMyNzEwMSwiZXhwIjoyMDY0OTAzMTAxfQ.T0TUi8QEh-d7L-P4lCqHoX7l7rVS99SNaoTomqInJyI"

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkJuly12() {
  console.log("🔍 JULY 12TH SPECIFIC ANALYSIS")
  console.log("==============================")

  try {
    // Get all blocked dates
    const { data: allDates, error } = await supabase.from("blocked_dates").select("*").order("blocked_date")

    if (error) {
      console.log("❌ Error:", error.message)
      return
    }

    console.log("📋 All blocked dates in database:")
    allDates.forEach((date, index) => {
      const isJuly12 = date.blocked_date.includes("2025-07-12") || date.blocked_date.includes("07-12")
      console.log(`   ${index + 1}. ${date.blocked_date} ${isJuly12 ? "👈 THIS IS JULY 12!" : ""}`)
    })

    // Try to unblock July 12th if it exists
    console.log("\n🔄 Attempting to unblock July 12th...")
    const { data: deleteResult, error: deleteError } = await supabase
      .from("blocked_dates")
      .delete()
      .eq("blocked_date", "2025-07-12")
      .select()

    if (deleteError) {
      console.log("❌ Delete failed:", deleteError.message)
    } else if (deleteResult.length > 0) {
      console.log("✅ Successfully unblocked July 12th!")
      console.log("   Deleted:", deleteResult[0])

      // Now try to block it again
      console.log("\n🔄 Re-blocking July 12th to test...")
      const { data: insertResult, error: insertError } = await supabase
        .from("blocked_dates")
        .insert({
          blocked_date: "2025-07-12",
          reason: "Re-blocked for testing",
        })
        .select()
        .single()

      if (insertError) {
        console.log("❌ Re-block failed:", insertError.message)
      } else {
        console.log("✅ Re-blocked successfully!")
        console.log("   Input:  2025-07-12")
        console.log("   Stored:", insertResult.blocked_date)
        console.log("   Match: ", insertResult.blocked_date === "2025-07-12" ? "✅ PERFECT!" : "❌ MISMATCH!")
      }
    } else {
      console.log("⚠️ July 12th was not found to delete")

      // Try to block it fresh
      console.log("\n🔄 Blocking July 12th fresh...")
      const { data: insertResult, error: insertError } = await supabase
        .from("blocked_dates")
        .insert({
          blocked_date: "2025-07-12",
          reason: "Fresh block for testing",
        })
        .select()
        .single()

      if (insertError) {
        console.log("❌ Fresh block failed:", insertError.message)
        if (insertError.message.includes("duplicate key")) {
          console.log("💡 July 12th is already blocked with a different format!")
        }
      } else {
        console.log("✅ Fresh block successful!")
        console.log("   Stored:", insertResult.blocked_date)
      }
    }
  } catch (error) {
    console.log("❌ Analysis failed:", error.message)
  }
}

checkJuly12()
