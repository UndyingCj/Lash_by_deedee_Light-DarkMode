console.log("🌐 Testing Live Site API...")
console.log("================================")

async function testLiveAPI() {
  const baseUrl = "https://lashedbydeedee.com"

  try {
    console.log("🔍 Testing availability API...")
    const response = await fetch(`${baseUrl}/api/admin/availability`)

    console.log("📊 Response status:", response.status)
    console.log("📊 Response headers:", Object.fromEntries(response.headers.entries()))

    if (response.ok) {
      const data = await response.json()
      console.log("✅ API Response:", JSON.stringify(data, null, 2))

      if (data.success) {
        console.log("🎉 SUCCESS: API is working!")
        console.log(`📅 Blocked dates: ${data.blockedDates?.length || 0}`)
        console.log(`⏰ Blocked slots: ${data.blockedSlots?.length || 0}`)
      } else {
        console.log("❌ API returned success: false")
        console.log("Error:", data.error)
      }
    } else {
      const errorText = await response.text()
      console.log("❌ API Error Response:", errorText)
    }
  } catch (error) {
    console.log("❌ Network Error:", error.message)
    console.log("💡 This could be:")
    console.log("   - CORS issues")
    console.log("   - API route not deployed")
    console.log("   - Environment variables missing")
  }
}

async function testOtherEndpoints() {
  const baseUrl = "https://lashedbydeedee.com"
  const endpoints = ["/api/admin/stats", "/api/admin/bookings", "/api/admin/calendar"]

  console.log("\n🔍 Testing other API endpoints...")

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${baseUrl}${endpoint}`)
      console.log(`${endpoint}: ${response.status} ${response.statusText}`)
    } catch (error) {
      console.log(`${endpoint}: ❌ ${error.message}`)
    }
  }
}

// Run tests
testLiveAPI()
  .then(() => {
    return testOtherEndpoints()
  })
  .then(() => {
    console.log("\n🏁 Live site testing complete!")
  })
