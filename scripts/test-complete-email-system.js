const { Resend } = require("resend")

const resend = new Resend(process.env.RESEND_API_KEY || "re_6eRyz1sp_MSScBs5cg72A3LgUNqTyxTPi")

async function testCompleteEmailSystem() {
  console.log("🧪 Testing complete email system...")

  const testBooking = {
    customerName: "Test Customer",
    customerEmail: "lashedbydeedeee@gmail.com",
    services: ["Classic Lashes", "Brow Shaping"],
    date: "2024-06-25",
    time: "2:00 PM",
    totalAmount: 25000,
    depositAmount: 12500,
  }

  try {
    // Test customer confirmation email
    console.log("\n📧 Testing customer confirmation email...")

    const customerEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f6f9fc;">
        <div style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
          <!-- Header -->
          <div style="background-color: #000000; padding: 32px 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Lashed by Deedee</h1>
          </div>
          
          <!-- Content -->
          <div style="padding: 24px;">
            <h1 style="color: #333; font-size: 24px; text-align: center; margin: 30px 0;">Booking Confirmed! 💕</h1>
            
            <p style="color: #333; font-size: 16px; line-height: 26px;">Hi ${testBooking.customerName},</p>
            
            <p style="color: #333; font-size: 16px; line-height: 26px;">Thank you for booking with Lashed by Deedee! Your appointment has been confirmed.</p>
            
            <!-- Booking Details -->
            <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h2 style="color: #333; font-size: 20px; margin: 0 0 15px 0;">Booking Details</h2>
              <p style="margin: 8px 0;"><strong>Services:</strong> ${testBooking.services.join(", ")}</p>
              <p style="margin: 8px 0;"><strong>Date:</strong> ${new Date(testBooking.date).toLocaleDateString(
                "en-US",
                {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                },
              )}</p>
              <p style="margin: 8px 0;"><strong>Time:</strong> ${testBooking.time}</p>
              <p style="margin: 8px 0;"><strong>Total Amount:</strong> ₦${testBooking.totalAmount.toLocaleString()}</p>
              <p style="margin: 8px 0;"><strong>Deposit Required:</strong> ₦${testBooking.depositAmount.toLocaleString()}</p>
            </div>
            
            <!-- Important Info -->
            <div style="background-color: #fff3cd; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #ffeaa7;">
              <h3 style="color: #333; font-size: 18px; margin: 0 0 10px 0;">Important Information</h3>
              <p style="margin: 8px 0;">• Please arrive 10 minutes early for your appointment</p>
              <p style="margin: 8px 0;">• A deposit of ₦${testBooking.depositAmount.toLocaleString()} is required to secure your booking</p>
              <p style="margin: 8px 0;">• Cancellations must be made 24 hours in advance</p>
              <p style="margin: 8px 0;">• Please come with clean lashes/brows (no makeup)</p>
            </div>
            
            <p style="color: #333; font-size: 16px; line-height: 26px;">We can't wait to see you! If you have any questions, please don't hesitate to reach out.</p>
            
            <p style="color: #333; font-size: 16px; line-height: 26px; margin-top: 30px; font-style: italic;">
              Best regards,<br/>
              Deedee<br/>
              Lashed by Deedee ✨
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f8f9fa; padding: 24px; text-align: center;">
            <p style="color: #666; font-size: 12px; margin: 0;">© 2024 Lashed by Deedee. All rights reserved.</p>
          </div>
        </div>
      </div>
    `

    const customerResult = await resend.emails.send({
      from: "Lashed by Deedee <onboarding@resend.dev>",
      to: testBooking.customerEmail,
      subject: `Booking Confirmed - ${new Date(testBooking.date).toLocaleDateString()}`,
      html: customerEmailHtml,
    })

    if (customerResult.data) {
      console.log("✅ Customer confirmation email sent successfully!")
      console.log("Email ID:", customerResult.data.id)
    } else {
      console.log("❌ Customer email failed:", customerResult.error)
    }

    // Test admin notification email
    console.log("\n📧 Testing admin notification email...")

    const adminEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; border-bottom: 2px solid #e91e63; padding-bottom: 10px;">
          New Booking Received! 🎉
        </h2>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Customer Details</h3>
          <p><strong>Name:</strong> ${testBooking.customerName}</p>
          <p><strong>Email:</strong> ${testBooking.customerEmail}</p>
        </div>
        
        <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Booking Details</h3>
          <p><strong>Services:</strong> ${testBooking.services.join(", ")}</p>
          <p><strong>Date:</strong> ${new Date(testBooking.date).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}</p>
          <p><strong>Time:</strong> ${testBooking.time}</p>
          <p><strong>Total Amount:</strong> ₦${testBooking.totalAmount.toLocaleString()}</p>
          <p><strong>Deposit Required:</strong> ₦${testBooking.depositAmount.toLocaleString()}</p>
        </div>
        
        <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #ffeaa7;">
          <p style="margin: 0; color: #856404;">
            <strong>Action Required:</strong> Please confirm this booking and follow up with the customer for deposit payment.
          </p>
        </div>
        
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          This notification was sent automatically from your Lashed by Deedee booking system.
        </p>
      </div>
    `

    const adminResult = await resend.emails.send({
      from: "Lashed by Deedee <onboarding@resend.dev>",
      to: "lashedbydeedeee@gmail.com",
      subject: `🔔 New Booking: ${testBooking.customerName}`,
      html: adminEmailHtml,
    })

    if (adminResult.data) {
      console.log("✅ Admin notification email sent successfully!")
      console.log("Email ID:", adminResult.data.id)
    } else {
      console.log("❌ Admin notification failed:", adminResult.error)
    }

    console.log("\n🎉 Email system test completed!")
    console.log("Check your Gmail inbox (lashedbydeedeee@gmail.com) for both emails!")
  } catch (error) {
    console.error("❌ Test failed:", error)
  }
}

testCompleteEmailSystem()
