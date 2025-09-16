import { NextRequest, NextResponse } from "next/server"
import { sendCustomerBookingConfirmation, sendAdminBookingNotification } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { customerEmail } = await request.json()

    const testData = {
      customerName: "Professional Test Customer",
      customerEmail: customerEmail || "chiji470@gmail.com",
      customerPhone: "+234 816 543 5528",
      services: ["Classic Lashes", "Brow Sculpting", "Lash Tint"],
      bookingDate: "2024-03-01",
      bookingTime: "2:00 PM",
      totalAmount: 120000,
      depositAmount: 60000,
      paymentReference: `PROF_TEST_${Date.now()}`,
      notes: "Professional email template test - Enhanced HTML design with branding",
      bookingId: `PROF_${Date.now()}`
    }

    console.log("🎨 PROFESSIONAL EMAIL TEMPLATE TEST")
    console.log("📧 Enhanced HTML emails with professional branding")
    console.log("📨 Customer:", customerEmail)
    console.log("📮 Admin: bookings@lashedbydeedee.com + lashedbydeedeee@gmail.com")
    console.log("===============================================")

    // Send enhanced customer confirmation
    console.log("📧 Sending ENHANCED customer confirmation...")
    const customerResult = await sendCustomerBookingConfirmation(testData)
    console.log("✅ Customer result:", customerResult)

    // Send enhanced admin notifications to both emails
    console.log("📧 Sending ENHANCED admin notifications to both addresses...")
    const adminResult = await sendAdminBookingNotification(testData)
    console.log("✅ Admin result:", adminResult)

    return NextResponse.json({
      success: true,
      message: "Professional email templates tested successfully!",
      emailsSent: {
        customer: {
          to: customerEmail,
          template: "Enhanced HTML with professional branding",
          result: customerResult
        },
        admin: {
          to: ["bookings@lashedbydeedee.com", "lashedbydeedeee@gmail.com"],
          template: "Professional admin notification with payment details",
          result: adminResult
        }
      },
      features: [
        "✨ Professional HTML templates with CSS styling",
        "💅 Lashed by Deedee branding and colors",
        "📱 Mobile-responsive design",
        "🎨 Beautiful payment and booking summaries",
        "📧 Dual admin notifications (Zoho + Gmail)",
        "🔗 Dashboard links for admin access"
      ],
      testBooking: testData
    })

  } catch (error) {
    console.error("❌ Professional email test error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Professional Email Template Test",
    description: "Tests enhanced HTML email templates with professional branding",
    recipients: [
      "Customer: booking confirmation",
      "Admin 1: bookings@lashedbydeedee.com",
      "Admin 2: lashedbydeedeee@gmail.com"
    ],
    features: [
      "HTML templates with CSS styling",
      "Professional branding",
      "Mobile responsive",
      "Enhanced payment details",
      "Dashboard integration"
    ]
  })
}