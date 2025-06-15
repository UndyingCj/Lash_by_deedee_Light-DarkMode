import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

// Server-side client with service role key (admin operations)
export const supabaseAdmin = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Client-side Supabase client (public operations only)
export const supabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

// Client-side hook for browser usage
export function createClientSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
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

// Booking operations
export async function getBookings(filters?: { status?: string; date?: string }) {
  let query = supabaseAdmin.from("bookings").select("*")

  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status)
  }

  if (filters?.date) {
    query = query.eq("booking_date", filters.date)
  }

  query = query.order("booking_date", { ascending: false }).order("booking_time", { ascending: false })

  const { data, error } = await query

  if (error) throw error
  return data as Booking[]
}

export async function createBooking(booking: Omit<Booking, "id" | "created_at" | "updated_at">) {
  const { data, error } = await supabaseAdmin.from("bookings").insert([booking]).select().single()

  if (error) throw error
  return data as Booking
}

export async function updateBooking(id: number, updates: Partial<Booking>) {
  const { data, error } = await supabaseAdmin
    .from("bookings")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data as Booking
}

export async function deleteBooking(id: number) {
  const { data, error } = await supabaseAdmin.from("bookings").delete().eq("id", id).select().single()

  if (error) throw error
  return data as Booking
}

// Blocked dates operations
export async function getBlockedDates() {
  const { data, error } = await supabaseAdmin.from("blocked_dates").select("*").order("blocked_date")

  if (error) throw error
  return data as BlockedDate[]
}

export async function addBlockedDate(date: string, reason?: string) {
  const { data, error } = await supabaseAdmin
    .from("blocked_dates")
    .upsert([{ blocked_date: date, reason }], {
      onConflict: "blocked_date",
      ignoreDuplicates: true,
    })
    .select()
    .single()

  if (error) throw error
  return data as BlockedDate
}

export async function removeBlockedDate(date: string) {
  const { data, error } = await supabaseAdmin.from("blocked_dates").delete().eq("blocked_date", date).select().single()

  if (error) throw error
  return data as BlockedDate
}

// Blocked time slots operations
export async function getBlockedTimeSlots() {
  const { data, error } = await supabaseAdmin
    .from("blocked_time_slots")
    .select("*")
    .order("blocked_date")
    .order("blocked_time")

  if (error) throw error
  return data as BlockedTimeSlot[]
}

export async function addBlockedTimeSlot(date: string, time: string, reason?: string) {
  const { data, error } = await supabaseAdmin
    .from("blocked_time_slots")
    .upsert([{ blocked_date: date, blocked_time: time, reason }], {
      onConflict: "blocked_date,blocked_time",
      ignoreDuplicates: true,
    })
    .select()
    .single()

  if (error) throw error
  return data as BlockedTimeSlot
}

export async function removeBlockedTimeSlot(date: string, time: string) {
  const { data, error } = await supabaseAdmin
    .from("blocked_time_slots")
    .delete()
    .eq("blocked_date", date)
    .eq("blocked_time", time)
    .select()
    .single()

  if (error) throw error
  return data as BlockedTimeSlot
}

// Dashboard stats
export async function getDashboardStats() {
  const today = new Date().toISOString().split("T")[0]
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  const weekStartStr = weekStart.toISOString().split("T")[0]

  const monthStart = new Date()
  monthStart.setDate(1)
  const monthStartStr = monthStart.toISOString().split("T")[0]

  // Today's bookings
  const { count: todayBookings } = await supabaseAdmin
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("booking_date", today)

  // Weekly bookings
  const { count: weeklyBookings } = await supabaseAdmin
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .gte("booking_date", weekStartStr)

  // Monthly revenue
  const { data: monthlyData } = await supabaseAdmin
    .from("bookings")
    .select("amount")
    .gte("booking_date", monthStartStr)
    .neq("status", "cancelled")

  const monthlyRevenue = monthlyData?.reduce((sum, booking) => sum + booking.amount, 0) || 0

  // Pending bookings
  const { count: pendingBookings } = await supabaseAdmin
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending")

  return {
    todayBookings: todayBookings || 0,
    weeklyBookings: weeklyBookings || 0,
    monthlyRevenue,
    pendingBookings: pendingBookings || 0,
  }
}
