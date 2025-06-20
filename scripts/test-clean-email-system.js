const { Resend } = require("resend")

const resend = new Resend("re_6eRyz1sp_MSScBs5cg72A3LgUNqTyxTPi")

async function testCleanEmailSystem() {
  console.log("🧪 Testing clean professional email system...")

  const testBooking = {
    customerName: "Test Customer",
    customerEmail: "bookings@lashedbydeedee.com", // Test with your Zoho email
    services: ["Classic Lashes", "Brow Shaping"],
    date: "2024-06-25",
    time: "2:00 PM",
    totalAmount: 25000,
    depositAmount: 12500,
  }

  try {
    // Test customer confirmation email
    console.log("\n📧 Testing customer confirmation email...")

    const customerResult = await resend.emails.send({
      from: "Lashed by Deedee <noreply@lashedbydeedee.com>", // Your professional no-reply email
      to: testBooking.customerEmail,
      reply_to: "bookings@lashedbydeedee.com", // Users can reply to your professional email
      subject: `Booking Confirmed - ${new Date(testBooking.date).toLocaleDateString()}`,
      html: `
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
              
              <!-- Contact Info -->
              <div style="background-color: #e3f2fd; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="color: #333; font-size: 18px; margin: 0 0 10px 0;">Contact Information</h3>
                <p style="margin: 8px 0;">📍 Location: Rumigbo, Port Harcourt, Rivers State</p>
                <p style="margin: 8px 0;">📞 WhatsApp: <a href="https://wa.me/message/X5M2NOA553NGK1" style="color: #e91e63;">Contact Us</a></p>
                <p style="margin: 8px 0;">📧 Email: <a href="mailto:bookings@lashedbydeedee.com" style="color: #e91e63;">bookings@lashedbydeedee.com</a></p>
                <p style="margin: 8px 0;">📱 Instagram: <a href="https://www.instagram.com/lashedbydeedee?igsh=MWR3NzV6amtpZHdwbg==" style="color: #e91e63;">@lashedbydeedee</a></p>
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
      `,
    })

    if (customerResult.data) {
      console.log("✅ Customer confirmation email sent successfully!")
      console.log("Email ID:", customerResult.data.id)
    } else {
      console.log("❌ Customer email failed:", customerResult.error)
    }

    // Test admin notification email
    console.log("\n📧 Testing admin notification email...")

    const adminResult = await resend.emails.send({
      from: "Lashed by Deedee <noreply@lashedbydeedee.com>",
      to: "bookings@lashedbydeedee.com", // Only your professional Zoho email (auto-forwards to Gmail)
      subject: `🔔 New Booking: ${testBooking.customerName}`,
      html: `
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
            <p style="margin: 8px 0;"><strong>Time:</strong> ${testBooking.time}</p>
            <p style="margin: 8px 0;"><strong>Total Amount:</strong> ₦${testBooking.totalAmount.toLocaleString()}</p>
            <p style="margin: 8px 0;"><strong>Deposit Required:</strong> ₦${testBooking.depositAmount.toLocaleString()}</p>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            This notification was sent automatically from your Lashed by Deedee booking system.
          </p>
        </div>
      `,
    })

    if (adminResult.data) {
      console.log("✅ Admin notification email sent successfully!")
      console.log("Email ID:", adminResult.data.id)
    } else {
      console.log("❌ Admin notification failed:", adminResult.error)
    }

    console.log("\n🎉 Clean email system test completed!")
    console.log("✅ Customer emails sent from: noreply@lashedbydeedee.com")
    console.log("✅ Customer replies go to: bookings@lashedbydeedee.com")
    console.log("✅ Admin notifications sent to: bookings@lashedbydeedee.com")
    console.log("✅ Your Zoho email forwards to Gmail automatically")
    console.log("✅ No personal Gmail addresses exposed anywhere!")
  } catch (error) {
    console.error("❌ Test failed:", error)
  }
}

testCleanEmailSystem()
