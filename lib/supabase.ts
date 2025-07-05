import { createClient } from "@supabase/supabase-js"
import { supabaseAdmin } from "./supabase-admin"

/* -------------------------------------------------------------------------- */
/*  ENV & PUBLIC CLIENT (for browser code)                                    */
/* -------------------------------------------------------------------------- */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!SUPABASE_URL) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL")
if (!SUPABASE_ANON_KEY) throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY")

/** Public client – use only in browser */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
export function createClientSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}

/* -------------------------------------------------------------------------- */
/*  TYPES                                                                     */
/* -------------------------------------------------------------------------- */
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

/* -------------------------------------------------------------------------- */
/*  UTILITIES                                                                 */
/* -------------------------------------------------------------------------- */
const formatDateForDatabase = (input: string | Date) => {
  try {
    if (typeof input === "string") {
      if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input
      if (input.includes("T")) return input.split("T")[0]
      const [y, m, d] = input.split("-")
      return `${y.padStart(4, "0")}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`
    }
    const date = input as Date
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(
      date.getUTCDate(),
    ).padStart(2, "0")}`
  } catch {
    return String(input)
  }
}

/* -------------------------------------------------------------------------- */
/*  BOOKINGS                                                                  */
/* -------------------------------------------------------------------------- */
export async function getBookings(filters?: { status?: string; date?: string }) {
  let q = supabaseAdmin.from("bookings").select("*")

  if (filters?.status && filters.status !== "all") q = q.eq("status", filters.status)
  if (filters?.date) q = q.eq("booking_date", formatDateForDatabase(filters.date))

  q = q.order("booking_date", { ascending: false }).order("booking_time", { ascending: false })

  const { data, error } = await q
  if (error) throw error
  return data as Booking[]
}

export async function createBooking(payload: Omit<Booking, "id" | "created_at" | "updated_at">) {
  const { data, error } = await supabaseAdmin
    .from("bookings")
    .insert([{ ...payload, booking_date: formatDateForDatabase(payload.booking_date) }])
    .select()
    .single()
  if (error) throw error
  return data as Booking
}

/* -------------------------------------------------------------------------- */
/*  AVAILABILITY – BLOCKED DATES                                              */
/* -------------------------------------------------------------------------- */
export async function getBlockedDates() {
  const { data, error } = await supabaseAdmin.from("blocked_dates").select("*")
  if (error) throw error
  data?.sort((a, b) => (a.blocked_date ?? "").localeCompare(b.blocked_date ?? ""))
  return (data ?? []).map((d) => ({
    ...d,
    blocked_date: formatDateForDatabase(d.blocked_date),
  })) as BlockedDate[]
}

export async function addBlockedDate(date: string, reason?: string) {
  const formatted = formatDateForDatabase(date)
  const { data, error } = await supabaseAdmin
    .from("blocked_dates")
    .upsert([{ blocked_date: formatted, reason }], { onConflict: "blocked_date", ignoreDuplicates: false })
    .select()
    .single()
  if (error) throw error
  return data as BlockedDate
}

export async function removeBlockedDate(date: string) {
  const formatted = formatDateForDatabase(date)
  const { data, error } = await supabaseAdmin
    .from("blocked_dates")
    .delete()
    .eq("blocked_date", formatted)
    .select()
    .single()
  if (error) throw error
  return data as BlockedDate
}

/* -------------------------------------------------------------------------- */
/*  AVAILABILITY – BLOCKED TIME-SLOTS                                         */
/* -------------------------------------------------------------------------- */
export async function getBlockedTimeSlots() {
  const { data, error } = await supabaseAdmin.from("blocked_time_slots").select("*")
  if (error) throw error
  data?.sort((a, b) => {
    const d = (a.blocked_date ?? "").localeCompare(b.blocked_date ?? "")
    return d !== 0 ? d : (a.blocked_time ?? "").localeCompare(b.blocked_time ?? "")
  })
  return (data ?? []).map((d) => ({
    ...d,
    blocked_date: formatDateForDatabase(d.blocked_date),
  })) as BlockedTimeSlot[]
}

export async function addBlockedTimeSlot(date: string, time: string, reason?: string) {
  const formatted = formatDateForDatabase(date)
  const { data, error } = await supabaseAdmin
    .from("blocked_time_slots")
    .upsert([{ blocked_date: formatted, blocked_time: time, reason }], {
      onConflict: "blocked_date,blocked_time",
      ignoreDuplicates: false,
    })
    .select()
    .single()
  if (error) throw error
  return data as BlockedTimeSlot
}

export async function removeBlockedTimeSlot(date: string, time: string) {
  const formatted = formatDateForDatabase(date)
  const { data, error } = await supabaseAdmin
    .from("blocked_time_slots")
    .delete()
    .eq("blocked_date", formatted)
    .eq("blocked_time", time)
    .select()
    .single()
  if (error) throw error
  return data as BlockedTimeSlot
}
