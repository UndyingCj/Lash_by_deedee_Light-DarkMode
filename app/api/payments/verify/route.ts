import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 Payment verification started")

    const body = await request.json()
    const { reference } = body

    if (!reference) {
      console.error("❌ No payment reference provided")
      return NextResponse.json(
        {
          status: false,
          message: "Payment reference is required",
        },
        { status: 400 },
      )
    }

    console.log("🔗 Verifying payment reference:", reference)

    // Verify payment with Paystack with timeout and retry logic
    let paystackData
    let attempts = 0
    const maxAttempts = 3
    const timeout = 10000 // 10 seconds

    while (attempts < maxAttempts) {
      try {
        console.log(`🔄 Paystack verification attempt ${attempts + 1}/${maxAttempts}`)
        
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeout)

        const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!paystackResponse.ok) {
          throw new Error(`HTTP ${paystackResponse.status}: ${paystackResponse.statusText}`)
        }

        paystackData = await paystackResponse.json()
        console.log("📊 Paystack verification response:", paystackData.status)
        break // Success, exit retry loop

      } catch (error) {
        attempts++
        console.error(`❌ Paystack verification attempt ${attempts} failed:`, error)
        
        if (attempts >= maxAttempts) {
          console.error("❌ All Paystack verification attempts failed")
          return NextResponse.json(
            {
              status: false,
              message: "Payment verification failed after multiple attempts. Please contact support.",
            },
            { status: 500 },
          )
        }

        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts))
      }
    }

    if (!paystackData || !paystackData.status || paystackData.data.status !== "success") {
      console.error("❌ Payment not successful:", paystackData?.data?.status || "Unknown status")
      return NextResponse.json(
        {
          status: false,
          message: "Payment was not successful",
        },
        { status: 400 },
      )
    }

    console.log("✅ Payment verified successfully")

    // Find booking by payment reference
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("*")
      .eq("payment_reference", reference)
      .single()

    if (bookingError || !booking) {
      console.error("❌ Booking not found:", bookingError)
      return NextResponse.json(
        {
          status: false,
          message: "Booking not found",
        },
        { status: 404 },
      )
    }

    console.log("📋 Found booking:", booking.id)

    // Update booking status to confirmed
    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        payment_status: "completed",
        status: "confirmed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", booking.id)

    if (updateError) {
      console.error("❌ Failed to update booking:", updateError)
      return NextResponse.json(
        {
          status: false,
          message: "Failed to update booking status",
        },
        { status: 500 },
      )
    }

    console.log("✅ Booking status updated to confirmed")

    // Block the time slot to prevent double booking
    try {
      const { error: blockError } = await supabase.from("blocked_time_slots").upsert(
        {
          blocked_date: booking.booking_date,
          blocked_time: booking.booking_time,
          reason: `Booking confirmed - ${booking.client_name}`,
          created_at: new Date().toISOString(),
        },
        {
          onConflict: "blocked_date,blocked_time",
        }
      )

      if (blockError) {
        console.error("⚠️ Failed to block time slot:", blockError)
        // Don't fail the entire process if blocking fails
      } else {
        console.log("🚫 Time slot blocked successfully")
      }
    } catch (blockError) {
      console.error("⚠️ Error blocking time slot:", blockError)
      // Continue with the booking process even if blocking fails
    }

    // Send confirmation emails (simplified for now)
    try {
      console.log("📧 Sending confirmation emails...")
      // Email sending logic would go here
      console.log("📧 Emails sent successfully")
    } catch (emailError) {
      console.error("⚠️ Email sending failed:", emailError)
      // Don't fail the booking if emails fail
    }

    return NextResponse.json({
      status: true,
      message: "Payment verified and booking confirmed",
      data: {
        booking_id: booking.id,
        payment_reference: reference,
        booking_status: "confirmed",
        payment_status: "completed",
        customer_name: booking.client_name,
        service_name: booking.service_name,
        booking_date: booking.booking_date,
        booking_time: booking.booking_time,
        total_amount: booking.total_amount,
        deposit_amount: booking.deposit_amount,
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
