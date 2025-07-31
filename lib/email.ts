import { Resend } from "resend"

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY)

// Zoho configuration
const ZOHO_CONFIG = {
  clientId: process.env.ZOHO_CLIENT_ID,
  clientSecret: process.env.ZOHO_CLIENT_SECRET,
  refreshToken: process.env.ZOHO_REFRESH_TOKEN,
  emailUser: process.env.ZOHO_EMAIL_USER,
  emailPassword: process.env.ZOHO_EMAIL_PASSWORD,
}

// Email templates
const EMAIL_TEMPLATES = {
  bookingConfirmation: {
    subject: "Booking Confirmation - Lashed by Deedee",
    getHtml: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #d946ef; margin: 0;">Lashed by Deedee</h1>
          <p style="color: #666; margin: 5px 0;">Beauty & Lash Services</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #333; margin-top: 0;">Booking Confirmed! 🎉</h2>
          <p>Hi ${data.customerName},</p>
          <p>Your booking has been confirmed. Here are the details:</p>
        </div>
        
        <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h3 style="color: #333; margin-top: 0;">Booking Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;"><strong>Service:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">${data.services}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;"><strong>Date:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">${data.bookingDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;"><strong>Time:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">${data.bookingTime}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;"><strong>Total Amount:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">₦${data.totalAmount?.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Deposit Paid:</strong></td>
              <td style="padding: 8px 0;">₦${data.depositAmount?.toLocaleString()}</td>
            </tr>
          </table>
        </div>
        
        <div style="background: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
          <p style="margin: 0; color: #065f46;"><strong>Payment Status:</strong> Confirmed ✅</p>
          <p style="margin: 5px 0 0 0; color: #065f46; font-size: 14px;">Reference: ${data.paymentReference}</p>
        </div>
        
        ${
          data.notes
            ? `
        <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
          <p style="margin: 0; color: #92400e;"><strong>Special Notes:</strong></p>
          <p style="margin: 5px 0 0 0; color: #92400e;">${data.notes}</p>
        </div>
        `
            : ""
        }
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #666; margin: 0;">Thank you for choosing Lashed by Deedee!</p>
          <p style="color: #666; margin: 5px 0;">We look forward to seeing you soon.</p>
          <p style="color: #d946ef; margin: 15px 0 0 0; font-weight: bold;">✨ Get ready to look amazing! ✨</p>
        </div>
      </div>
    `,
  },
  adminNotification: {
    subject: "New Booking Received - Lashed by Deedee",
    getHtml: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #d946ef; margin: 0;">Lashed by Deedee</h1>
          <p style="color: #666; margin: 5px 0;">Admin Notification</p>
        </div>
        
        <div style="background: #dbeafe; border: 1px solid #3b82f6; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h2 style="color: #1e40af; margin-top: 0;">New Booking Received! 📅</h2>
          <p>A new booking has been confirmed and payment has been processed.</p>
        </div>
        
        <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h3 style="color: #333; margin-top: 0;">Customer Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;"><strong>Name:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">${data.customerName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;"><strong>Email:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">${data.customerEmail}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Phone:</strong></td>
              <td style="padding: 8px 0;">${data.customerPhone || "Not provided"}</td>
            </tr>
          </table>
        </div>
        
        <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h3 style="color: #333; margin-top: 0;">Booking Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;"><strong>Service:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">${data.services}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;"><strong>Date:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">${data.bookingDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;"><strong>Time:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">${data.bookingTime}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;"><strong>Total Amount:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">₦${data.totalAmount?.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Deposit Paid:</strong></td>
              <td style="padding: 8px 0;">₦${data.depositAmount?.toLocaleString()}</td>
            </tr>
          </table>
        </div>
        
        <div style="background: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
          <p style="margin: 0; color: #065f46;"><strong>Payment Status:</strong> Confirmed ✅</p>
          <p style="margin: 5px 0 0 0; color: #065f46; font-size: 14px;">Reference: ${data.paymentReference}</p>
        </div>
        
        ${
          data.notes
            ? `
        <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
          <p style="margin: 0; color: #92400e;"><strong>Special Notes:</strong></p>
          <p style="margin: 5px 0 0 0; color: #92400e;">${data.notes}</p>
        </div>
        `
            : ""
        }
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #666; margin: 0;">Check your admin panel for more details.</p>
          <p style="color: #d946ef; margin: 15px 0 0 0; font-weight: bold;">💼 Lashed by Deedee Admin</p>
        </div>
      </div>
    `,
  },
}

// Get Zoho access token
async function getZohoAccessToken(): Promise<string | null> {
  try {
    if (!ZOHO_CONFIG.clientId || !ZOHO_CONFIG.clientSecret || !ZOHO_CONFIG.refreshToken) {
      console.log("⚠️ Zoho configuration incomplete, skipping token refresh")
      return null
    }

    console.log("🔄 Refreshing Zoho access token...")

    const response = await fetch("https://accounts.zoho.com/oauth/v2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        refresh_token: ZOHO_CONFIG.refreshToken,
        client_id: ZOHO_CONFIG.clientId,
        client_secret: ZOHO_CONFIG.clientSecret,
        grant_type: "refresh_token",
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Zoho token refresh failed:", response.status, errorText)
      return null
    }

    const responseText = await response.text()
    console.log("📥 Zoho token response:", responseText)

    let data
    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      console.error("❌ Failed to parse Zoho token response as JSON:", parseError)
      console.log("📄 Raw response:", responseText)
      return null
    }

    if (data.access_token) {
      console.log("✅ Zoho access token refreshed successfully")
      return data.access_token
    } else {
      console.error("❌ No access token in Zoho response:", data)
      return null
    }
  } catch (error) {
    console.error("❌ Error refreshing Zoho access token:", error)
    return null
  }
}

// Send email via Zoho
async function sendEmailViaZoho(to: string, subject: string, html: string): Promise<boolean> {
  try {
    const accessToken = await getZohoAccessToken()
    if (!accessToken) {
      console.log("⚠️ No Zoho access token available")
      return false
    }

    console.log("📧 Sending email via Zoho to:", to)

    const emailData = {
      fromAddress: ZOHO_CONFIG.emailUser,
      toAddress: to,
      subject: subject,
      content: html,
      mailFormat: "html",
    }

    const response = await fetch("https://mail.zoho.com/api/accounts/me/messages", {
      method: "POST",
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailData),
    })

    if (response.ok) {
      console.log("✅ Email sent successfully via Zoho")
      return true
    } else {
      const errorText = await response.text()
      console.error("❌ Zoho email send failed:", response.status, errorText)
      return false
    }
  } catch (error) {
    console.error("❌ Error sending email via Zoho:", error)
    return false
  }
}

