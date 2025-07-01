import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Create a Supabase client with service role key for admin operations
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET() {
  try {
    console.log("Fetching settings from database...")

    // Get settings from the database
    const { data: settings, error } = await supabase
      .from("business_settings")
      .select("*")
      .order("id", { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.error("Error fetching settings:", error)

      // If no settings exist yet, return default settings
      const defaultSettings = {
        businessName: "Lashed by Deedee",
        businessEmail: "lashedbydeedeee@gmail.com",
        businessPhone: "+234 XXX XXX XXXX",
        businessAddress: "Rumigbo, Port Harcourt, Rivers State",
        businessHours: {
          monday: { open: "09:00", close: "18:00", closed: false },
          tuesday: { open: "09:00", close: "18:00", closed: false },
          wednesday: { open: "09:00", close: "18:00", closed: false },
          thursday: { open: "09:00", close: "18:00", closed: false },
          friday: { open: "09:00", close: "18:00", closed: false },
          saturday: { open: "10:00", close: "16:00", closed: false },
          sunday: { open: "12:00", close: "16:00", closed: true },
        },
        notificationSettings: {
          emailNotifications: true,
          smsNotifications: false,
          bookingConfirmations: true,
          reminderNotifications: true,
          cancelationNotifications: true,
          reminderHours: 24,
        },
        securitySettings: {
          twoFactorEnabled: false,
          sessionTimeout: 24,
          passwordExpiry: 90,
          loginAttempts: 5,
        },
      }

      console.log("Returning default settings")
      return NextResponse.json(defaultSettings)
    }

    console.log("Settings fetched successfully:", settings)
    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error in settings GET API:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log("Updating settings...")
    const settings = await request.json()
    console.log("Received settings:", settings)

    // Check if settings already exist
    const { data: existingSettings, error: fetchError } = await supabase
      .from("business_settings")
      .select("id")
      .limit(1)
      .single()

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error checking existing settings:", fetchError)
    }

    let result
    if (existingSettings?.id) {
      console.log("Updating existing settings with ID:", existingSettings.id)
      // Update existing settings
      result = await supabase
        .from("business_settings")
        .update({
          ...settings,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingSettings.id)
    } else {
      console.log("Inserting new settings")
      // Insert new settings
      result = await supabase.from("business_settings").insert([
        {
          ...settings,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
    }

    if (result.error) {
      console.error("Error updating settings:", result.error)
      return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
    }

    console.log("Settings updated successfully")
    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
    })
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
