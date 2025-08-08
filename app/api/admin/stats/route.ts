import { type NextRequest, NextResponse } from "next/server"
import { getDashboardStats, getBookings } from "@/lib/supabase"
import { verifyAuth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  // Verify authentication
  const authResult = await verifyAuth(request)
  if (!authResult.success) {
    return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 })
  }

  try {
    const stats = await getDashboardStats()
    const recentBookings = await getBookings()

    return NextResponse.json({
      success: true,
      data: {
        stats,
        recentBookings: recentBookings.slice(0, 5), // Get 5 most recent
      },
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch dashboard stats" }, { status: 500 })
  }
}
