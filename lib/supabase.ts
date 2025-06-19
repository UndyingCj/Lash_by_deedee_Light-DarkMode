import { createClient } from "@supabase/supabase-js"
import { supabaseAdmin, testConnection } from "./supabase-admin"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable")
}

if (!supabaseServiceKey) {
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable")
}

if (!supabaseAnonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable")
}

// Client-side Supabase client (public operations only)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Client-side hook for browser usage
export function createClientSupabase() {
  return createClient(supabaseUrl, supabaseAnonKey)
}

export interface Booking {
  id: number
  client_name: string
  phone: string
  email: string
  service: string
  booking_date: string
  booking_time: string
  status: "pending" | "confirmed" | "completed" | "cancelled"
  amount: number
  notes?: string
  created_at: string
  updated_at?: string
}

export interface BlockedDate {
  id: number
  blocked_date: string
  reason?: string
  created_at: string
}

export interface BlockedTimeSlot {
  id: number
  blocked_date: string
  blocked_time: string
  reason?: string
  created_at: string
}

// CRITICAL FIX: UTC-safe date formatting that prevents timezone shifts
const formatDateForDatabase = (dateInput: string | Date): string => {
  try {
    if (typeof dateInput === "string") {
      // If already in YYYY-MM-DD format, return as-is
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
        return dateInput
      }

      // If it's an ISO string, extract just the date part
      if (dateInput.includes("T")) {
        return dateInput.split("T")[0]
      }

      // Parse date components manually to avoid timezone conversion
      const parts = dateInput.split("-")
      if (parts.length === 3) {
        const year = parts[0].padStart(4, "0")
        const month = parts[1].padStart(2, "0")
        const day = parts[2].padStart(2, "0")
        return `${year}-${month}-${day}`
      }
    }

    if (dateInput instanceof Date) {
      // CRITICAL: Use UTC methods to prevent timezone conversion
      const year = dateInput.getUTCFullYear()
      const month = String(dateInput.getUTCMonth() + 1).padStart(2, "0")
      const day = String(dateInput.getUTCDate()).padStart(2, "0")
      return `${year}-${month}-${day}`
    }

    return String(dateInput)
  } catch (error) {
    console.error("Error formatting date for database:", dateInput, error)
    return String(dateInput)
  }
}

// Booking operations
export async function getBookings(filters?: { status?: string; date?: string }) {
  try {
    let query = supabaseAdmin.from("bookings").select("*")

    if (filters?.status && filters.status !== "all") {
      query = query.eq("status", filters.status)
    }

    if (filters?.date) {
      const formattedDate = formatDateForDatabase(filters.date)
      query = query.eq("booking_date", formattedDate)
    }

    query = query.order("booking_date", { ascending: false }).order("booking_time", { ascending: false })

    const { data, error } = await query

    if (error) {
      console.error("Supabase error in getBookings:", error)
      throw new Error(`Database error: ${error.message}`)
    }

    return data as Booking[]
  } catch (error) {
    console.error("Error in getBookings:", error)
    throw error
  }
}

export async function createBooking(booking: Omit<Booking, "id" | "created_at" | "updated_at">) {
  try {
    console.log("Creating booking with data:", booking)

    // Ensure date is in correct format
    const formattedBooking = {
      ...booking,
      booking_date: formatDateForDatabase(booking.booking_date),
    }

    const { data, error } = await supabaseAdmin.from("bookings").insert([formattedBooking]).select().single()

    if (error) {
      console.error("Supabase error in createBooking:", error)
      throw new Error(`Database error: ${error.message}`)
    }

    console.log("Successfully created booking:", data)
    return data as Booking
  } catch (error) {
    console.error("Error in createBooking:", error)
    throw error
  }
}

