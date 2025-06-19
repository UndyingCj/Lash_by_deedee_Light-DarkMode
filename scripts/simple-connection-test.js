console.log("🔍 SIMPLE CONNECTION TEST")
console.log("========================")

// Check if we can load the Supabase package
try {
  console.log("1. Checking if @supabase/supabase-js is available...")
  const { createClient } = require("@supabase/supabase-js")
  console.log("✅ @supabase/supabase-js loaded successfully")
} catch (error) {
  console.log("❌ Failed to load @supabase/supabase-js:", error.message)
  console.log("💡 Try running: npm install @supabase/supabase-js")
}

// Test basic client creation
try {
  console.log("2. Creating Supabase client...")
  const { createClient } = require("@supabase/supabase-js")

  const supabase = createClient(
    "https://cqnfxvgdamevrvlniryr.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbmZ4dmdkYW1ldnJ2bG5pcnlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTMyNzEwMSwiZXhwIjoyMDY0OTAzMTAxfQ.T0TUi8QEh-d7L-P4lCqHoX7l7rVS99SNaoTomqInJyI",
  )
  console.log("✅ Supabase client created successfully")

  // Test a simple query
  console.log("3. Testing simple query...")
  supabase
    .from("blocked_dates")
    .select("count(*)", { count: "exact", head: true })
    .then(({ data, error, count }) => {
      if (error) {
        console.log("❌ Query failed:", error.message)
        console.log("🔍 Error details:", JSON.stringify(error, null, 2))
      } else {
        console.log("✅ Query successful! Found", count, "blocked dates")
        console.log("🎉 Database connection is working!")
      }
    })
    .catch((err) => {
      console.log("❌ Promise rejected:", err.message)
    })
} catch (error) {
  console.log("❌ Failed to create client:", error.message)
}

console.log("4. Test completed - check results above")
