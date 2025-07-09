const { Resend } = require("resend")

// Test configuration
const TEST_CONFIG = {
  customerEmail: "lashedbydeedeee@gmail.com", // Change this to your actual email
  adminEmails: ["lashedbydeedeee@gmail.com", "bookings@lashedbydeedee.com"],
  resendApiKey: "re_6eRyz1sp_MSScBs5cg72A3LgUNqTyxTPi",
}

// Mock booking data for testing
const mockBookingData = {
  customerName: "Test Customer",
  customerEmail: TEST_CONFIG.customerEmail,
  customerPhone: "+2348123456789",
  services: ["Classic Lashes", "Brow Shaping"],
  bookingDate: "2025-01-20",
  bookingTime: "2:00 PM",
  totalAmount: 25000,
  depositAmount: 12500,
  paymentReference: "LBD_TEST_" + Date.now(),
  notes: "Test booking for professional email system verification",
}

// Initialize Resend
const resend = new Resend(TEST_CONFIG.resendApiKey)

// Customer confirmation email template
function createCustomerEmailHTML(bookingData) {
  const formattedDate = new Date(bookingData.bookingDate + "T12:00:00Z").toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const servicesList = bookingData.services.join(", ")
  const balanceAmount = bookingData.totalAmount - bookingData.depositAmount

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmation - Lashed by Deedee</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f6f9fc;">
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f6f9fc;">
          <div style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #e91e63 0%, #ad1457 100%); padding: 32px 24px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                Lashed by Deedee
              </h1>
              <p style="color: #ffffff; margin: 8px 0 0 0; font-size: 16px; opacity: 0.9;">
                Professional Beauty Services
              </p>
            </div>
            
            <!-- Content -->
            <div style="padding: 32px 24px;">
              
              <!-- Success Message -->
              <div style="text-align: center; margin-bottom: 32px;">
                <div style="background: linear-gradient(135deg, #ff6b6b, #ee5a24); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 40px;">
                  ✨
                </div>
                <h1 style="color: #2c3e50; font-size: 28px; font-weight: bold; margin: 0 0 8px 0;">
                  Booking Confirmed!
                </h1>
                <p style="color: #7f8c8d; font-size: 16px; margin: 0;">
                  We're excited to see you soon!
                </p>
              </div>

              <!-- Personal Greeting -->
              <div style="margin-bottom: 32px;">
                <p style="color: #2c3e50; font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">
                  Hi ${bookingData.customerName},
                </p>
                <p style="color: #34495e; font-size: 16px; line-height: 24px; margin: 0;">
                  Thank you for choosing Lashed by Deedee! Your appointment has been successfully confirmed. We can't wait to enhance your natural beauty and help you look absolutely stunning.
                </p>
              </div>
              
              <!-- Booking Details Card -->
              <div style="background: linear-gradient(135deg, #74b9ff, #0984e3); border-radius: 12px; padding: 24px; margin: 24px 0; color: white;">
                <h2 style="color: #ffffff; font-size: 20px; font-weight: 600; margin: 0 0 20px 0; display: flex; align-items: center;">
                  📅 Appointment Details
                </h2>
                
                <div style="display: grid; gap: 12px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.2);">
                    <span style="font-weight: 500;">Services:</span>
                    <span style="font-weight: 600;">${servicesList}</span>
                  </div>
                  
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.2);">
                    <span style="font-weight: 500;">Date:</span>
                    <span style="font-weight: 600;">${formattedDate}</span>
                  </div>
                  
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.2);">
                    <span style="font-weight: 500;">Time:</span>
                    <span style="font-weight: 600;">${bookingData.bookingTime}</span>
                  </div>
                  
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.2);">
                    <span style="font-weight: 500;">Total Amount:</span>
                    <span style="font-weight: 600; font-size: 18px;">₦${bookingData.totalAmount.toLocaleString()}</span>
                  </div>
                  
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;">
                    <span style="font-weight: 500;">Deposit Paid:</span>
                    <span style="font-weight: 600; color: #00b894;">₦${bookingData.depositAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <!-- Payment Status -->
              <div style="background: #d1f2eb; border-left: 4px solid #00b894; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
                <p style="margin: 0; color: #00695c; font-weight: 600;">
                  💳 Payment Status: Deposit Confirmed
                </p>
                <p style="margin: 8px 0 0 0; color: #00695c; font-size: 14px;">
                  Balance of ₦${balanceAmount.toLocaleString()} due at appointment
                </p>
              </div>

              ${
                bookingData.notes
                  ? `
              <!-- Special Notes -->
              <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
                <p style="margin: 0; color: #856404; font-weight: 600;">
                  📝 Special Notes:
                </p>
                <p style="margin: 8px 0 0 0; color: #856404;">
                  ${bookingData.notes}
                </p>
              </div>
              `
                  : ""
              }

              <!-- Preparation Instructions -->
              <div style="background: #e8f4fd; border-radius: 8px; padding: 20px; margin: 24px 0;">
                <h3 style="color: #2c3e50; font-size: 18px; margin: 0 0 16px 0;">
                  🎯 Preparation for Your Appointment
                </h3>
                <ul style="color: #34495e; margin: 0; padding-left: 20px; line-height: 24px;">
                  <li>Please arrive 5 minutes early</li>
                  <li>Remove any eye makeup before arrival</li>
                  <li>Avoid caffeine 2 hours before your appointment</li>
                  <li>Bring a valid ID for verification</li>
                  <li>Contact us if you need to reschedule</li>
                </ul>
              </div>
              
              <!-- Contact Information -->
              <div style="background: linear-gradient(135deg, #fd79a8, #e84393); border-radius: 12px; padding: 24px; margin: 24px 0; color: white;">
                <h3 style="color: #ffffff; font-size: 18px; margin: 0 0 16px 0;">
                  📞 Contact Information
                </h3>
                
                <div style="display: grid; gap: 12px;">
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 18px;">📍</span>
                    <span>Rumigbo, Port Harcourt, Rivers State</span>
                  </div>
                  
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 18px;">📱</span>
                    <a href="https://wa.me/message/X5M2NOA553NGK1" style="color: #ffffff; text-decoration: none; font-weight: 500;">
                      WhatsApp: Contact Us
                    </a>
                  </div>
                  
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 18px;">📧</span>
                    <a href="mailto:bookings@lashedbydeedee.com" style="color: #ffffff; text-decoration: none; font-weight: 500;">
                      bookings@lashedbydeedee.com
                    </a>
                  </div>
                  
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 18px;">📸</span>
                    <a href="https://www.instagram.com/lashedbydeedee" style="color: #ffffff; text-decoration: none; font-weight: 500;">
                      @lashedbydeedee
                    </a>
                  </div>
                </div>
              </div>

              <!-- Reference Number -->
              <div style="background: linear-gradient(135deg, #e91e63 0%, #ad1457 100%); color: white; padding: 16px; border-radius: 8px; margin: 24px 0; text-align: center;">
                <p style="margin: 0; font-size: 16px; font-weight: bold;">
                  Reference Number: ${bookingData.paymentReference}
                </p>
                <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">
                  Please keep this for your records
                </p>
              </div>

              <!-- Closing Message -->
              <div style="text-align: center; margin: 32px 0;">
                <p style="color: #34495e; font-size: 16px; line-height: 24px; margin: 0 0 16px 0;">
                  We're looking forward to making you look and feel amazing! If you have any questions or need to make changes to your appointment, please don't hesitate to reach out.
                </p>
                
                <div style="margin: 24px 0;">
                  <p style="color: #2c3e50; font-size: 16px; font-style: italic; margin: 0;">
                    Best regards,<br/>
                    <strong>Deedee</strong><br/>
                    <span style="color: #e84393;">Lashed by Deedee ✨</span>
                  </p>
                </div>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background: #2c3e50; padding: 24px; text-align: center;">
              <p style="color: #bdc3c7; font-size: 14px; margin: 0;">
                © 2024 Lashed by Deedee. All rights reserved.
              </p>
              <p style="color: #95a5a6; font-size: 12px; margin: 8px 0 0 0;">
                Professional beauty services in Port Harcourt, Rivers State
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `
}

// Admin notification email template
function createAdminEmailHTML(bookingData) {
  const formattedDate = new Date(bookingData.bookingDate + "T12:00:00Z").toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const servicesList = bookingData.services.join(", ")
  const balanceAmount = bookingData.totalAmount - bookingData.depositAmount

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Booking Alert - Lashed by Deedee</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8f9fa;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            
            <!-- Alert Header -->
            <div style="background: linear-gradient(135deg, #ff6b6b, #ee5a24); padding: 32px 24px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 12px;">🚨</div>
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                New Booking Alert!
              </h1>
              <p style="color: #ffffff; margin: 8px 0 0 0; font-size: 16px; opacity: 0.9;">
                Action Required - New Customer Appointment
              </p>
            </div>
            
            <!-- Content -->
            <div style="padding: 32px;">
              
              <!-- Quick Summary -->
              <div style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 20px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
                <h2 style="color: #1976d2; margin: 0 0 8px 0; font-size: 18px;">
                  📋 Quick Summary
                </h2>
                <p style="color: #1976d2; margin: 0; font-size: 16px; font-weight: 500;">
                  ${bookingData.customerName} booked ${servicesList} for ${formattedDate} at ${bookingData.bookingTime}
                </p>
              </div>

              <!-- Customer Details -->
              <div style="background: #f8f9fa; border-radius: 8px; padding: 24px; margin: 24px 0;">
                <h2 style="color: #2c3e50; font-size: 20px; font-weight: 600; margin: 0 0 20px 0; display: flex; align-items: center;">
                  👤 Customer Information
                </h2>
                
                <div style="display: grid; gap: 12px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #dee2e6;">
                    <span style="font-weight: 500; color: #6c757d;">Name:</span>
                    <span style="font-weight: 600; color: #2c3e50;">${bookingData.customerName}</span>
                  </div>
                  
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #dee2e6;">
                    <span style="font-weight: 500; color: #6c757d;">Email:</span>
                    <a href="mailto:${bookingData.customerEmail}" style="font-weight: 600; color: #007bff; text-decoration: none;">
                      ${bookingData.customerEmail}
                    </a>
                  </div>
                  
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;">
                    <span style="font-weight: 500; color: #6c757d;">Phone:</span>
                    <a href="tel:${bookingData.customerPhone}" style="font-weight: 600; color: #007bff; text-decoration: none;">
                      ${bookingData.customerPhone}
                    </a>
                  </div>
                </div>
              </div>

              <!-- Booking Details -->
              <div style="background: linear-gradient(135deg, #a8e6cf, #7fcdcd); border-radius: 8px; padding: 24px; margin: 24px 0;">
                <h2 style="color: #2c3e50; font-size: 20px; font-weight: 600; margin: 0 0 20px 0; display: flex; align-items: center;">
                  📅 Appointment Details
                </h2>
                
                <div style="display: grid; gap: 12px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid rgba(44,62,80,0.1);">
                    <span style="font-weight: 500; color: #2c3e50;">Services:</span>
                    <span style="font-weight: 600; color: #2c3e50;">${servicesList}</span>
                  </div>
                  
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid rgba(44,62,80,0.1);">
                    <span style="font-weight: 500; color: #2c3e50;">Date:</span>
                    <span style="font-weight: 600; color: #2c3e50; font-size: 16px;">${formattedDate}</span>
                  </div>
                  
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid rgba(44,62,80,0.1);">
                    <span style="font-weight: 500; color: #2c3e50;">Time:</span>
                    <span style="font-weight: 600; color: #2c3e50; font-size: 16px;">${bookingData.bookingTime}</span>
                  </div>
                  
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid rgba(44,62,80,0.1);">
                    <span style="font-weight: 500; color: #2c3e50;">Total Amount:</span>
                    <span style="font-weight: 600; color: #2c3e50; font-size: 18px;">₦${bookingData.totalAmount.toLocaleString()}</span>
                  </div>
                  
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid rgba(44,62,80,0.1);">
                    <span style="font-weight: 500; color: #2c3e50;">Deposit Paid:</span>
                    <span style="font-weight: 600; color: #00b894; font-size: 16px;">₦${bookingData.depositAmount.toLocaleString()}</span>
                  </div>
                  
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;">
                    <span style="font-weight: 500; color: #2c3e50;">Payment Ref:</span>
                    <span style="font-family: monospace; background: #e8f5e8; padding: 4px 8px; border-radius: 4px; color: #059669; font-weight: 600; font-size: 14px;">
                      ${bookingData.paymentReference}
                    </span>
                  </div>
                </div>
              </div>

              ${
                bookingData.notes
                  ? `
              <!-- Special Notes -->
              <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 24px 0; border-radius: 0 8px 8px 0;">
                <h3 style="color: #856404; margin: 0 0 12px 0; font-size: 16px;">
                  📝 Customer Notes:
                </h3>
                <p style="color: #856404; margin: 0; font-style: italic;">
                  "${bookingData.notes}"
                </p>
              </div>
              `
                  : ""
              }

              <!-- Action Items -->
              <div style="background: #d4edda; border-left: 4px solid #28a745; padding: 20px; margin: 24px 0; border-radius: 0 8px 8px 0;">
                <h3 style="color: #155724; margin: 0 0 16px 0; font-size: 18px;">
                  ✅ Next Steps:
                </h3>
                <ul style="color: #155724; margin: 0; padding-left: 20px; line-height: 24px;">
                  <li>Confirm appointment in your calendar</li>
                  <li>Prepare materials for ${servicesList}</li>
                  <li>Send reminder message 24 hours before</li>
                  <li>Verify payment status if needed</li>
                  <li>Update availability calendar</li>
                </ul>
              </div>

              <!-- Quick Actions -->
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin: 24px 0;">
                <a href="mailto:${bookingData.customerEmail}" style="background: #007bff; color: white; padding: 12px 16px; border-radius: 6px; text-decoration: none; text-align: center; font-weight: 500;">
                  📧 Email Customer
                </a>
                <a href="tel:${bookingData.customerPhone}" style="background: #28a745; color: white; padding: 12px 16px; border-radius: 6px; text-decoration: none; text-align: center; font-weight: 500;">
                  📞 Call Customer
                </a>
                <a href="https://wa.me/${bookingData.customerPhone.replace("+", "")}" style="background: #25d366; color: white; padding: 12px 16px; border-radius: 6px; text-decoration: none; text-align: center; font-weight: 500;">
                  💬 WhatsApp
                </a>
              </div>

              <!-- System Info -->
              <div style="border-top: 1px solid #dee2e6; padding-top: 20px; margin-top: 32px;">
                <p style="color: #6c757d; font-size: 14px; font-style: italic; text-align: center; margin: 0;">
                  This notification was sent automatically from your Lashed by Deedee booking system.<br/>
                  Booking received at ${new Date().toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `
}

