import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client for server-side operations
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export interface Booking {
  id: number
  client_name: string
  phone: string
  email: string
  service: string
  booking_date: string
  booking_time: string
  status: "pending" | "confirmed" | "cancelled" | "completed"
  amount: number
  notes?: string
  created_at: string
  updated_at: string
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

// ——— helpers to reconcile prod-db column names ———
function mapBlockedDate(row: any) {
  return {
    ...row,
    // tolerate either column name
    blocked_date: row.blocked_date ?? row.date,
  } as BlockedDate
}

function mapBlockedSlot(row: any) {
  return {
    ...row,
    blocked_date: row.blocked_date ?? row.date,
    blocked_time: row.blocked_time ?? row.time,
  } as BlockedTimeSlot
}

// Booking operations
export async function createBooking(bookingData: Omit<Booking, "id" | "created_at" | "updated_at">): Promise<Booking> {
  console.log("Creating booking with data:", bookingData)

  const { data, error } = await supabaseAdmin
    .from("bookings")
    .insert([
      {
        ...bookingData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
    .select()
    .single()

  if (error) {
    console.error("Error creating booking:", error)
    throw new Error(`Failed to create booking: ${error.message}`)
  }

  console.log("Booking created successfully:", data)
  return data
}

export async function getBookings(): Promise<Booking[]> {
  const { data, error } = await supabaseAdmin.from("bookings").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching bookings:", error)
    throw new Error(`Failed to fetch bookings: ${error.message}`)
  }

  return data || []
}

export async function updateBooking(id: number, updates: Partial<Booking>): Promise<Booking> {
  const { data, error } = await supabaseAdmin
    .from("bookings")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating booking:", error)
    throw new Error(`Failed to update booking: ${error.message}`)
  }

  return data
}

export async function deleteBooking(id: number): Promise<void> {
  const { error } = await supabaseAdmin.from("bookings").delete().eq("id", id)

  if (error) {
    console.error("Error deleting booking:", error)
    throw new Error(`Failed to delete booking: ${error.message}`)
  }
}

// Blocked dates operations
// ── BLOCKED DATES ────────────────────────────────────────────────────────────
export async function getBlockedDates(): Promise<BlockedDate[]> {
  const { data, error } = await supabaseAdmin.from("blocked_dates").select("*")

  if (error) {
    console.error("Error fetching blocked dates:", error)
    throw new Error(`Failed to fetch blocked dates: ${error.message}`)
  }

  return (data || []).map(mapBlockedDate)
}

export async function addBlockedDate(date: string, reason?: string): Promise<BlockedDate> {
  const { data, error } = await supabaseAdmin
    .from("blocked_dates")
    // live DB uses "date" not "blocked_date"
    .insert([{ date, reason }])
    .select()
    .single()

  if (error) {
    console.error("Error adding blocked date:", error)
    throw new Error(`Failed to add blocked date: ${error.message}`)
  }

  return mapBlockedDate(data)
}

export async function removeBlockedDate(id: number): Promise<void> {
  const { error } = await supabaseAdmin.from("blocked_dates").delete().eq("id", id)

  if (error) {
    console.error("Error removing blocked date:", error)
    throw new Error(`Failed to remove blocked date: ${error.message}`)
  }
}

// Blocked time slots operations
// ── BLOCKED TIME SLOTS ───────────────────────────────────────────────────────
export async function getBlockedTimeSlots(): Promise<BlockedTimeSlot[]> {
  const { data, error } = await supabaseAdmin.from("blocked_time_slots").select("*")

  if (error) {
    console.error("Error fetching blocked time slots:", error)
    throw new Error(`Failed to fetch blocked time slots: ${error.message}`)
  }

  return (data || []).map(mapBlockedSlot)
}

export async function addBlockedTimeSlot(date: string, time: string, reason?: string): Promise<BlockedTimeSlot> {
  const { data, error } = await supabaseAdmin
    .from("blocked_time_slots")
    // live DB uses "date" and "time"
    .insert([{ date, time, reason }])
    .select()
    .single()

  if (error) {
    console.error("Error adding blocked time slot:", error)
    throw new Error(`Failed to add blocked time slot: ${error.message}`)
  }

  return mapBlockedSlot(data)
}

export async function removeBlockedTimeSlot(id: number): Promise<void> {
  const { error } = await supabaseAdmin.from("blocked_time_slots").delete().eq("id", id)

  if (error) {
    console.error("Error removing blocked time slot:", error)
    throw new Error(`Failed to remove blocked time slot: ${error.message}`)
  }
}

// Analytics and stats
export async function getBookingStats() {
  const { data: bookings, error } = await supabaseAdmin.from("bookings").select("*")

  if (error) {
    console.error("Error fetching booking stats:", error)
    throw new Error(`Failed to fetch booking stats: ${error.message}`)
  }

  const total = bookings?.length || 0
  const confirmed = bookings?.filter((b) => b.status === "confirmed").length || 0
  const pending = bookings?.filter((b) => b.status === "pending").length || 0
  const cancelled = bookings?.filter((b) => b.status === "cancelled").length || 0
  const completed = bookings?.filter((b) => b.status === "completed").length || 0

  const totalRevenue = bookings?.reduce((sum, booking) => sum + (booking.amount || 0), 0) || 0

  return {
    total,
    confirmed,
    pending,
    cancelled,
    completed,
    totalRevenue,
  }
}

// Client operations
export async function getClients() {
  const { data: bookings, error } = await supabaseAdmin.from("bookings").select("client_name, email, phone, created_at")

  if (error) {
    console.error("Error fetching clients:", error)
    throw new Error(`Failed to fetch clients: ${error.message}`)
  }

  // Group by email to get unique clients
  const clientMap = new Map()
  bookings?.forEach((booking) => {
    const key = booking.email || booking.phone
    if (!clientMap.has(key)) {
      clientMap.set(key, {
        name: booking.client_name,
        email: booking.email,
        phone: booking.phone,
        firstBooking: booking.created_at,
      })
    }
  })

  return Array.from(clientMap.values())
}
