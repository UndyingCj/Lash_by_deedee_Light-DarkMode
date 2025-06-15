"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, Clock, DollarSign, Settings, LogOut } from "lucide-react"
import Link from "next/link"
import { AddBookingModal } from "@/components/admin/add-booking-modal"

interface DashboardStats {
  todayBookings: number
  weeklyBookings: number
  monthlyRevenue: number
  pendingBookings: number
}

interface Booking {
  id: number
  client_name: string
  service: string
  booking_date: string
  booking_time: string
  status: string
  amount: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    todayBookings: 0,
    weeklyBookings: 0,
    monthlyRevenue: 0,
    pendingBookings: 0,
  })
  const [recentBookings, setRecentBookings] = useState<Booking[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check authentication
    const isAuth = localStorage.getItem("adminAuth")
    if (!isAuth) {
      window.location.href = "/egusi"
      return
    }

    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/admin/stats")
      const result = await response.json()

      if (result.success) {
        setStats(result.data.stats)
        setRecentBookings(result.data.recentBookings)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("adminAuth")
    window.location.href = "/egusi"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Admin Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400">Lashed by Deedee Management</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={() => setIsAddModalOpen(true)} className="bg-pink-500 hover:bg-pink-600">
                <Calendar className="w-4 h-4 mr-2" />
                Add Booking
              </Button>
              <Link href="/egusi/settings">
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                  <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today's Bookings</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.todayBookings}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                  <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Weekly Bookings</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.weeklyBookings}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                  <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    ₦{stats.monthlyRevenue.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                  <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Bookings</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.pendingBookings}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/egusi/bookings">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-pink-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Manage Bookings</h3>
                <p className="text-gray-600 dark:text-gray-400">View, edit, and manage all appointments</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/egusi/calendar">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Clock className="w-12 h-12 mx-auto mb-4 text-pink-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Availability</h3>
                <p className="text-gray-600 dark:text-gray-400">Set available dates and block time slots</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/egusi/clients">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-pink-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Client Management</h3>
                <p className="text-gray-600 dark:text-gray-400">View client history and information</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">Recent Bookings</CardTitle>
              <Link href="/egusi/bookings">
                <Button size="sm" className="bg-pink-500 hover:bg-pink-600">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBookings.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">No recent bookings</p>
              ) : (
                recentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">{booking.client_name}</h4>
                      <p className="text-gray-600 dark:text-gray-400">{booking.service}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        {new Date(booking.booking_date).toLocaleDateString()} at {booking.booking_time}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                          ₦{booking.amount.toLocaleString()}
                        </p>
                        <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <AddBookingModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onBookingAdded={fetchDashboardData}
      />
    </>
  )
}