// Main test function
async function testProfessionalEmailSystem() {
  console.log("🧪 Testing Professional Email System...")
  console.log("============================================================")

  try {
    // Environment check
    console.log("🔧 Environment Check:")
    console.log("RESEND_API_KEY:", TEST_CONFIG.resendApiKey ? "✅ Configured" : "❌ Missing")

    if (!TEST_CONFIG.resendApiKey) {
      console.log("❌ RESEND_API_KEY not found")
      return
    }

    console.log("\n📧 Test Booking Data:")
    console.log("Customer:", mockBookingData.customerName)
    console.log("Email:", mockBookingData.customerEmail)
    console.log("Services:", mockBookingData.services.join(", "))
    console.log("Date & Time:", mockBookingData.bookingDate, "at", mockBookingData.bookingTime)
    console.log("Amount:", `₦${mockBookingData.totalAmount.toLocaleString()}`)
    console.log("Reference:", mockBookingData.paymentReference)

    console.log("\n📧 Sending Customer Confirmation Email...")
    console.log("============================================================")

    // Send customer confirmation email
    const customerEmailResult = await resend.emails.send({
      from: "Lashed by Deedee <bookings@lashedbydeedee.com>",
      to: [TEST_CONFIG.customerEmail],
      subject: `Booking Confirmed - ${mockBookingData.bookingDate}`,
      html: createCustomerEmailHTML(mockBookingData),
    })

    console.log("✅ Customer email sent successfully!")
    console.log("📧 Email ID:", customerEmailResult.data?.id)
    console.log("📬 Sent to:", TEST_CONFIG.customerEmail)

    console.log("\n📧 Sending Admin Notification Email...")
    console.log("============================================================")

    // Send admin notification email
    const adminEmailResult = await resend.emails.send({
      from: "Lashed by Deedee <bookings@lashedbydeedee.com>",
      to: TEST_CONFIG.adminEmails,
      subject: `🔔 New Booking: ${mockBookingData.customerName} - ${mockBookingData.bookingDate} at ${mockBookingData.bookingTime}`,
      html: createAdminEmailHTML(mockBookingData),
    })

    console.log("✅ Admin email sent successfully!")
    console.log("📧 Email ID:", adminEmailResult.data?.id)
    console.log("📬 Sent to:", TEST_CONFIG.adminEmails.join(", "))

    console.log("\n🎉 SUCCESS! Both professional emails sent successfully!")
    console.log("============================================================")
    console.log("📧 Customer Confirmation Email: Professional booking confirmation")
    console.log("📧 Admin Notification Email: New booking alert with action items")
    console.log("💡 Check your email inbox to see both professional emails!")
    console.log("\n🚀 Your professional email system is ready for live bookings!")
  } catch (error) {
    console.error("❌ Error sending emails:", error)
    console.error("Stack trace:", error.stack)
  }
}

// Run the test
testProfessionalEmailSystem()
