// Test script for settings API
const fetch = require("node-fetch")

async function testSettingsAPI() {
  console.log("🔍 Testing Settings API...")

  try {
    // Test GET endpoint
    console.log("\n📥 Testing GET /api/admin/settings")
    const getResponse = await fetch("http://localhost:3000/api/admin/settings")

    if (!getResponse.ok) {
      throw new Error(`GET request failed with status: ${getResponse.status}`)
    }

    const settings = await getResponse.json()
    console.log("✅ GET request successful")
    console.log("📋 Current settings:", JSON.stringify(settings, null, 2))

    // Test PUT endpoint
    console.log("\n📤 Testing PUT /api/admin/settings")
    const updateData = {
      businessName: "Lashed by Deedee",
      businessEmail: "lashedbydeedeee@gmail.com",
      businessPhone: "+234 123 456 7890", // Updated phone number
      businessAddress: "Rumigbo, Port Harcourt, Rivers State",
      businessHours: settings.businessHours || {
        monday: { open: "09:00", close: "18:00", closed: false },
        tuesday: { open: "09:00", close: "18:00", closed: false },
        wednesday: { open: "09:00", close: "18:00", closed: false },
        thursday: { open: "09:00", close: "18:00", closed: false },
        friday: { open: "09:00", close: "18:00", closed: false },
        saturday: { open: "10:00", close: "16:00", closed: false },
        sunday: { open: "12:00", close: "16:00", closed: true },
      },
    }

    const putResponse = await fetch("http://localhost:3000/api/admin/settings", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    })

    if (!putResponse.ok) {
      throw new Error(`PUT request failed with status: ${putResponse.status}`)
    }

    const updateResult = await putResponse.json()
    console.log("✅ PUT request successful")
    console.log("📋 Update result:", updateResult)

    // Verify the update
    console.log("\n🔍 Verifying update...")
    const verifyResponse = await fetch("http://localhost:3000/api/admin/settings")
    const updatedSettings = await verifyResponse.json()

    console.log("📋 Updated settings:", JSON.stringify(updatedSettings, null, 2))

    if (updatedSettings.businessPhone === updateData.businessPhone) {
      console.log("✅ Settings updated successfully!")
    } else {
      console.log("❌ Settings update verification failed")
    }
  } catch (error) {
    console.error("❌ Error testing settings API:", error)
  }
}

testSettingsAPI()
