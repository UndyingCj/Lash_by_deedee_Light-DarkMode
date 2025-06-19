// Test the actual API endpoint
async function testLiveAPI() {
  console.log("🌐 TESTING LIVE API ENDPOINT")
  console.log("============================")

  try {
    // Test the availability API
    console.log("📡 Calling /api/admin/availability...")

    const response = await fetch("http://localhost:3000/api/admin/availability", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
    })

    if (!response.ok) {
      console.log("❌ API call failed:", response.status, response.statusText)
      const errorText = await response.text()
      console.log("Error details:", errorText)
      return
    }

    const data = await response.json()
    console.log("✅ API call successful!")
    console.log("Response data:", JSON.stringify(data, null, 2))

    // Test POST to block a date
    console.log("\n📝 Testing POST to block July 12th...")
    const postResponse = await fetch("http://localhost:3000/api/admin/availability", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "date",
        date: "2025-07-12",
        action: "block",
        reason: "API test",
      }),
    })

    if (postResponse.ok) {
      const postData = await postResponse.json()
      console.log("✅ POST successful!")
      console.log("POST response:", JSON.stringify(postData, null, 2))
    } else {
      console.log("❌ POST failed:", postResponse.status)
      const errorText = await postResponse.text()
      console.log("Error details:", errorText)
    }
  } catch (error) {
    console.log("❌ API test failed:", error.message)

    if (error.message.includes("ECONNREFUSED")) {
      console.log("\n💡 SOLUTION: Start your Next.js development server first!")
      console.log("   Run: npm run dev")
      console.log("   Then run this test again")
    }
  }
}

testLiveAPI()
