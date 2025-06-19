const { createClient } = require("@supabase/supabase-js")

// Your actual credentials
const supabaseUrl = "https://cqnfxvgdamevrvlniryr.supabase.co"
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbmZ4dmdkYW1ldnJ2bG5pcnlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTMyNzEwMSwiZXhwIjoyMDY0OTAzMTAxfQ.T0TUi8QEh-d7L-P4lCqHoX7l7rVS99SNaoTomqInJyI"

console.log("🔧 Testing with your actual Supabase credentials...")
console.log("URL:", supabaseUrl)
console.log("Service Key:", supabaseServiceKey.substring(0, 20) + "...")

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testDateHandling() {
  console.log("\n🧪 TESTING DATE HANDLING WITH REAL KEYS")
  console.log("======================================")

  try {
    // 1. Test connection first
    console.log("1️⃣ Testing database connection...")
    const { data: connectionTest, error: connectionError } = await supabase
      .from("blocked_dates")
      .select("count", { count: "exact", head: true })

    if (connectionError) {
      console.error("❌ Connection failed:", connectionError.message)
      return
    }

    console.log("✅ Database connection successful!")
    console.log(`📊 Current blocked dates count: ${connectionTest}`)

    // 2. Clear any existing test data
    console.log("\n2️⃣ Clearing existing test data...")
    await supabase.from("blocked_dates").delete().eq("reason", "Test with proper DATE format")

    // 3. Test blocking June 20th with proper DATE format
    console.log("\n3️⃣ Blocking June 20th with DATE format...")
    const testDate = "2025-06-20" // Pure DATE string, no timestamp

    const { data: insertResult, error: insertError } = await supabase
      .from("blocked_dates")
      .upsert(
        [
          {
            blocked_date: testDate, // This should stay as 2025-06-20
            reason: "Test with proper DATE format",
          },
        ],
        {
          onConflict: "blocked_date",
        },
      )
      .select()

    if (insertError) {
      console.error("❌ Error inserting:", insertError.message)
      return
    }

    console.log("✅ Inserted successfully:", insertResult)

    // 4. Read it back and verify no date shift
    console.log("\n4️⃣ Reading back to verify no date shift...")
    const { data: readBack, error: readError } = await supabase
      .from("blocked_dates")
      .select("*")
      .eq("blocked_date", testDate)

    if (readError) {
      console.error("❌ Error reading back:", readError.message)
      return
    }

    if (readBack && readBack.length > 0) {
      const storedDate = readBack[0].blocked_date
      console.log(`✅ Original: ${testDate}`)
      console.log(`✅ Stored:   ${storedDate}`)
      console.log(`✅ Match:    ${testDate === storedDate ? "YES" : "NO"}`)

      if (testDate === storedDate) {
        console.log("🎉 DATE HANDLING IS NOW FIXED!")
      } else {
        console.log("❌ Still has date shift issue")
        console.log("   This means the database column is still TIMESTAMPTZ")
        console.log("   Run the fix-date-column-type.sql script first!")
      }
    } else {
      console.log("❌ No data found")
    }

    // 5. Test with a few more dates
    console.log("\n5️⃣ Testing multiple dates...")
    const testDates = ["2025-06-21", "2025-06-22", "2025-06-23"]

    for (const date of testDates) {
      const { error } = await supabase.from("blocked_dates").upsert([{ blocked_date: date, reason: "Multi-date test" }])

      if (!error) {
        console.log(`✅ ${date} blocked successfully`)
      } else {
        console.log(`❌ ${date} failed:`, error.message)
      }
    }

    // 6. Read all blocked dates
    console.log("\n6️⃣ Reading all blocked dates...")
    const { data: allBlocked, error: allError } = await supabase.from("blocked_dates").select("*").order("blocked_date")

    if (allError) {
      console.error("❌ Error reading all dates:", allError.message)
    } else {
      console.log("📋 All blocked dates:")
      allBlocked.forEach((date, index) => {
        console.log(`   ${index + 1}. ${date.blocked_date} (${date.reason})`)
      })
    }

    console.log("\n🎯 NEXT STEPS:")
    console.log("1. Go to /egusi/calendar")
    console.log("2. You should see June 20-23 as blocked dates")
    console.log("3. Go to /book")
    console.log("4. June 20-23 should show as 'Fully Booked'")
  } catch (error) {
    console.error("💥 Test failed:", error.message)
  }
}

testDateHandling()
