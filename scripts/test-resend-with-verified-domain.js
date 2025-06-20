import { Resend } from "resend"

async function testResendWithVerifiedDomain() {
  try {
    const resend = new Resend("re_6eRyz1sp_MSScBs5cg72A3LgUNqTyxTPi")

    console.log("Testing Resend connection with verified domain...")

    // Use Resend's verified domain for testing
    const result = await resend.emails.send({
      from: "onboarding@resend.dev", // This is always verified
      to: "delivered@resend.dev", // This is a test email that won't actually send
      subject: "Connection Test",
      html: "<p>This is a test email to verify API key</p>",
    })

    console.log("✅ Resend API key is valid!")
    console.log("Result:", result)
  } catch (error) {
    console.log("❌ Error details:", error.message)
    console.log("Full error:", error)
  }
}

testResendWithVerifiedDomain()
