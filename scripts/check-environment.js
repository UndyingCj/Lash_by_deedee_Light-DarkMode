console.log("🔍 ENVIRONMENT CHECK")
console.log("===================")

console.log("Node.js version:", process.version)
console.log("Platform:", process.platform)
console.log("Timezone:", Intl.DateTimeFormat().resolvedOptions().timeZone)

console.log("\n📋 Environment Variables:")
console.log("NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing")
console.log("SUPABASE_SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅ Set" : "❌ Missing")

console.log("\n📅 Date Handling Test:")
const testDate = "2025-07-12"
console.log("Input string:", testDate)
console.log("new Date(testDate):", new Date(testDate))
console.log("new Date(testDate).toISOString():", new Date(testDate).toISOString())
console.log("new Date(testDate).toISOString().split('T')[0]:", new Date(testDate).toISOString().split("T")[0])

console.log("\n🌍 Timezone Test:")
const now = new Date()
console.log("Current time (local):", now.toString())
console.log("Current time (UTC):", now.toUTCString())
console.log("Current time (ISO):", now.toISOString())
