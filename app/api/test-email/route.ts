import { NextRequest, NextResponse } from "next/server"
import { sendCustomerBookingConfirmation, sendAdminBookingNotification } from "@/lib/email"

// Test email endpoint - REMOVE IN PRODUCTION
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const testEmail = searchParams.get("email") || "test@example.com"

    console.log("🧪 Testing email system with:", testEmail)

    // Test data
    const testEmailData = {
      customerName: "Test Customer",
      customerEmail: testEmail,
      customerPhone: "+2348123456789",
      services: ["Classic Lashes", "Brow Shaping"],
      bookingDate: "2025-01-15",
      bookingTime: "2:00 PM",
      totalAmount: 15000,
      depositAmount: 5000,
      paymentReference: "TEST_REF_123",
      notes: "This is a test booking",
      bookingId: "TEST_BOOKING_123",
    }

    console.log("📧 Testing customer email...")
    const customerResult = await sendCustomerBookingConfirmation(testEmailData)

    console.log("📧 Testing admin email...")  
    const adminResult = await sendAdminBookingNotification(testEmailData)

    return NextResponse.json({
      success: true,
      message: "Email test completed",
      results: {
        customer: {
          success: customerResult.success,
          message: customerResult.message,
          id: customerResult.id
        },
        admin: {
          success: adminResult.success,
          message: adminResult.message,
          id: adminResult.id
        }
      },
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        ZOHO_EMAIL_USER: process.env.ZOHO_EMAIL_USER ? "Set" : "Missing",
        ZOHO_EMAIL_PASSWORD: process.env.ZOHO_EMAIL_PASSWORD ? "Set" : "Missing"
      }
    })

  } catch (error) {
    console.error("❌ Email test failed:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

// Also support POST for testing
export async function POST(request: NextRequest) {
  return GET(request)
}