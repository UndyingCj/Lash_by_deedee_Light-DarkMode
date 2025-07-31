import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const resend = new Resend(process.env.RESEND_API_KEY!)

// Email templates
function createCustomerConfirmationEmail(booking: any) {
  return {
    subject: `Booking Confirmation - ${booking.service_name}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .detail-label { font-weight: bold; color: #555; }
          .detail-value { color: #333; }
          .amount { font-size: 1.2em; font-weight: bold; color: #667eea; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 0.9em; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Booking Confirmed!</h1>
            <p>Thank you for choosing Lashed by Deedee</p>
          </div>
          <div class="content">
            <p>Dear ${booking.client_name},</p>
            <p>Your booking has been confirmed! We're excited to see you soon.</p>
            
            <div class="booking-details">
              <h3>📋 Booking Details</h3>
              <div class="detail-row">
                <span class="detail-label">Service:</span>
                <span class="detail-value">${booking.service_name}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span class="detail-value">${booking.booking_date}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Time:</span>
                <span class="detail-value">${booking.booking_time}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Total Amount:</span>
                <span class="detail-value amount">₦${Number(booking.total_amount).toLocaleString()}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Deposit Paid:</span>
                <span class="detail-value amount">₦${Number(booking.deposit_amount).toLocaleString()}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Reference:</span>
                <span class="detail-value">${booking.payment_reference}</span>
              </div>
            </div>

            <h3>📍 Location & Contact</h3>
            <p><strong>Address:</strong> Lagos, Nigeria</p>
            <p><strong>Phone:</strong> +234 XXX XXX XXXX</p>
            <p><strong>Email:</strong> info@lashedbydeedee.com</p>

            <h3>⏰ Important Reminders</h3>
            <ul>
              <li>Please arrive 10 minutes early for your appointment</li>
              <li>Bring a valid ID for verification</li>
              <li>Contact us if you need to reschedule (24hrs notice required)</li>
              <li>The remaining balance of ₦${(Number(booking.total_amount) - Number(booking.deposit_amount)).toLocaleString()} is due at your appointment</li>
            </ul>

            <div class="footer">
              <p>Thank you for choosing Lashed by Deedee!</p>
              <p>Follow us on social media for beauty tips and updates</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  }
}

function createAdminNotificationEmail(booking: any) {
  return {
    subject: `New Booking Alert - ${booking.service_name}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Booking Alert</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ff6b6b; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
          .detail-label { font-weight: bold; color: #555; }
          .detail-value { color: #333; }
          .amount { font-size: 1.1em; font-weight: bold; color: #ff6b6b; }
          .actions { background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 New Booking Alert</h1>
            <p>A new booking has been confirmed</p>
          </div>
          <div class="content">
            <div class="booking-details">
              <h3>👤 Customer Information</h3>
              <div class="detail-row">
                <span class="detail-label">Name:</span>
                <span class="detail-value">${booking.client_name}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Email:</span>
                <span class="detail-value">${booking.client_email}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Phone:</span>
                <span class="detail-value">${booking.client_phone}</span>
              </div>
              
              <h3>📋 Booking Information</h3>
              <div class="detail-row">
                <span class="detail-label">Service:</span>
                <span class="detail-value">${booking.service_name}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span class="detail-value">${booking.booking_date}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Time:</span>
                <span class="detail-value">${booking.booking_time}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Total Amount:</span>
                <span class="detail-value amount">₦${Number(booking.total_amount).toLocaleString()}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Deposit Paid:</span>
                <span class="detail-value amount">₦${Number(booking.deposit_amount).toLocaleString()}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Balance Due:</span>
                <span class="detail-value amount">₦${(Number(booking.total_amount) - Number(booking.deposit_amount)).toLocaleString()}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Reference:</span>
                <span class="detail-value">${booking.payment_reference}</span>
              </div>
            </div>

            <div class="actions">
              <h3>📝 Next Steps</h3>
              <ul>
                <li>Add appointment to calendar</li>
                <li>Prepare materials for ${booking.service_name}</li>
                <li>Send reminder 24 hours before appointment</li>
                <li>Collect remaining balance: ₦${(Number(booking.total_amount) - Number(booking.deposit_amount)).toLocaleString()}</li>
              </ul>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 Payment verification started")

    const body = await request.json()
    const { reference } = body

    if (!reference) {
      return NextResponse.json(
        {
          status: false,
          message: "Payment reference is required",
        },
        { status: 400 },
      )
    }

    console.log("📝 Verifying payment reference:", reference)

    // Verify payment with Paystack
    const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    })

    if (!paystackResponse.ok) {
      console.error("❌ Paystack verification failed:", paystackResponse.status)
      return NextResponse.json(
        {
          status: false,
          message: "Payment verification failed",
        },
        { status: 500 },
      )
    }

    const paystackData = await paystackResponse.json()
    console.log("📊 Paystack verification response:", JSON.stringify(paystackData, null, 2))

    if (!paystackData.status || paystackData.data.status !== "success") {
      console.error("❌ Payment not successful:", paystackData.data.status)
      return NextResponse.json(
        {
          status: false,
          message: "Payment was not successful",
          data: paystackData.data,
        },
        { status: 400 },
      )
    }

    // Update booking status in database
    console.log("💾 Updating booking status...")
    const { data: booking, error: updateError } = await supabase
      .from("bookings")
      .update({
        payment_status: "completed",
        status: "confirmed",
        updated_at: new Date().toISOString(),
      })
      .eq("payment_reference", reference)
      .select()
      .single()

    if (updateError) {
      console.error("❌ Database update failed:", updateError)
      return NextResponse.json(
        {
          status: false,
          message: "Failed to update booking status",
          error: updateError.message,
        },
        { status: 500 },
      )
    }

    console.log("✅ Booking status updated:", booking.id)

    // Send confirmation emails
    console.log("📧 Sending confirmation emails...")
    try {
      // Send customer confirmation email
      const customerEmail = createCustomerConfirmationEmail(booking)
      const customerResult = await resend.emails.send({
        from: "bookings@lashedbydeedee.com",
        to: [booking.client_email],
        subject: customerEmail.subject,
        html: customerEmail.html,
      })

      if (customerResult.error) {
        console.error("❌ Customer email failed:", customerResult.error)
      } else {
        console.log("✅ Customer email sent:", customerResult.data.id)
      }

      // Send admin notification email
      const adminEmail = createAdminNotificationEmail(booking)
      const adminResult = await resend.emails.send({
        from: "bookings@lashedbydeedee.com",
        to: ["admin@lashedbydeedee.com"],
        subject: adminEmail.subject,
        html: adminEmail.html,
      })

      if (adminResult.error) {
        console.error("❌ Admin email failed:", adminResult.error)
      } else {
        console.log("✅ Admin email sent:", adminResult.data.id)
      }
    } catch (emailError) {
      console.error("❌ Email sending error:", emailError)
      // Don't fail the verification if emails fail
    }

    console.log("✅ Payment verification completed successfully")

    return NextResponse.json({
      status: true,
      message: "Payment verified successfully",
      data: {
        booking_id: booking.id,
        payment_reference: booking.payment_reference,
        amount_paid: paystackData.data.amount / 100, // Convert from kobo
        customer_name: booking.client_name,
        service_name: booking.service_name,
        booking_date: booking.booking_date,
        booking_time: booking.booking_time,
      },
    })
  } catch (error) {
    console.error("❌ Payment verification error:", error)
    return NextResponse.json(
      {
        status: false,
        message: "Payment verification failed",
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reference = searchParams.get("reference")

    if (!reference) {
      return NextResponse.json(
        {
          status: false,
          message: "Payment reference is required",
        },
        { status: 400 },
      )
    }

    // Get booking from database
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("*")
      .eq("payment_reference", reference)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json(
        {
          status: false,
          message: "Booking not found",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      status: true,
      message: "Booking found",
      data: {
        booking_id: booking.id,
        payment_reference: booking.payment_reference,
        payment_status: booking.payment_status,
        booking_status: booking.status,
        customer_name: booking.client_name,
        service_name: booking.service_name,
        booking_date: booking.booking_date,
        booking_time: booking.booking_time,
        total_amount: booking.total_amount,
        deposit_amount: booking.deposit_amount,
      },
    })
  } catch (error) {
    console.error("❌ Booking lookup error:", error)
    return NextResponse.json(
      {
        status: false,
        message: "Failed to lookup booking",
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
