import { Resend } from "resend"

// Lazy initialization to avoid build-time errors
let resendInstance: Resend | null = null

function getResendInstance(): Resend {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      throw new Error("RESEND_API_KEY environment variable is required")
    }
    resendInstance = new Resend(apiKey)
  }
  return resendInstance
}

export interface BookingEmailData {
  customerName: string
  customerEmail: string
  customerPhone: string
  serviceName: string
  bookingDate: string
  bookingTime: string
  totalAmount: number
  depositAmount: number
  paymentReference: string
  notes?: string
}

export function createCustomerConfirmationEmail(booking: BookingEmailData) {
  const remainingBalance = booking.totalAmount - booking.depositAmount

  return {
    subject: `Booking Confirmation - ${booking.serviceName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmation</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background-color: #f4f4f4; 
          }
          .container { 
            max-width: 600px; 
            margin: 20px auto; 
            background: white; 
            border-radius: 12px; 
            overflow: hidden; 
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); 
          }
          .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 40px 30px; 
            text-align: center; 
          }
          .header h1 { 
            margin: 0 0 10px 0; 
            font-size: 28px; 
            font-weight: 600; 
          }
          .header p { 
            margin: 0; 
            font-size: 16px; 
            opacity: 0.9; 
          }
          .content { 
            padding: 40px 30px; 
          }
          .greeting { 
            font-size: 18px; 
            margin-bottom: 20px; 
            color: #333; 
          }
          .booking-details { 
            background: #f8f9fa; 
            padding: 25px; 
            border-radius: 8px; 
            margin: 25px 0; 
            border-left: 4px solid #667eea; 
          }
          .booking-details h3 { 
            margin: 0 0 20px 0; 
            color: #333; 
            font-size: 20px; 
          }
          .detail-row { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            padding: 12px 0; 
            border-bottom: 1px solid #e9ecef; 
          }
          .detail-row:last-child { 
            border-bottom: none; 
          }
          .detail-label { 
            font-weight: 600; 
            color: #555; 
            font-size: 14px; 
          }
          .detail-value { 
            color: #333; 
            font-size: 14px; 
            text-align: right; 
          }
          .amount { 
            font-size: 16px; 
            font-weight: 700; 
            color: #667eea; 
          }
          .section { 
            margin: 30px 0; 
          }
          .section h3 { 
            color: #333; 
            font-size: 18px; 
            margin-bottom: 15px; 
            display: flex; 
            align-items: center; 
            gap: 8px; 
          }
          .section ul { 
            margin: 0; 
            padding-left: 20px; 
          }
          .section li { 
            margin-bottom: 8px; 
            color: #555; 
          }
          .contact-info { 
            background: #e8f5e8; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 20px 0; 
          }
          .contact-info p { 
            margin: 5px 0; 
            color: #333; 
          }
          .footer { 
            text-align: center; 
            margin-top: 40px; 
            padding-top: 30px; 
            border-top: 1px solid #e9ecef; 
            color: #666; 
            font-size: 14px; 
          }
          .footer p { 
            margin: 5px 0; 
          }
          .highlight { 
            background: #fff3cd; 
            padding: 15px; 
            border-radius: 6px; 
            border-left: 4px solid #ffc107; 
            margin: 20px 0; 
          }
          @media (max-width: 600px) {
            .container { 
              margin: 10px; 
              border-radius: 8px; 
            }
            .header, .content { 
              padding: 20px; 
            }
            .detail-row { 
              flex-direction: column; 
              align-items: flex-start; 
              gap: 5px; 
            }
            .detail-value { 
              text-align: left; 
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Booking Confirmed!</h1>
            <p>Thank you for choosing Lashed by Deedee</p>
          </div>
          <div class="content">
            <p class="greeting">Dear ${booking.customerName},</p>
            <p>Your booking has been confirmed! We're excited to see you soon and help you look absolutely stunning.</p>
            
            <div class="booking-details">
              <h3>📋 Your Booking Details</h3>
              <div class="detail-row">
                <span class="detail-label">Service</span>
                <span class="detail-value">${booking.serviceName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date</span>
                <span class="detail-value">${new Date(booking.bookingDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Time</span>
                <span class="detail-value">${booking.bookingTime}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Total Amount</span>
                <span class="detail-value amount">₦${booking.totalAmount.toLocaleString()}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Deposit Paid</span>
                <span class="detail-value amount">₦${booking.depositAmount.toLocaleString()}</span>
              </div>
              ${
                remainingBalance > 0
                  ? `
              <div class="detail-row">
                <span class="detail-label">Balance Due</span>
                <span class="detail-value amount">₦${remainingBalance.toLocaleString()}</span>
              </div>
              `
                  : ""
              }
              <div class="detail-row">
                <span class="detail-label">Reference</span>
                <span class="detail-value">${booking.paymentReference}</span>
              </div>
            </div>

            ${
              remainingBalance > 0
                ? `
            <div class="highlight">
              <strong>💰 Payment Reminder:</strong> The remaining balance of ₦${remainingBalance.toLocaleString()} is due at your appointment. We accept cash and card payments.
            </div>
            `
                : ""
            }

            <div class="section">
              <h3>📍 Location & Contact</h3>
              <div class="contact-info">
                <p><strong>Address:</strong> Lagos, Nigeria</p>
                <p><strong>Phone:</strong> +234 XXX XXX XXXX</p>
                <p><strong>Email:</strong> info@lashedbydeedee.com</p>
                <p><strong>Instagram:</strong> @lashedbydeedee</p>
              </div>
            </div>

            <div class="section">
              <h3>⏰ Important Reminders</h3>
              <ul>
                <li><strong>Arrive 10 minutes early</strong> for your appointment to complete any necessary paperwork</li>
                <li><strong>Bring a valid ID</strong> for verification purposes</li>
                <li><strong>Come with clean lashes/brows</strong> - no makeup or oils on the treatment area</li>
                <li><strong>Reschedule policy:</strong> 24-hour notice required for changes or cancellations</li>
                <li><strong>Aftercare instructions</strong> will be provided after your treatment</li>
                ${booking.notes ? `<li><strong>Special notes:</strong> ${booking.notes}</li>` : ""}
              </ul>
            </div>

            <div class="section">
              <h3>💄 What to Expect</h3>
              <p>Your ${booking.serviceName} appointment will be performed by our skilled technician using high-quality products and sterile equipment. We'll ensure you're comfortable throughout the process and provide detailed aftercare instructions.</p>
            </div>

            <div class="footer">
              <p><strong>Thank you for choosing Lashed by Deedee!</strong></p>
              <p>Follow us on social media for beauty tips, before/after photos, and special offers</p>
              <p>Questions? Reply to this email or call us directly</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  }
}

export function createAdminNotificationEmail(booking: BookingEmailData) {
  const remainingBalance = booking.totalAmount - booking.depositAmount

  return {
    subject: `🚨 New Booking Alert - ${booking.serviceName} - ${booking.bookingDate}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Booking Alert</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background-color: #f4f4f4; 
          }
          .container { 
            max-width: 600px; 
            margin: 20px auto; 
            background: white; 
            border-radius: 12px; 
            overflow: hidden; 
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); 
          }
          .header { 
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); 
            color: white; 
            padding: 30px; 
            text-align: center; 
          }
          .header h1 { 
            margin: 0 0 10px 0; 
            font-size: 24px; 
            font-weight: 600; 
          }
          .header p { 
            margin: 0; 
            font-size: 16px; 
            opacity: 0.9; 
          }
          .content { 
            padding: 30px; 
          }
          .alert-badge { 
            background: #ff6b6b; 
            color: white; 
            padding: 8px 16px; 
            border-radius: 20px; 
            font-size: 12px; 
            font-weight: 600; 
            text-transform: uppercase; 
            display: inline-block; 
            margin-bottom: 20px; 
          }
          .booking-details { 
            background: #f8f9fa; 
            padding: 25px; 
            border-radius: 8px; 
            margin: 20px 0; 
            border-left: 4px solid #ff6b6b; 
          }
          .booking-details h3 { 
            margin: 0 0 15px 0; 
            color: #333; 
            font-size: 18px; 
            display: flex; 
            align-items: center; 
            gap: 8px; 
          }
          .detail-row { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            padding: 10px 0; 
            border-bottom: 1px solid #e9ecef; 
          }
          .detail-row:last-child { 
            border-bottom: none; 
          }
          .detail-label { 
            font-weight: 600; 
            color: #555; 
            font-size: 14px; 
          }
          .detail-value { 
            color: #333; 
            font-size: 14px; 
            text-align: right; 
          }
          .amount { 
            font-size: 16px; 
            font-weight: 700; 
            color: #ff6b6b; 
          }
          .actions { 
            background: linear-gradient(135deg, #e8f5e8 0%, #d4edda 100%); 
            padding: 20px; 
            border-radius: 8px; 
            margin: 25px 0; 
            border-left: 4px solid #28a745; 
          }
          .actions h3 { 
            margin: 0 0 15px 0; 
            color: #155724; 
            font-size: 18px; 
          }
          .actions ul { 
            margin: 0; 
            padding-left: 20px; 
          }
          .actions li { 
            margin-bottom: 8px; 
            color: #155724; 
          }
          .priority-info { 
            background: #fff3cd; 
            padding: 15px; 
            border-radius: 6px; 
            border-left: 4px solid #ffc107; 
            margin: 20px 0; 
          }
          .priority-info strong { 
            color: #856404; 
          }
          .customer-section, .booking-section { 
            margin-bottom: 25px; 
          }
          @media (max-width: 600px) {
            .container { 
              margin: 10px; 
              border-radius: 8px; 
            }
            .header, .content { 
              padding: 20px; 
            }
            .detail-row { 
              flex-direction: column; 
              align-items: flex-start; 
              gap: 5px; 
            }
            .detail-value { 
              text-align: left; 
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 New Booking Alert</h1>
            <p>A new booking has been confirmed and paid</p>
          </div>
          <div class="content">
            <div class="alert-badge">New Booking</div>
            
            <div class="booking-details customer-section">
              <h3>👤 Customer Information</h3>
              <div class="detail-row">
                <span class="detail-label">Name</span>
                <span class="detail-value">${booking.customerName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Email</span>
                <span class="detail-value">${booking.customerEmail}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Phone</span>
                <span class="detail-value">${booking.customerPhone}</span>
              </div>
            </div>
            
            <div class="booking-details booking-section">
              <h3>📋 Booking Information</h3>
              <div class="detail-row">
                <span class="detail-label">Service</span>
                <span class="detail-value">${booking.serviceName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date</span>
                <span class="detail-value">${new Date(booking.bookingDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Time</span>
                <span class="detail-value">${booking.bookingTime}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Total Amount</span>
                <span class="detail-value amount">₦${booking.totalAmount.toLocaleString()}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Deposit Paid</span>
                <span class="detail-value amount">₦${booking.depositAmount.toLocaleString()}</span>
              </div>
              ${
                remainingBalance > 0
                  ? `
              <div class="detail-row">
                <span class="detail-label">Balance Due</span>
                <span class="detail-value amount">₦${remainingBalance.toLocaleString()}</span>
              </div>
              `
                  : ""
              }
              <div class="detail-row">
                <span class="detail-label">Reference</span>
                <span class="detail-value">${booking.paymentReference}</span>
              </div>
              ${
                booking.notes
                  ? `
              <div class="detail-row">
                <span class="detail-label">Special Notes</span>
                <span class="detail-value">${booking.notes}</span>
              </div>
              `
                  : ""
              }
            </div>

            ${
              remainingBalance > 0
                ? `
            <div class="priority-info">
              <strong>💰 Payment Collection:</strong> Collect remaining balance of ₦${remainingBalance.toLocaleString()} at the appointment.
            </div>
            `
                : ""
            }

            <div class="actions">
              <h3>📝 Action Items</h3>
              <ul>
                <li><strong>Add to calendar:</strong> ${booking.serviceName} - ${booking.customerName}</li>
                <li><strong>Prepare materials:</strong> Ensure all supplies for ${booking.serviceName} are ready</li>
                <li><strong>Send reminder:</strong> Contact customer 24 hours before appointment</li>
                <li><strong>Review notes:</strong> ${booking.notes || "No special requirements noted"}</li>
                ${remainingBalance > 0 ? `<li><strong>Payment collection:</strong> Collect ₦${remainingBalance.toLocaleString()} balance</li>` : "<li><strong>Payment:</strong> Fully paid - no balance due</li>"}
                <li><strong>Aftercare:</strong> Prepare aftercare instructions and products</li>
              </ul>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef; color: #666; font-size: 14px;">
              <p><strong>Booking confirmed at:</strong> ${new Date().toLocaleString()}</p>
              <p>This is an automated notification from the Lashed by Deedee booking system</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  }
}

export async function sendCustomerConfirmationEmail(booking: BookingEmailData) {
  try {
    const resend = getResendInstance()
    const emailContent = createCustomerConfirmationEmail(booking)

    const result = await resend.emails.send({
      from: "bookings@lashedbydeedee.com",
      to: [booking.customerEmail],
      subject: emailContent.subject,
      html: emailContent.html,
    })

    if (result.error) {
      console.error("❌ Customer email failed:", result.error)
      return { success: false, error: result.error }
    }

    console.log("✅ Customer email sent:", result.data.id)
    return { success: true, id: result.data.id }
  } catch (error) {
    console.error("❌ Customer email error:", error)
    return { success: false, error }
  }
}

export async function sendAdminNotificationEmail(booking: BookingEmailData) {
  try {
    const resend = getResendInstance()
    const emailContent = createAdminNotificationEmail(booking)

    const result = await resend.emails.send({
      from: "bookings@lashedbydeedee.com",
      to: ["admin@lashedbydeedee.com"],
      subject: emailContent.subject,
      html: emailContent.html,
    })

    if (result.error) {
      console.error("❌ Admin email failed:", result.error)
      return { success: false, error: result.error }
    }

    console.log("✅ Admin email sent:", result.data.id)
    return { success: true, id: result.data.id }
  } catch (error) {
    console.error("❌ Admin email error:", error)
    return { success: false, error }
  }
}

export async function sendBookingEmails(booking: BookingEmailData) {
  try {
    console.log("📧 Sending booking confirmation emails...")

    // Send both emails concurrently
    const [customerResult, adminResult] = await Promise.allSettled([
      sendCustomerConfirmationEmail(booking),
      sendAdminNotificationEmail(booking),
    ])

    const results = {
      customer:
        customerResult.status === "fulfilled" ? customerResult.value : { success: false, error: customerResult.reason },
      admin: adminResult.status === "fulfilled" ? adminResult.value : { success: false, error: adminResult.reason },
    }

    console.log("📊 Email results:", {
      customer: results.customer.success ? "✅ Sent" : "❌ Failed",
      admin: results.admin.success ? "✅ Sent" : "❌ Failed",
    })

    return results
  } catch (error) {
    console.error("❌ Booking emails error:", error)
    return {
      customer: { success: false, error },
      admin: { success: false, error },
    }
  }
}

// Legacy function names for backward compatibility
export const sendBookingConfirmation = sendCustomerConfirmationEmail
export const sendBookingNotificationToAdmin = sendAdminNotificationEmail
export const sendBookingConfirmationEmail = sendCustomerConfirmationEmail
export const sendAdminBookingNotification = sendAdminNotificationEmail
