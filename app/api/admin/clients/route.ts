import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET(request: NextRequest) {
  try {
    // Get all bookings to calculate client statistics
    const { data: bookings, error: bookingsError } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .order("booking_date", { ascending: false })

    if (bookingsError) {
      console.error("Error fetching bookings for clients:", bookingsError)
      throw new Error(`Database error: ${bookingsError.message}`)
    }

    // Group bookings by client email to create client profiles
    const clientMap: { [email: string]: any } = {}

    bookings?.forEach((booking) => {
      const email = booking.email
      if (!clientMap[email]) {
        clientMap[email] = {
          id: booking.id,
          name: booking.client_name,
          email: booking.email,
          phone: booking.phone,
          totalBookings: 0,
          totalSpent: 0,
          lastVisit: booking.booking_date,
          preferredServices: [],
          serviceCount: {},
          averageRating: 4.8, // Default rating
          status: "active",
        }
      }

      const client = clientMap[email]
      client.totalBookings++

      if (booking.status !== "cancelled") {
        client.totalSpent += booking.amount
      }

      // Track last visit
      if (new Date(booking.booking_date) > new Date(client.lastVisit)) {
        client.lastVisit = booking.booking_date
      }

      // Track service preferences
      if (!client.serviceCount[booking.service]) {
        client.serviceCount[booking.service] = 0
      }
      client.serviceCount[booking.service]++
    })

    // Process client data
    const clients = Object.values(clientMap).map((client: any) => {
      // Determine preferred services (top 3)
      const sortedServices = Object.entries(client.serviceCount)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 3)
        .map(([service]) => service)

      client.preferredServices = sortedServices

      // Determine client status
      const daysSinceLastVisit = Math.floor(
        (new Date().getTime() - new Date(client.lastVisit).getTime()) / (1000 * 60 * 60 * 24),
      )

      if (client.totalSpent >= 200000 || client.totalBookings >= 8) {
        client.status = "vip"
      } else if (daysSinceLastVisit > 60) {
        client.status = "inactive"
      } else {
        client.status = "active"
      }

      // Adjust rating based on booking history
      if (client.totalBookings >= 5) {
        client.averageRating = 4.9
      } else if (client.totalBookings >= 10) {
        client.averageRating = 5.0
      }

      // Clean up temporary data
      delete client.serviceCount

      return client
    })

    // Sort clients by total spent (descending)
    clients.sort((a, b) => b.totalSpent - a.totalSpent)

    return NextResponse.json({
      success: true,
      data: clients,
    })
  } catch (error) {
    console.error("Error in clients API:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch clients",
      },
      { status: 500 },
    )
  }
}
