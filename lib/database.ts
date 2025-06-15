import { neon } from "@neondatabase/serverless"

if (!process.env.POSTGRES_URL) {
  throw new Error("POSTGRES_URL environment variable is not set")
}

const sql = neon(process.env.POSTGRES_URL)

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
  let query = "SELECT * FROM bookings"
  const conditions = []
  const params = []

  if (filters?.status && filters.status !== "all") {
    conditions.push(`status = $${params.length + 1}`)
    params.push(filters.status)
  }

  if (filters?.date) {
    conditions.push(`booking_date = $${params.length + 1}`)
    params.push(filters.date)
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ")
  }

  query += " ORDER BY booking_date DESC, booking_time DESC"

  return (await sql(query, params)) as Booking[]
}

export async function createBooking(booking: Omit<Booking, "id" | "created_at" | "updated_at">) {
  const result = await sql`
    INSERT INTO bookings (client_name, phone, email, service, booking_date, booking_time, status, amount, notes)
    VALUES (${booking.client_name}, ${booking.phone}, ${booking.email}, ${booking.service}, 
            ${booking.booking_date}, ${booking.booking_time}, ${booking.status}, ${booking.amount}, ${booking.notes})
    RETURNING *
  `
  return result[0] as Booking
}

export async function updateBooking(id: number, updates: Partial<Booking>) {
  const setClause = Object.keys(updates)
    .filter((key) => key !== "id")
    .map((key, index) => `${key} = $${index + 2}`)
    .join(", ")

  const values = Object.values(updates).filter((_, index) => Object.keys(updates)[index] !== "id")

  const result = await sql(
    `UPDATE bookings SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
    [id, ...values],
  )
  return result[0] as Booking
}

export async function deleteBooking(id: number) {
  const result = await sql`DELETE FROM bookings WHERE id = ${id} RETURNING *`
  return result[0] as Booking
}

// Blocked dates operations
export async function getBlockedDates() {
  return (await sql`SELECT * FROM blocked_dates ORDER BY blocked_date`) as BlockedDate[]
}

export async function addBlockedDate(date: string, reason?: string) {
  const result = await sql`
    INSERT INTO blocked_dates (blocked_date, reason)
    VALUES (${date}, ${reason})
    ON CONFLICT (blocked_date) DO NOTHING
    RETURNING *
  `
  return result[0] as BlockedDate
}

export async function removeBlockedDate(date: string) {
  const result = await sql`DELETE FROM blocked_dates WHERE blocked_date = ${date} RETURNING *`
  return result[0] as BlockedDate
}

// Blocked time slots operations
export async function getBlockedTimeSlots() {
  return (await sql`SELECT * FROM blocked_time_slots ORDER BY blocked_date, blocked_time`) as BlockedTimeSlot[]
}

export async function addBlockedTimeSlot(date: string, time: string, reason?: string) {
  const result = await sql`
    INSERT INTO blocked_time_slots (blocked_date, blocked_time, reason)
    VALUES (${date}, ${time}, ${reason})
    ON CONFLICT (blocked_date, blocked_time) DO NOTHING
    RETURNING *
  `
  return result[0] as BlockedTimeSlot
}

export async function removeBlockedTimeSlot(date: string, time: string) {
  const result = await sql`
    DELETE FROM blocked_time_slots 
    WHERE blocked_date = ${date} AND blocked_time = ${time} 
    RETURNING *
  `
  return result[0] as BlockedTimeSlot
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

  const [todayBookings] = await sql`
    SELECT COUNT(*) as count FROM bookings WHERE booking_date = ${today}
  `

  const [weeklyBookings] = await sql`
    SELECT COUNT(*) as count FROM bookings WHERE booking_date >= ${weekStartStr}
  `

  const [monthlyRevenue] = await sql`
    SELECT COALESCE(SUM(amount), 0) as total FROM bookings 
    WHERE booking_date >= ${monthStartStr} AND status != 'cancelled'
  `

  const [pendingBookings] = await sql`
    SELECT COUNT(*) as count FROM bookings WHERE status = 'pending'
  `

  return {
    todayBookings: Number.parseInt(todayBookings.count),
    weeklyBookings: Number.parseInt(weeklyBookings.count),
    monthlyRevenue: Number.parseFloat(monthlyRevenue.total),
    pendingBookings: Number.parseInt(pendingBookings.count),
  }
}
