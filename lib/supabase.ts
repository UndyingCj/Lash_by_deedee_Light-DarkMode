import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export interface BookingRecord {
  id: string
  client_name: string
  client_email: string
  client_phone?: string
  phone: string
  email: string
  service_id?: string
  service_name: string
  service: string
  booking_date: string
  booking_time: string
  total_amount: number
  amount: number
  deposit_amount?: number
  payment_status?: string
  payment_reference?: string
  special_notes?: string
  notes?: string
  status?: string
  created_at?: string
  updated_at?: string
}

export interface CreateBookingData {
  client_name: string
  client_email: string
  client_phone: string
  phone: string
  email: string
  service_name: string
  service: string
  booking_date: string
  booking_time: string
  total_amount: number
  amount: number
  deposit_amount: number
  payment_status: string
  payment_reference: string
  special_notes?: string
  notes?: string
  status: string
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

// ✅ NOTE: Server-side database operations have been moved to /lib/database-operations.ts
// This file now only contains client-side Supabase configuration and type definitions
