import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sendBookingEmails } from "@/lib/email"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

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

    // Send confirmation emails via Zoho
    console.log("📧 Sending confirmation emails via Zoho...")
    try {
      const emailBookingData = {
        customerName: booking.client_name,
        customerEmail: booking.client_email,
        customerPhone: booking.client_phone,
        serviceName: booking.service_name,
        bookingDate: booking.booking_date,
        bookingTime: booking.booking_time,
        totalAmount: booking.total_amount,
        depositAmount: booking.deposit_amount,
        paymentReference: booking.payment_reference,
        notes: booking.notes,
      }

      const emailResults = await sendBookingEmails(emailBookingData)

      if (emailResults.customer.success) {
        console.log("✅ Customer email sent via Zoho:", emailResults.customer.id)
      } else {
        console.error("❌ Customer email failed:", emailResults.customer.error)
      }

      if (emailResults.admin.success) {
        console.log("✅ Admin email sent via Zoho:", emailResults.admin.id)
      } else {
        console.error("❌ Admin email failed:", emailResults.admin.error)
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
