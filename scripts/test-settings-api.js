// Test script for settings API
import fetch from "node-fetch"

async function testSettingsAPI() {
  console.log("🔍 Testing Settings API...")

  try {
    // Test GET endpoint
    console.log("\n📥 Testing GET /api/admin/settings")
    const getResponse = await fetch("http://localhost:3000/api/admin/settings")

    if (!getResponse.ok) {
      console.error(`❌ GET request failed with status: ${getResponse.status}`)
      const errorText = await getResponse.text()
      console.error("Error response:", errorText)
      return
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
      notificationSettings: settings.notificationSettings || {
        emailNotifications: true,
        smsNotifications: false,
        bookingConfirmations: true,
        reminderNotifications: true,
        cancelationNotifications: true,
        reminderHours: 24,
      },
      securitySettings: settings.securitySettings || {
        twoFactorEnabled: false,
        sessionTimeout: 24,
        passwordExpiry: 90,
        loginAttempts: 5,
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
      console.error(`❌ PUT request failed with status: ${putResponse.status}`)
      const errorText = await putResponse.text()
      console.error("Error response:", errorText)
      return
    }

    const updateResult = await putResponse.json()
    console.log("✅ PUT request successful")
    console.log("📋 Update result:", updateResult)

    // Verify the update
    console.log("\n🔍 Verifying update...")
    const verifyResponse = await fetch("http://localhost:3000/api/admin/settings")

    if (!verifyResponse.ok) {
      console.error(`❌ Verification request failed with status: ${verifyResponse.status}`)
      return
    }

    const updatedSettings = await verifyResponse.json()
    console.log("📋 Updated settings:", JSON.stringify(updatedSettings, null, 2))

    if (updatedSettings.businessPhone === updateData.businessPhone) {
      console.log("✅ Settings updated successfully!")
    } else {
      console.log("❌ Settings update verification failed")
      console.log("Expected phone:", updateData.businessPhone)
      console.log("Actual phone:", updatedSettings.businessPhone)
    }
  } catch (error) {
    console.error("❌ Error testing settings API:", error)
  }
}

testSettingsAPI()
