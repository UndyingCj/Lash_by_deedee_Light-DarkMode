import { createClient } from "@supabase/supabase-js"

console.log("🔍 TESTING WITH CORRECT SERVICE KEY")
console.log("=".repeat(50))

// Your correct values from Coolify (I can see the partial key in the screenshot)
const SUPABASE_URL = "https://cqnfxvgdamevrvlniryr.supabase.co"

// The service role key from your screenshot appears to be truncated
// Let's try to get it from the environment or you'll need to provide the full key
console.log("🔧 Attempting to connect to Supabase...")
console.log("📍 URL:", SUPABASE_URL)

// Try to get the service role key from environment
let serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!serviceKey) {
  console.log("❌ Service role key not available in environment")
  console.log("📋 Please copy the full SUPABASE_SERVICE_ROLE_KEY from your Coolify dashboard")
  console.log("🔍 It should start with 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'")
  console.log("📝 The key in the screenshot appears to be truncated")

  // Let's try with a placeholder to see what error we get
  console.log("\n🧪 Testing connection format...")
  serviceKey = "PLACEHOLDER_KEY"
}

const supabase = createClient(SUPABASE_URL, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

try {
  console.log("\n1️⃣ Testing connection...")
  const { data, error } = await supabase.from("bookings").select("count(*)", { count: "exact", head: true })

  if (error) {
    console.log("❌ Connection error:", error.message)

    if (error.message.includes("Invalid API key")) {
      console.log("\n🔧 SOLUTION:")
      console.log("1. Go to your Supabase dashboard")
      console.log("2. Settings > API")
      console.log("3. Copy the full 'service_role' key")
      console.log("4. Update your Coolify environment variable")
      console.log("5. Redeploy your application")
    }

    if (error.message.includes("relation") && error.message.includes("does not exist")) {
      console.log("\n🔧 SOLUTION:")
      console.log("1. Your tables don't exist yet")
      console.log("2. Run the table creation script first")
      console.log("3. Then test the connection again")
    }
  } else {
    console.log("✅ Connection successful!")
    console.log(`📊 Found ${data || 0} bookings`)

    // Test blocked dates
    console.log("\n2️⃣ Testing blocked dates...")
    const { data: blockedData, error: blockedError } = await supabase.from("blocked_dates").select("*")

    if (blockedError) {
      console.log("❌ Blocked dates error:", blockedError.message)
    } else {
      console.log("✅ Blocked dates accessible!")
      console.log(`📅 Found ${blockedData?.length || 0} blocked dates`)

      if (blockedData && blockedData.length > 0) {
        console.log("\n📋 Current blocked dates:")
        blockedData.forEach((date) => {
          console.log(`   • ${date.blocked_date} ${date.reason ? `(${date.reason})` : ""}`)
        })
      }
    }
  }
} catch (err) {
  console.log("❌ Unexpected error:", err.message)
}

console.log("\n" + "=".repeat(50))
console.log("🎯 NEXT STEPS:")
console.log("1. Fix the service role key in Coolify")
console.log("2. Make sure all tables exist")
console.log("3. Disable RLS completely")
console.log("4. Test again")