export async function updateBooking(id: number, updates: Partial<Booking>) {
  try {
    const formattedUpdates = { ...updates }
    if (updates.booking_date) {
      formattedUpdates.booking_date = formatDateForDatabase(updates.booking_date)
    }

    const { data, error } = await supabaseAdmin
      .from("bookings")
      .update({ ...formattedUpdates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Supabase error in updateBooking:", error)
      throw new Error(`Database error: ${error.message}`)
    }

    return data as Booking
  } catch (error) {
    console.error("Error in updateBooking:", error)
    throw error
  }
}

export async function deleteBooking(id: number) {
  try {
    const { data, error } = await supabaseAdmin.from("bookings").delete().eq("id", id).select().single()

    if (error) {
      console.error("Supabase error in deleteBooking:", error)
      throw new Error(`Database error: ${error.message}`)
    }

    return data as Booking
  } catch (error) {
    console.error("Error in deleteBooking:", error)
    throw error
  }
}

// FIXED: Enhanced blocked dates operations with timezone-safe handling
export async function getBlockedDates() {
  try {
    console.log("🔍 Fetching blocked dates from database...")

    const { data, error } = await supabaseAdmin.from("blocked_dates").select("*").order("blocked_date")

    if (error) {
      console.error("❌ Supabase error in getBlockedDates:", error)
      throw new Error(`Database error: ${error.message}`)
    }

    console.log("📊 Raw blocked dates from DB:", data)

    // Process dates to ensure consistent format
    const processedData = (data || []).map((item) => ({
      ...item,
      blocked_date: formatDateForDatabase(item.blocked_date),
    }))

    console.log("📋 Processed blocked dates:", processedData)
    return processedData as BlockedDate[]
  } catch (error) {
    console.error("❌ Error in getBlockedDates:", error)
    throw error
  }
}

export async function addBlockedDate(date: string, reason?: string) {
  try {
    const formattedDate = formatDateForDatabase(date)
    console.log("🚫 Adding blocked date:", date, "→ Formatted:", formattedDate, "with reason:", reason)

    const { data, error } = await supabaseAdmin
      .from("blocked_dates")
      .upsert([{ blocked_date: formattedDate, reason }], {
        onConflict: "blocked_date",
        ignoreDuplicates: false,
      })
      .select()
      .single()

    if (error) {
      console.error("❌ Supabase error in addBlockedDate:", error)
      throw new Error(`Database error: ${error.message}`)
    }

    console.log("✅ Blocked date added successfully:", data)
    return data as BlockedDate
  } catch (error) {
    console.error("❌ Error in addBlockedDate:", error)
    throw error
  }
}

export async function removeBlockedDate(date: string) {
  try {
    const formattedDate = formatDateForDatabase(date)
    console.log("✅ Removing blocked date:", date, "→ Formatted:", formattedDate)

    const { data, error } = await supabaseAdmin
      .from("blocked_dates")
      .delete()
      .eq("blocked_date", formattedDate)
      .select()
      .single()

    if (error) {
      console.error("❌ Supabase error in removeBlockedDate:", error)
      throw new Error(`Database error: ${error.message}`)
    }

    console.log("✅ Blocked date removed successfully:", data)
    return data as BlockedDate
  } catch (error) {
    console.error("❌ Error in removeBlockedDate:", error)
    throw error
  }
}

// FIXED: Enhanced blocked time slots operations with timezone-safe handling
export async function getBlockedTimeSlots() {
  try {
    console.log("🔍 Fetching blocked time slots from database...")

    const { data, error } = await supabaseAdmin
      .from("blocked_time_slots")
      .select("*")
      .order("blocked_date")
      .order("blocked_time")

    if (error) {
      console.error("❌ Supabase error in getBlockedTimeSlots:", error)
      throw new Error(`Database error: ${error.message}`)
    }

    console.log("📊 Raw blocked time slots from DB:", data)

    // Process dates to ensure consistent format
    const processedData = (data || []).map((item) => ({
      ...item,
      blocked_date: formatDateForDatabase(item.blocked_date),
    }))

    console.log("📋 Processed blocked time slots:", processedData)
    return processedData as BlockedTimeSlot[]
  } catch (error) {
    console.error("❌ Error in getBlockedTimeSlots:", error)
    throw error
  }
}

export async function addBlockedTimeSlot(date: string, time: string, reason?: string) {
  try {
    const formattedDate = formatDateForDatabase(date)
    console.log("🚫 Adding blocked time slot:", time, "on", date, "→ Formatted:", formattedDate, "with reason:", reason)

    const { data, error } = await supabaseAdmin
      .from("blocked_time_slots")
      .upsert([{ blocked_date: formattedDate, blocked_time: time, reason }], {
        onConflict: "blocked_date,blocked_time",
        ignoreDuplicates: false,
      })
      .select()
      .single()

    if (error) {
      console.error("❌ Supabase error in addBlockedTimeSlot:", error)
      throw new Error(`Database error: ${error.message}`)
    }

    console.log("✅ Blocked time slot added successfully:", data)
    return data as BlockedTimeSlot
  } catch (error) {
    console.error("❌ Error in addBlockedTimeSlot:", error)
    throw error
  }
}

export async function removeBlockedTimeSlot(date: string, time: string) {
  try {
    const formattedDate = formatDateForDatabase(date)
    console.log("✅ Removing blocked time slot:", time, "on", date, "→ Formatted:", formattedDate)

    const { data, error } = await supabaseAdmin
      .from("blocked_time_slots")
      .delete()
      .eq("blocked_date", formattedDate)
      .eq("blocked_time", time)
      .select()
      .single()

    if (error) {
      console.error("❌ Supabase error in removeBlockedTimeSlot:", error)
      throw new Error(`Database error: ${error.message}`)
    }

    console.log("✅ Blocked time slot removed successfully:", data)
    return data as BlockedTimeSlot
  } catch (error) {
    console.error("❌ Error in removeBlockedTimeSlot:", error)
    throw error
  }
}

// Dashboard stats
export async function getDashboardStats() {
  try {
    const today = formatDateForDatabase(new Date())
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    const weekStartStr = formatDateForDatabase(weekStart)

    const monthStart = new Date()
    monthStart.setDate(1)
    const monthStartStr = formatDateForDatabase(monthStart)

    // Today's bookings
    const { count: todayBookings, error: todayError } = await supabaseAdmin
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("booking_date", today)

    if (todayError) {
      console.error("Error fetching today's bookings:", todayError)
    }

    // Weekly bookings
    const { count: weeklyBookings, error: weeklyError } = await supabaseAdmin
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .gte("booking_date", weekStartStr)

    if (weeklyError) {
      console.error("Error fetching weekly bookings:", weeklyError)
    }

    // Monthly revenue
    const { data: monthlyData, error: monthlyError } = await supabaseAdmin
      .from("bookings")
      .select("amount")
      .gte("booking_date", monthStartStr)
      .neq("status", "cancelled")

    if (monthlyError) {
      console.error("Error fetching monthly revenue:", monthlyError)
    }

    const monthlyRevenue = monthlyData?.reduce((sum, booking) => sum + booking.amount, 0) || 0

    // Pending bookings
    const { count: pendingBookings, error: pendingError } = await supabaseAdmin
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending")

    if (pendingError) {
      console.error("Error fetching pending bookings:", pendingError)
    }

    return {
      todayBookings: todayBookings || 0,
      weeklyBookings: weeklyBookings || 0,
      monthlyRevenue,
      pendingBookings: pendingBookings || 0,
    }
  } catch (error) {
    console.error("Error in getDashboardStats:", error)
    throw error
  }
}

export { testConnection }
