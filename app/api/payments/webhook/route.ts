import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// Email sending functions
async function sendCustomerConfirmationEmail(bookingData: any) {
  try {
    const { Resend } = await import("resend")
    const resend = new Resend(process.env.RESEND_API_KEY)

    const formattedDate = new Date(bookingData.bookingDate + "T12:00:00Z").toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    const servicesList = Array.isArray(bookingData.services) ? bookingData.services.join(", ") : bookingData.services
    const balanceAmount = bookingData.totalAmount - bookingData.depositAmount

    const emailHtml = `
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
                  </div>
                </div>

                <!-- Reference Number -->
                <div style="background: linear-gradient(135deg, #e91e63 0%, #ad1457 100%); color: white; padding: 16px; border-radius: 8px; margin: 24px 0; text-align: center;">
                  <p style="margin: 0; font-size: 16px; font-weight: bold;">
                    Reference Number: ${bookingData.reference}
                  </p>
                  <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">
                    Please keep this for your records
                  </p>
                </div>
              </div>
              
              <!-- Footer -->
              <div style="background: #2c3e50; padding: 24px; text-align: center;">
                <p style="color: #bdc3c7; font-size: 14px; margin: 0;">
                  © 2024 Lashed by Deedee. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    const result = await resend.emails.send({
      from: "Lashed by Deedee <bookings@lashedbydeedee.com>",
      to: [bookingData.customerEmail],
      subject: `Booking Confirmed - ${formattedDate} at ${bookingData.bookingTime}`,
      html: emailHtml,
    })

    console.log("✅ Customer confirmation email sent:", result.data?.id)
    return { success: true, emailId: result.data?.id }
  } catch (error) {
    console.error("❌ Failed to send customer confirmation email:", error)
    return { success: false, error: error.message }
  }
}

async function sendAdminNotificationEmail(bookingData: any) {
  try {
    const { Resend } = await import("resend")
    const resend = new Resend(process.env.RESEND_API_KEY)

    const formattedDate = new Date(bookingData.bookingDate + "T12:00:00Z").toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    const servicesList = Array.isArray(bookingData.services) ? bookingData.services.join(", ") : bookingData.services

    const emailHtml = `
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
                  <h2 style="color: #2c3e50; font-size: 20px; font-weight: 600; margin: 0 0 20px 0;">
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
                  <h2 style="color: #2c3e50; font-size: 20px; font-weight: 600; margin: 0 0 20px 0;">
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
                        ${bookingData.reference}
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
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    const adminEmails = ["lashedbydeedee@gmail.com", "bookings@lashedbydeedee.com"]

    const result = await resend.emails.send({
      from: "Lashed by Deedee <bookings@lashedbydeedee.com>",
      to: adminEmails,
      subject: `🚨 New Booking: ${bookingData.customerName} - ${formattedDate} at ${bookingData.bookingTime}`,
      html: emailHtml,
    })

    console.log("✅ Admin notification email sent:", result.data?.id)
    return { success: true, emailId: result.data?.id }
  } catch (error) {
    console.error("❌ Failed to send admin notification email:", error)
    return { success: false, error: error.message }
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("🔔 Webhook received from Paystack")

    const body = await request.text()
    const signature = request.headers.get("x-paystack-signature")

    if (!signature) {
      console.error("❌ No signature provided")
      return NextResponse.json({ error: "No signature provided" }, { status: 400 })
    }

    // Verify webhook signature
    const hash = crypto.createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!).update(body).digest("hex")

    if (hash !== signature) {
      console.error("❌ Invalid signature")
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    console.log("✅ Webhook signature verified")

    const event = JSON.parse(body)
    console.log("📋 Webhook event:", event.event)

    // Handle successful payment
    if (event.event === "charge.success") {
      const paymentData = event.data
      const metadata = paymentData.metadata || {}

      console.log("💰 Processing successful payment:", paymentData.reference)
      console.log("📋 Payment metadata:", metadata)

      // Prepare booking data for database
      const bookingData = {
        customer_name: metadata.customerName || "Unknown Customer",
        customer_email: metadata.customerEmail || paymentData.customer?.email || "unknown@email.com",
        customer_phone: metadata.customerPhone || "Unknown Phone",
        services: metadata.services || ["Unknown Service"],
        booking_date: metadata.bookingDate || new Date().toISOString().split("T")[0],
        booking_time: metadata.bookingTime || "Unknown Time",
        total_amount: paymentData.amount / 100, // Convert from kobo to naira
        deposit_amount: paymentData.amount / 100,
        payment_reference: paymentData.reference,
        payment_status: "completed",
        status: "confirmed",
        notes: metadata.notes || null,
        created_at: new Date().toISOString(),
      }

      console.log("💾 Saving booking to database:", bookingData)

      // Save booking to database
      const { data: savedBooking, error: dbError } = await supabase
        .from("bookings")
        .insert([bookingData])
        .select()
        .single()

      if (dbError) {
        console.error("❌ Database error:", dbError)
        return NextResponse.json({ error: "Database error" }, { status: 500 })
      }

      console.log("✅ Booking saved successfully:", savedBooking.id)

      // Block the time slot
      const blockingData = {
        blocked_date: bookingData.booking_date,
        blocked_time: bookingData.booking_time,
        reason: `Booked by ${bookingData.customer_name}`,
        created_at: new Date().toISOString(),
      }

      const { error: blockError } = await supabase.from("blocked_time_slots").insert([blockingData])

      if (blockError) {
        console.error("⚠️ Failed to block time slot:", blockError)
      } else {
        console.log("✅ Time slot blocked successfully")
      }

      // Prepare email data
      const emailData = {
        customerName: bookingData.customer_name,
        customerEmail: bookingData.customer_email,
        customerPhone: bookingData.customer_phone,
        services: Array.isArray(bookingData.services) ? bookingData.services : [bookingData.services],
        bookingDate: bookingData.booking_date,
        bookingTime: bookingData.booking_time,
        totalAmount: bookingData.total_amount,
        depositAmount: bookingData.deposit_amount,
        reference: paymentData.reference,
        notes: bookingData.notes,
      }

      console.log("📧 Sending confirmation emails via webhook...")

      // Send confirmation emails
      const customerEmailResult = await sendCustomerConfirmationEmail(emailData)
      const adminEmailResult = await sendAdminNotificationEmail(emailData)

      const emailResults = {
        customer: customerEmailResult,
        admin: adminEmailResult,
        success: customerEmailResult.success && adminEmailResult.success,
      }

      if (emailResults.success) {
        console.log("✅ All webhook emails sent successfully!")
      } else {
        console.error("⚠️ Some webhook emails failed to send:", emailResults)
      }

      return NextResponse.json({
        status: "success",
        message: "Webhook processed successfully",
        booking: savedBooking,
        emails: emailResults,
      })
    }

    return NextResponse.json({ status: "success", message: "Webhook received" })
  } catch (error) {
    console.error("❌ Webhook processing error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
