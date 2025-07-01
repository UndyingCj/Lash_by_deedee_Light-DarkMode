import fetch from "node-fetch"

async function testSettingsAPI() {
  console.log("🔍 Testing Settings API...")

  try {
    console.log("📥 Testing GET /api/admin/settings")
    const getResponse = await fetch("http://localhost:3000/api/admin/settings")
    const getData = await getResponse.json()

    if (getResponse.ok) {
      console.log("✅ GET request successful")
      console.log("📊 Settings data:", JSON.stringify(getData, null, 2))
    } else {
      console.log("❌ GET request failed:", getData)
    }

    console.log("\n📤 Testing PUT /api/admin/settings")
    const putResponse = await fetch("http://localhost:3000/api/admin/settings", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "business",
        data: {
          id: getData.data?.business?.id,
          businessName: "Lashed by Deedee - Updated",
          businessEmail: "lashedbydeedeee@gmail.com",
        },
      }),
    })

    const putData = await putResponse.json()

    if (putResponse.ok) {
      console.log("✅ PUT request successful")
      console.log("📊 Updated data:", JSON.stringify(putData, null, 2))
    } else {
      console.log("❌ PUT request failed:", putData)
    }
  } catch (error) {
    console.error("❌ Error testing settings API:", error)
  }
}

testSettingsAPI()
