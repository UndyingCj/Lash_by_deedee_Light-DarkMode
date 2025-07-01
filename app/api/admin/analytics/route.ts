import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Handle missing environment variables gracefully
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://cqnfxvgdamevrvlniryr.supabase.co"
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbmZ4dmdkYW1ldnJ2bG5pcnlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTMyNzEwMSwiZXhwIjoyMDY0OTAzMTAxfQ.T0TUi8QEh-d7L-P4lCqHoX7l7rVS99SNaoTomqInJyI"

let supabase: any = null

try {
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
} catch (error) {
  console.error("Failed to initialize Supabase client:", error)
}

export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({
        totalBookings: 0,
        totalRevenue: 0,
        pendingBookings: 0,
        completedBookings: 0,
        monthlyRevenue: [],
        topServices: [],
        recentBookings: [],
      })
    }

    // Get total bookings
    const { data: bookings, error: bookingsError } = await supabase.from("bookings").select("*")

    if (bookingsError) {
      console.error("Error fetching bookings:", bookingsError)
      return NextResponse.json({
        totalBookings: 0,
        totalRevenue: 0,
        pendingBookings: 0,
        completedBookings: 0,
        monthlyRevenue: [],
        topServices: [],
        recentBookings: [],
      })
    }

    const totalBookings = bookings?.length || 0
    const totalRevenue = bookings?.reduce((sum, booking) => sum + (booking.amount || 0), 0) || 0
    const pendingBookings = bookings?.filter((b) => b.status === "pending").length || 0
    const completedBookings = bookings?.filter((b) => b.status === "confirmed").length || 0

    // Get monthly revenue (last 6 months)
    const monthlyRevenue = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthName = date.toLocaleDateString("en-US", { month: "short" })

      const monthRevenue =
        bookings
          ?.filter((booking) => {
            const bookingDate = new Date(booking.created_at)
            return bookingDate.getMonth() === date.getMonth() && bookingDate.getFullYear() === date.getFullYear()
          })
          .reduce((sum, booking) => sum + (booking.amount || 0), 0) || 0

      monthlyRevenue.push({
        month: monthName,
        revenue: monthRevenue,
      })
    }

    // Get top services
    const serviceCount: Record<string, number> = {}
    bookings?.forEach((booking) => {
      if (booking.service) {
        serviceCount[booking.service] = (serviceCount[booking.service] || 0) + 1
      }
    })

    const topServices = Object.entries(serviceCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([service, count]) => ({ service, count }))

    // Get recent bookings
    const recentBookings =
      bookings?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10) || []

    return NextResponse.json({
      totalBookings,
      totalRevenue,
      pendingBookings,
      completedBookings,
      monthlyRevenue,
      topServices,
      recentBookings,
    })
  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json({
      totalBookings: 0,
      totalRevenue: 0,
      pendingBookings: 0,
      completedBookings: 0,
      monthlyRevenue: [],
      topServices: [],
      recentBookings: [],
    })
  }
}
