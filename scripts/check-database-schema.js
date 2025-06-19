import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://cqnfxvgdamevrvlniryr.supabase.co"
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbmZ4dmdkYW1ldnJ2bG5pcnlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTMyNzEwMSwiZXhwIjoyMDY0OTAzMTAxfQ.T0TUi8QEh-d7L-P4lCqHoX7l7rVS99SNaoTomqInJyI"

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSchema() {
  console.log("🔍 CHECKING DATABASE SCHEMA")
  console.log("===========================")

  try {
    // Check blocked_dates table schema
    console.log("📊 Checking blocked_dates table schema...")
    const { data: blockedDatesSchema, error: error1 } = await supabase.rpc("get_table_schema", {
      table_name: "blocked_dates",
    })

    if (error1) {
      // Fallback method - query information_schema
      console.log("📋 Using information_schema to check column types...")
      const { data: columnInfo, error: error2 } = await supabase
        .from("information_schema.columns")
        .select("column_name, data_type, is_nullable")
        .eq("table_name", "blocked_dates")
        .eq("table_schema", "public")

      if (error2) {
        console.log("❌ Could not check schema:", error2.message)
        console.log("🔧 Let's check by querying the table directly...")

        // Direct query to see what we get
        const { data: sampleData, error: error3 } = await supabase.from("blocked_dates").select("*").limit(1)

        if (error3) {
          console.log("❌ Could not query table:", error3.message)
        } else {
          console.log("📊 Sample data from blocked_dates:")
          console.log(sampleData)
          if (sampleData && sampleData.length > 0) {
            const dateValue = sampleData[0].blocked_date
            console.log("🔍 blocked_date value:", dateValue)
            console.log("🔍 Type:", typeof dateValue)

            // Check if it looks like a timestamp
            if (typeof dateValue === "string" && dateValue.includes("T")) {
              console.log("🚨 PROBLEM FOUND: blocked_date contains timestamp data!")
              console.log("💡 This confirms the timezone issue")
            } else {
              console.log("✅ blocked_date appears to be date-only")
            }
          }
        }
      } else {
        console.log("📋 Column information:")
        columnInfo?.forEach((col) => {
          console.log(`  ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`)
          if (col.column_name === "blocked_date" && col.data_type.includes("timestamp")) {
            console.log("🚨 PROBLEM FOUND: blocked_date is timestamptz!")
            console.log("💡 This is causing the timezone conversion issue")
          }
        })
      }
    }

    // Check blocked_time_slots table too
    console.log("\n📊 Checking blocked_time_slots table schema...")
    const { data: sampleSlots, error: error4 } = await supabase.from("blocked_time_slots").select("*").limit(1)

    if (error4) {
      console.log("❌ Could not query blocked_time_slots:", error4.message)
    } else {
      console.log("📊 Sample data from blocked_time_slots:")
      console.log(sampleSlots)
      if (sampleSlots && sampleSlots.length > 0) {
        const dateValue = sampleSlots[0].blocked_date
        console.log("🔍 blocked_date value:", dateValue)
        if (typeof dateValue === "string" && dateValue.includes("T")) {
          console.log("🚨 PROBLEM FOUND: blocked_time_slots also has timestamp data!")
        }
      }
    }

    console.log("\n🎯 DIAGNOSIS:")
    console.log("If you see timestamp values (with T and time), that's the problem!")
    console.log("The solution is to change the column type from timestamptz to date.")
  } catch (error) {
    console.log("❌ Schema check failed:", error.message)
  }
}

checkSchema()
