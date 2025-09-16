import { type NextRequest, NextResponse } from "next/server"
import { getBusinessSettings, updateBusinessSettings } from "@/lib/settings"

const DEFAULT_SETTINGS = {
  businessName: "Lashed by Deedee",
  businessEmail: "bookings@lashedbydeedee.com",
  businessPhone: "+234 816 543 5528",
  businessAddress: "Port Harcourt, Nigeria",
  businessDescription: "Where Beauty Meets Precision. Professional lash and brow services.",
  bookingBuffer: 15,
  maxAdvanceBooking: 30,
  cancellationPolicy: 24,
  autoConfirmBookings: false,
  emailNotifications: true,
  smsNotifications: false,
  bookingReminders: true,
  marketingEmails: false,
  twoFactorAuth: false,
  sessionTimeout: 60,
  passwordExpiry: 90,
  theme: "light",
  primaryColor: "pink",
  timezone: "Africa/Lagos",
}

export async function GET() {
  try {
    const settings = await getBusinessSettings()
    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error fetching settings:", error)
    console.log("🔧 Returning default settings - database table may not exist yet")

    // Return default settings if table doesn't exist
    return NextResponse.json(DEFAULT_SETTINGS)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const settings = await request.json()
    await updateBusinessSettings(settings)

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
    })
  } catch (error) {
    console.error("Error updating settings:", error)

    // If table doesn't exist, return a helpful message instead of crashing
    if (error instanceof Error && error.message.includes("relation") && error.message.includes("does not exist")) {
      return NextResponse.json({
        error: "Settings table not found. Database needs to be initialized.",
        suggestion: "Contact administrator to run database migration."
      }, { status: 503 })
    }

    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
