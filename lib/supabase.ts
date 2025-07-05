import { createClient, type SupabaseClient } from "@supabase/supabase-js"

/* ----------------------------------------------------------
 *  Shared setup
 * -------------------------------------------------------- */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * Public (anon) client — safe to use everywhere, including the browser.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Service-role client — only initialised on the server where the secret key
 * is available.  On the browser this variable is undefined.
 */
const isServer = typeof window === "undefined"
export const supabaseAdmin: SupabaseClient | undefined =
  isServer && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    : undefined

/* ----------------------------------------------------------
 *  Data types matching the actual database schema
 * -------------------------------------------------------- */
export interface Booking {
  id: string // UUID in database
  client_name: string
  phone: string // Renamed from client_phone
  email?: string // Renamed from client_email
  service: string // Renamed from service_name
  booking_date: string
  booking_time: string
  status: "pending" | "confirmed" | "cancelled" | "completed"
  amount?: number // Renamed from total_amount
  deposit_amount?: number
  payment_status?: string
  payment_reference?: string
  notes?: string // Renamed from special_notes
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

/* ----------------------------------------------------------
 *  Helpers to normalise column names
 * -------------------------------------------------------- */
function mapBlockedDate(row: any): BlockedDate {
  return {
    ...row,
    blocked_date: row.blocked_date ?? row.date,
  }
}

function mapBlockedSlot(row: any): BlockedTimeSlot {
  return {
    ...row,
    blocked_date: row.blocked_date ?? row.date,
    blocked_time: row.blocked_time ?? row.time,
  }
}

/* ----------------------------------------------------------
 *  Booking CRUD (WRITE actions require supabaseAdmin)
 * -------------------------------------------------------- */
function requireAdmin() {
  if (!supabaseAdmin) {
    throw new Error(
      "supabaseAdmin is undefined on the client. " + "Call this function from a Server Action / Route Handler.",
    )
  }
}

export async function createBooking(bookingData: Omit<Booking, "id" | "created_at" | "updated_at">): Promise<Booking> {
  requireAdmin()

  console.log("📝 Creating booking with data:", bookingData)

  const { data, error } = await supabaseAdmin!
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
    console.error("❌ Error creating booking:", error)
    throw new Error(`Failed to create booking: ${error.message}`)
  }

  console.log("✅ Booking created successfully:", data.id)
  return data
}

export async function updateBooking(id: string, updates: Partial<Booking>): Promise<Booking> {
  requireAdmin()

  const { data, error } = await supabaseAdmin!
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

export async function deleteBooking(id: string): Promise<void> {
  requireAdmin()

  const { error } = await supabaseAdmin!.from("bookings").delete().eq("id", id)

  if (error) {
    console.error("Error deleting booking:", error)
    throw new Error(`Failed to delete booking: ${error.message}`)
  }
}

/* ----------------------------------------------------------
 *  Read-only helpers (safe on client and server)
 * -------------------------------------------------------- */
export async function getBookings(): Promise<Booking[]> {
  const client = supabaseAdmin ?? supabase
  const { data, error } = await client.from("bookings").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching bookings:", error)
    throw new Error(`Failed to fetch bookings: ${error.message}`)
  }

  return data || []
}

export async function getBlockedDates(): Promise<BlockedDate[]> {
  const client = supabaseAdmin ?? supabase
  const { data, error } = await client.from("blocked_dates").select("*")

  if (error) {
    console.error("Error fetching blocked dates:", error)
    throw new Error(`Failed to fetch blocked dates: ${error.message}`)
  }

  return (data || []).map(mapBlockedDate)
}

export async function getBlockedTimeSlots(): Promise<BlockedTimeSlot[]> {
  const client = supabaseAdmin ?? supabase
  const { data, error } = await client.from("blocked_time_slots").select("*")

  if (error) {
    console.error("Error fetching blocked time slots:", error)
    throw new Error(`Failed to fetch blocked time slots: ${error.message}`)
  }

  return (data || []).map(mapBlockedSlot)
}

/* ----------------------------------------------------------
 *  Analytics helpers  (read-only)
 * -------------------------------------------------------- */
export async function getBookingStats() {
  const bookings = await getBookings()

  const total = bookings.length
  const confirmed = bookings.filter((b) => b.status === "confirmed").length
  const pending = bookings.filter((b) => b.status === "pending").length
  const cancelled = bookings.filter((b) => b.status === "cancelled").length
  const completed = bookings.filter((b) => b.status === "completed").length

  const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.amount || 0), 0)

  return {
    total,
    confirmed,
    pending,
    cancelled,
    completed,
    totalRevenue,
  }
}

/* ----------------------------------------------------------
 *  Client list (read-only)
 * -------------------------------------------------------- */
export async function getClients() {
  const client = supabaseAdmin ?? supabase
  const { data, error } = await client.from("bookings").select("client_name, email, phone, created_at")

  if (error) {
    console.error("Error fetching clients:", error)
    throw new Error(`Failed to fetch clients: ${error.message}`)
  }

  // Group by unique identifier (email if available, otherwise phone)
  const map = new Map<string, any>()
  data?.forEach((b) => {
    const key = b.email ?? b.phone
    if (!map.has(key)) {
      map.set(key, {
        name: b.client_name,
        email: b.email,
        phone: b.phone,
        firstBooking: b.created_at,
      })
    }
  })

  return Array.from(map.values())
}
