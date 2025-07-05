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

// Create a new booking
export async function createBooking(bookingData: CreateBookingData) {
  try {
    console.log("📝 Creating booking:", bookingData)

    const { data, error } = await supabase
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
    const { data, error } = await supabase.from("bookings").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("❌ Error fetching bookings:", error)
      throw error
    }

    return { success: true, data }
  } catch (error) {
    console.error("❌ Failed to fetch bookings:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

// Update booking payment status
export async function updateBookingPaymentStatus(paymentReference: string, status: string) {
  try {
    const { data, error } = await supabase
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
