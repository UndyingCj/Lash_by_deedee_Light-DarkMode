import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const today = new Date().toISOString().split("T")[0]
    const currentMonth = new Date().toISOString().slice(0, 7)

    // Get total bookings
    const { count: totalBookings } = await supabase.from("bookings").select("*", { count: "exact", head: true })

    // Get today's bookings
    const { count: todayBookings } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("booking_date", today)

    // Get total revenue
    const { data: revenueData } = await supabase.from("bookings").select("total_amount").eq("payment_status", "paid")

    const totalRevenue = revenueData?.reduce((sum, booking) => sum + (booking.total_amount || 0), 0) || 0

    // Get monthly revenue
    const { data: monthlyRevenueData } = await supabase
      .from("bookings")
      .select("total_amount")
      .eq("payment_status", "paid")
      .gte("booking_date", `${currentMonth}-01`)
      .lt("booking_date", `${currentMonth}-32`)

    const monthlyRevenue = monthlyRevenueData?.reduce((sum, booking) => sum + (booking.total_amount || 0), 0) || 0

    // Get pending payments
    const { count: pendingPayments } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("payment_status", "pending")

    // Get completed bookings
    const { count: completedBookings } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed")

    return NextResponse.json({
      totalBookings: totalBookings || 0,
      todayBookings: todayBookings || 0,
      totalRevenue,
      monthlyRevenue,
      pendingPayments: pendingPayments || 0,
      completedBookings: completedBookings || 0,
    })
  } catch (error) {
    console.error("Stats error:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
