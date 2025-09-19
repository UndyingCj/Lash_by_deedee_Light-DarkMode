// ✅ SECURE DATABASE OPERATIONS - Server-side only
// This file contains all database operations using the admin client
// These functions should ONLY be called from API routes or server components

import { supabaseAdmin } from './supabase-admin'
import type { CreateBookingData, BookingRecord } from './supabase'

// Create a new booking
export async function createBooking(bookingData: CreateBookingData) {
  try {
    console.log("📝 Creating booking:", bookingData)

    const { data, error } = await supabaseAdmin
      .from("bookings")
      .insert([
        {
          client_name: bookingData.client_name,
          client_email: bookingData.client_email,
          client_phone: bookingData.client_phone,
          phone: bookingData.phone,
          email: bookingData.email,
          service_name: bookingData.service_name,
          service: bookingData.service,
          booking_date: bookingData.booking_date,
          booking_time: bookingData.booking_time,
          total_amount: bookingData.total_amount,
          amount: bookingData.amount,
          deposit_amount: bookingData.deposit_amount,
          payment_status: bookingData.payment_status,
          payment_reference: bookingData.payment_reference,
          special_notes: bookingData.special_notes,
          notes: bookingData.notes,
          status: bookingData.status,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("❌ Error creating booking:", error)
      throw error
    }

    console.log("✅ Booking created successfully:", data.id)
    return { success: true, data }
  } catch (error) {
    console.error("❌ Failed to create booking:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

// Get all bookings
export async function getBookings() {
  try {
    const { data, error } = await supabaseAdmin.from("bookings").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("❌ Error fetching bookings:", error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error("❌ Failed to fetch bookings:", error)
    return []
  }
}

// Update booking
export async function updateBooking(id: number, updates: Partial<BookingRecord>) {
  try {
    const { data, error } = await supabaseAdmin
      .from("bookings")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("❌ Error updating booking:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("❌ Failed to update booking:", error)
    throw error
  }
}

// Update booking payment status
export async function updateBookingPaymentStatus(paymentReference: string, status: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("bookings")
      .update({
        payment_status: status,
        updated_at: new Date().toISOString(),
      })
      .eq("payment_reference", paymentReference)
      .select()
      .single()

    if (error) {
      console.error("❌ Error updating booking payment status:", error)
      throw error
    }

    console.log("✅ Booking payment status updated:", data.id)
    return { success: true, data }
  } catch (error) {
    console.error("❌ Failed to update booking payment status:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

// Blocked dates operations
export async function getBlockedDates() {
  try {
    const { data, error } = await supabaseAdmin.from("blocked_dates").select("*").order("blocked_date")

    if (error) {
      console.error("❌ Error fetching blocked dates:", error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error("❌ Failed to fetch blocked dates:", error)
    return []
  }
}

export async function addBlockedDate(date: string, reason?: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("blocked_dates")
      .upsert([{ blocked_date: date, reason }], {
        onConflict: "blocked_date",
        ignoreDuplicates: false,
      })
      .select()
      .single()

    if (error) {
      console.error("❌ Error adding blocked date:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("❌ Failed to add blocked date:", error)
    throw error
  }
}

export async function removeBlockedDate(date: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("blocked_dates")
      .delete()
      .eq("blocked_date", date)
      .select()
      .single()

    if (error) {
      console.error("❌ Error removing blocked date:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("❌ Failed to remove blocked date:", error)
    throw error
  }
}

// Blocked time slots operations
export async function getBlockedTimeSlots() {
  try {
    const { data, error } = await supabaseAdmin
      .from("blocked_time_slots")
      .select("*")
      .order("blocked_date")
      .order("blocked_time")

    if (error) {
      console.error("❌ Error fetching blocked time slots:", error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error("❌ Failed to fetch blocked time slots:", error)
    return []
  }
}

export async function addBlockedTimeSlot(date: string, time: string, reason?: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("blocked_time_slots")
      .upsert([{ blocked_date: date, blocked_time: time, reason }], {
        onConflict: "blocked_date,blocked_time",
        ignoreDuplicates: false,
      })
      .select()
      .single()

    if (error) {
      console.error("❌ Error adding blocked time slot:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("❌ Failed to add blocked time slot:", error)
    throw error
  }
}

export async function removeBlockedTimeSlot(date: string, time: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("blocked_time_slots")
      .delete()
      .eq("blocked_date", date)
      .eq("blocked_time", time)
      .select()
      .single()

    if (error) {
      console.error("❌ Error removing blocked time slot:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("❌ Failed to remove blocked time slot:", error)
    throw error
  }
}

// Dashboard stats
export async function getDashboardStats() {
  try {
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

    const monthlyRevenue = monthlyData?.reduce((sum, booking) => sum + (booking.amount || 0), 0) || 0

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
  } catch (error) {
    console.error("❌ Error fetching dashboard stats:", error)
    return {
      todayBookings: 0,
      weeklyBookings: 0,
      monthlyRevenue: 0,
      pendingBookings: 0,
    }
  }
}