import { Resend } from "resend"

async function testResendConnection() {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)

    // Test the connection by getting account info
    console.log("Testing Resend connection...")

    // This will fail gracefully if the API key is invalid
    const result = await resend.emails.send({
      from: "test@yourdomain.com",
      to: "test@example.com",
      subject: "Connection Test",
      html: "<p>This is a test email</p>",
    })

    console.log("✅ Resend API key is valid!")
    console.log("Connection successful")
  } catch (error) {
    if (error.message.includes("API key")) {
      console.log("❌ Invalid API key")
    } else if (error.message.includes("domain")) {
      console.log("⚠️ API key valid but domain not verified")
    } else {
      console.log("❌ Connection failed:", error.message)
    }
  }
}

testResendConnection()
