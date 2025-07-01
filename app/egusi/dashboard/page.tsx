"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, DollarSign, TrendingUp, Clock, CheckCircle, Settings, LogOut } from "lucide-react"

interface DashboardStats {
  totalBookings: number
  todayBookings: number
  totalRevenue: number
  monthlyRevenue: number
  pendingPayments: number
  completedBookings: number
}

interface RecentBooking {
  id: string
  client_name: string
  service_name: string
  booking_date: string
  booking_time: string
  status: string
  payment_status: string
  total_amount: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    todayBookings: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    pendingPayments: 0,
    completedBookings: 0,
  })
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/check")
        if (!response.ok) {
          router.push("/egusi")
          return
        }
        const data = await response.json()
        setUser(data.user)
      } catch (error) {
        router.push("/egusi")
      }
    }

    checkAuth()
  }, [router])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch stats
        const statsResponse = await fetch("/api/admin/stats")
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStats(statsData)
        }

        // Fetch recent bookings
        const bookingsResponse = await fetch("/api/admin/bookings?limit=5")
        if (bookingsResponse.ok) {
          const bookingsData = await bookingsResponse.json()
          setRecentBookings(bookingsData.bookings || [])
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/egusi")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Confirmed
          </Badge>
        )
      case "pending":
        return <Badge variant="secondary">Pending</Badge>
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Paid
          </Badge>
        )
      case "pending":
        return <Badge variant="secondary">Pending</Badge>
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Good morning, {user?.name || "Admin"}! 👋</h1>
              <p className="text-gray-600">Here's what's happening with your business today.</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => router.push("/egusi/settings")}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBookings}</div>
              <p className="text-xs text-muted-foreground">{stats.todayBookings} today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">₦{stats.monthlyRevenue.toLocaleString()} this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingPayments}</div>
              <p className="text-xs text-muted-foreground">Awaiting payment</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedBookings}</div>
              <p className="text-xs text-muted-foreground">Services completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
            <CardDescription>Latest bookings from your clients</CardDescription>
          </CardHeader>
          <CardContent>
            {recentBookings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No recent bookings found</div>
            ) : (
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-medium">{booking.client_name}</p>
                          <p className="text-sm text-gray-600">{booking.service_name}</p>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(booking.booking_date).toLocaleDateString()} at {booking.booking_time}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(booking.status)}
                      {getPaymentBadge(booking.payment_status)}
                      <span className="font-medium">₦{booking.total_amount.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push("/egusi/bookings")}
          >
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Manage Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">View, edit, and manage all client bookings</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push("/egusi/calendar")}
          >
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Calendar View
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">See your schedule and availability</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push("/egusi/analytics")}
          >
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">View detailed business analytics</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
