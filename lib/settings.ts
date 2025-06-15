import { supabaseAdmin } from "./supabase-admin"

export interface BusinessSettings {
  businessName: string
  businessEmail: string
  businessPhone: string
  businessAddress: string
  businessDescription: string
  bookingBuffer: number
  maxAdvanceBooking: number
  cancellationPolicy: number
  autoConfirmBookings: boolean
  emailNotifications: boolean
  smsNotifications: boolean
  bookingReminders: boolean
  marketingEmails: boolean
  twoFactorAuth: boolean
  sessionTimeout: number
  passwordExpiry: number
  theme: string
  primaryColor: string
  timezone: string
}

export interface Notification {
  id: number
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  is_read: boolean
  created_at: string
  expires_at?: string
}

// Get all business settings
export async function getBusinessSettings(): Promise<BusinessSettings> {
  try {
    const { data, error } = await supabaseAdmin
      .from("business_settings")
      .select("setting_key, setting_value, setting_type")

    if (error) {
      console.error("Error fetching settings:", error)
      throw error
    }

    // Convert array to object with proper type conversion
    const settings: any = {}
    data?.forEach(({ setting_key, setting_value, setting_type }) => {
      const key = setting_key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())

      switch (setting_type) {
        case "boolean":
          settings[key] = setting_value === "true"
          break
        case "number":
          settings[key] = Number.parseInt(setting_value, 10)
          break
        default:
          settings[key] = setting_value
      }
    })

    return settings as BusinessSettings
  } catch (error) {
    console.error("Error in getBusinessSettings:", error)
    throw error
  }
}

// Update business settings
export async function updateBusinessSettings(settings: Partial<BusinessSettings>): Promise<void> {
  try {
    const updates = Object.entries(settings).map(([key, value]) => {
      const setting_key = key.replace(/([A-Z])/g, "_$1").toLowerCase()
      const setting_type = typeof value === "boolean" ? "boolean" : typeof value === "number" ? "number" : "string"

      return {
        setting_key,
        setting_value: String(value),
        setting_type,
        updated_at: new Date().toISOString(),
      }
    })

    for (const update of updates) {
      const { error } = await supabaseAdmin.from("business_settings").upsert(update, { onConflict: "setting_key" })

      if (error) {
        console.error("Error updating setting:", update.setting_key, error)
        throw error
      }
    }
  } catch (error) {
    console.error("Error in updateBusinessSettings:", error)
    throw error
  }
}

// Get notifications
export async function getNotifications(): Promise<Notification[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("notifications")
      .select("*")
      .or("expires_at.is.null,expires_at.gt.now()")
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) {
      console.error("Error fetching notifications:", error)
      throw error
    }

    return data as Notification[]
  } catch (error) {
    console.error("Error in getNotifications:", error)
    throw error
  }
}

// Create notification
export async function createNotification(
  title: string,
  message: string,
  type: "info" | "success" | "warning" | "error" = "info",
  expiresInHours?: number,
): Promise<Notification> {
  try {
    const notification = {
      title,
      message,
      type,
      expires_at: expiresInHours ? new Date(Date.now() + expiresInHours * 60 * 60 * 1000).toISOString() : null,
    }

    const { data, error } = await supabaseAdmin.from("notifications").insert([notification]).select().single()

    if (error) {
      console.error("Error creating notification:", error)
      throw error
    }

    return data as Notification
  } catch (error) {
    console.error("Error in createNotification:", error)
    throw error
  }
}

// Mark notification as read
export async function markNotificationAsRead(id: number): Promise<void> {
  try {
    const { error } = await supabaseAdmin.from("notifications").update({ is_read: true }).eq("id", id)

    if (error) {
      console.error("Error marking notification as read:", error)
      throw error
    }
  } catch (error) {
    console.error("Error in markNotificationAsRead:", error)
    throw error
  }
}

// Get unread notification count
export async function getUnreadNotificationCount(): Promise<number> {
  try {
    const { count, error } = await supabaseAdmin
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("is_read", false)
      .or("expires_at.is.null,expires_at.gt.now()")

    if (error) {
      console.error("Error getting unread count:", error)
      throw error
    }

    return count || 0
  } catch (error) {
    console.error("Error in getUnreadNotificationCount:", error)
    throw error
  }
}
