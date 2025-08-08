import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { verifyAuth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  // Verify authentication
  const authResult = await verifyAuth(request)
  if (!authResult.success) {
    return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 })
  }
  try {
    const { searchParams } = new URL(request.url)
    const range = searchParams.get("range") || "30"

    const daysAgo = Number.parseInt(range)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysAgo)
    const startDateStr = startDate.toISOString().split("T")[0]

    // Get bookings for the specified range
    const { data: bookings, error: bookingsError } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .gte("booking_date", startDateStr)
      .neq("status", "cancelled")

    if (bookingsError) {
      console.error("Error fetching bookings for analytics:", bookingsError)
      throw new Error(`Database error: ${bookingsError.message}`)
    }

    // Calculate analytics
    const totalRevenue = bookings?.reduce((sum, booking) => sum + booking.amount, 0) || 0
    const totalBookings = bookings?.length || 0
    const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0

    // Calculate service popularity
    const serviceStats: { [key: string]: { count: number; revenue: number } } = {}
    bookings?.forEach((booking) => {
      if (!serviceStats[booking.service]) {
        serviceStats[booking.service] = { count: 0, revenue: 0 }
      }
      serviceStats[booking.service].count++
      serviceStats[booking.service].revenue += booking.amount
    })

    const popularServices = Object.entries(serviceStats)
      .map(([service, stats]) => ({
        service,
        count: stats.count,
        revenue: stats.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    // Calculate monthly trends (last 6 months)
    const monthlyTrends = []
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date()
      monthDate.setMonth(monthDate.getMonth() - i)
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)

      const monthBookings =
        bookings?.filter((booking) => {
          const bookingDate = new Date(booking.booking_date)
          return bookingDate >= monthStart && bookingDate <= monthEnd
        }) || []

      monthlyTrends.push({
        month: monthDate.toLocaleDateString("en-US", { month: "short" }),
        bookings: monthBookings.length,
        revenue: monthBookings.reduce((sum, booking) => sum + booking.amount, 0),
      })
    }

    // Calculate growth rates (compare with previous period)
    const previousStartDate = new Date(startDate)
    previousStartDate.setDate(previousStartDate.getDate() - daysAgo)
    const previousStartDateStr = previousStartDate.toISOString().split("T")[0]

    const { data: previousBookings } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .gte("booking_date", previousStartDateStr)
      .lt("booking_date", startDateStr)
      .neq("status", "cancelled")

    const previousRevenue = previousBookings?.reduce((sum, booking) => sum + booking.amount, 0) || 0
    const previousBookingCount = previousBookings?.length || 0

    const revenueGrowth = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0
    const bookingGrowth =
      previousBookingCount > 0 ? ((totalBookings - previousBookingCount) / previousBookingCount) * 100 : 0

    // Get unique clients for retention calculation
    const { data: allBookings } = await supabaseAdmin.from("bookings").select("email").neq("status", "cancelled")

    const uniqueClients = new Set(allBookings?.map((b) => b.email) || [])
    const recentClients = new Set(bookings?.map((b) => b.email) || [])
    const clientRetentionRate = uniqueClients.size > 0 ? (recentClients.size / uniqueClients.size) * 100 : 0

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue,
        totalBookings,
        averageBookingValue: Math.round(averageBookingValue),
        clientRetentionRate: Math.round(clientRetentionRate),
        popularServices,
        monthlyTrends,
        revenueGrowth: Math.round(revenueGrowth * 10) / 10,
        bookingGrowth: Math.round(bookingGrowth * 10) / 10,
      },
    })
  } catch (error) {
    console.error("Error in analytics API:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch analytics",
      },
      { status: 500 },
    )
  }
}
