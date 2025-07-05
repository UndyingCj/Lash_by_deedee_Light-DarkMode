import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sendBookingConfirmation } from "@/lib/email"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const paystackSecret = process.env.PAYSTACK_SECRET_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  console.log("🔍 Payment verification started")

  try {
    const body = await request.json()
    const { reference } = body

    console.log("📋 Verification request:", { reference })

    if (!reference) {
      console.error("❌ Missing reference in request")
      return NextResponse.json(
        {
          success: false,
          status: false,
          message: "Payment reference is required",
        },
        { status: 400 },
      )
    }

    // Verify payment with Paystack
    console.log("🔍 Verifying with Paystack...")
    const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
        "Content-Type": "application/json",
      },
    })

    const paystackData = await paystackResponse.json()
    console.log("📋 Paystack response:", {
      status: paystackResponse.status,
      ok: paystackResponse.ok,
      data: paystackData,
    })

    if (!paystackResponse.ok) {
      console.error("❌ Paystack API error:", paystackData)
      return NextResponse.json(
        {
          success: false,
          status: false,
          message: "Payment verification failed with Paystack",
        },
        { status: 400 },
      )
    }

    if (!paystackData.status || paystackData.data?.status !== "success") {
      console.error("❌ Payment not successful:", paystackData.data?.status)
      return NextResponse.json(
        {
          success: false,
          status: false,
          message: "Payment was not successful",
        },
        { status: 400 },
      )
    }

    // Extract booking data from metadata
    const metadata = paystackData.data?.metadata || {}
    console.log("📋 Payment metadata:", metadata)

    if (!metadata.client_name || !metadata.email || !metadata.service) {
      console.error("❌ Missing required booking data in metadata")
      return NextResponse.json(
        {
          success: false,
          status: false,
          message: "Missing booking information",
        },
        { status: 400 },
      )
    }

    // Create booking in database
    console.log("💾 Creating booking in database...")
    const bookingData = {
      client_name: metadata.client_name,
      phone: metadata.phone || "",
      email: metadata.email,
      service: Array.isArray(metadata.service) ? metadata.service.join(", ") : metadata.service,
      booking_date: metadata.booking_date,
      booking_time: metadata.booking_time,
      status: "confirmed",
      amount: paystackData.data.amount / 100, // Convert from kobo to naira
      notes: metadata.notes || "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    console.log("📋 Booking data to insert:", bookingData)

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert([bookingData])
      .select()
      .single()

    if (bookingError) {
      console.error("❌ Database error creating booking:", bookingError)
      return NextResponse.json(
        {
          success: false,
          status: false,
          message: `Database error: ${bookingError.message}`,
        },
        { status: 500 },
      )
    }

    console.log("✅ Booking created successfully:", booking.id)

    // Send confirmation email
    try {
      console.log("📧 Sending confirmation email...")
      await sendBookingConfirmation({
        to: booking.email,
        clientName: booking.client_name,
        service: booking.service,
        date: booking.booking_date,
        time: booking.booking_time,
        amount: booking.amount,
      })
      console.log("✅ Confirmation email sent")
    } catch (emailError) {
      console.error("❌ Email sending failed:", emailError)
      // Don't fail the entire request if email fails
    }

    console.log("✅ Payment verification completed successfully")
    return NextResponse.json({
      success: true,
      status: true,
      message: "Payment verified and booking created successfully",
      booking: booking,
    })
  } catch (error) {
    console.error("❌ Payment verification error:", error)
    return NextResponse.json(
      {
        success: false,
        status: false,
        message: "Internal server error during payment verification",
      },
      { status: 500 },
    )
  }
}
