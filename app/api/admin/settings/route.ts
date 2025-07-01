import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

// Create a Supabase client
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        detectSessionInUrl: false,
      },
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value
        },
      },
    })

    // Get settings from the database
    const { data: settings, error } = await supabaseClient
      .from("business_settings")
      .select("*")
      .order("id", { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.error("Error fetching settings:", error)
      // If no settings exist yet, return default settings
      return NextResponse.json({
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
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error in settings API:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        detectSessionInUrl: false,
      },
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value
        },
      },
    })

    const settings = await request.json()

    // Check if settings already exist
    const { data: existingSettings, error: fetchError } = await supabaseClient
      .from("business_settings")
      .select("id")
      .limit(1)
      .single()

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error checking existing settings:", fetchError)
      return NextResponse.json({ error: "Failed to check existing settings" }, { status: 500 })
    }

    let result
    if (existingSettings?.id) {
      // Update existing settings
      result = await supabaseClient.from("business_settings").update(settings).eq("id", existingSettings.id)
    } else {
      // Insert new settings
      result = await supabaseClient.from("business_settings").insert([settings])
    }

    if (result.error) {
      console.error("Error updating settings:", result.error)
      return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
    })
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