// Send email via Resend
async function sendEmailViaResend(to: string, subject: string, html: string): Promise<boolean> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log("⚠️ Resend API key not configured")
      return false
    }

    console.log("📧 Sending email via Resend to:", to)

    const { data, error } = await resend.emails.send({
      from: "Lashed by Deedee <bookings@lashedbydeedee.com>",
      to: [to],
      subject: subject,
      html: html,
    })

    if (error) {
      console.error("❌ Resend email error:", error)
      return false
    }

    console.log("✅ Email sent successfully via Resend:", data?.id)
    return true
  } catch (error) {
    console.error("❌ Error sending email via Resend:", error)
    return false
  }
}

// Main email sending function with fallback
export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  console.log(`📬 Attempting to send email to: ${to}`)
  console.log(`📝 Subject: ${subject}`)

  // Try Resend first
  const resendSuccess = await sendEmailViaResend(to, subject, html)
  if (resendSuccess) {
    return true
  }

  console.log("⚠️ Resend failed, trying Zoho...")

  // Fallback to Zoho
  const zohoSuccess = await sendEmailViaZoho(to, subject, html)
  if (zohoSuccess) {
    return true
  }

  console.error("❌ Both email services failed")
  return false
}

// Send booking confirmation email
export async function sendBookingConfirmation(bookingData: {
  customerName: string
  customerEmail: string
  customerPhone?: string
  services: string
  bookingDate: string
  bookingTime: string
  totalAmount: number
  depositAmount: number
  paymentReference: string
  notes?: string
}): Promise<boolean> {
  console.log("📧 Sending booking confirmation email...")

  const template = EMAIL_TEMPLATES.bookingConfirmation
  const html = template.getHtml(bookingData)

  return await sendEmail(bookingData.customerEmail, template.subject, html)
}

// Send admin notification email
export async function sendAdminNotification(bookingData: {
  customerName: string
  customerEmail: string
  customerPhone?: string
  services: string
  bookingDate: string
  bookingTime: string
  totalAmount: number
  depositAmount: number
  paymentReference: string
  notes?: string
}): Promise<boolean> {
  console.log("📧 Sending admin notification email...")

  const adminEmail = process.env.ZOHO_EMAIL_USER || "admin@lashedbydeedee.com"
  const template = EMAIL_TEMPLATES.adminNotification
  const html = template.getHtml(bookingData)

  return await sendEmail(adminEmail, template.subject, html)
}

// Send both confirmation and admin notification
export async function sendBookingEmails(bookingData: {
  customerName: string
  customerEmail: string
  customerPhone?: string
  services: string
  bookingDate: string
  bookingTime: string
  totalAmount: number
  depositAmount: number
  paymentReference: string
  notes?: string
}): Promise<{ confirmation: boolean; admin: boolean }> {
  console.log("📧 Sending booking emails...")

  const [confirmationSent, adminNotificationSent] = await Promise.all([
    sendBookingConfirmation(bookingData),
    sendAdminNotification(bookingData),
  ])

  console.log("📊 Email results:", {
    confirmation: confirmationSent ? "✅ Sent" : "❌ Failed",
    admin: adminNotificationSent ? "✅ Sent" : "❌ Failed",
  })

  return {
    confirmation: confirmationSent,
    admin: adminNotificationSent,
  }
}
