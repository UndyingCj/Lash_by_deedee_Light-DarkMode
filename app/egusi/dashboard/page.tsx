"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Calendar,
  Users,
  Clock,
  DollarSign,
  LogOut,
  Plus,
  TrendingUp,
  Eye,
  MoreHorizontal,
  Bell,
  Search,
  Filter,
  Download,
  RefreshCw,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react"
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

const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats>({
    todayBookings: 0,
    weeklyBookings: 0,
    monthlyRevenue: 0,
    pendingBookings: 0,
  })
  const [recentBookings, setRecentBookings] = useState<Booking[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isRefreshing, setIsRefreshing] = useState(false)

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
      setIsRefreshing(true)
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
      setIsRefreshing(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("adminAuth")
    window.location.href = "/egusi"
  }

  const handleExportData = () => {
    // Create CSV data
    const csvData = [
      ["Client Name", "Service", "Date", "Time", "Status", "Amount"],
      ...recentBookings.map((booking) => [
        booking.client_name,
        booking.service,
        booking.booking_date,
        booking.booking_time,
        booking.status,
        booking.amount.toString(),
      ]),
    ]

    const csvContent = csvData.map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `bookings-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleStatusUpdate = async (bookingId: number, newStatus: string) => {
    try {
      const response = await fetch("/api/admin/bookings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: bookingId, status: newStatus }),
      })

      const data = await response.json()
      if (data.success) {
        await fetchDashboardData()
      } else {
        alert("Failed to update booking status")
      }
    } catch (error) {
      console.error("Error updating booking:", error)
      alert("Error updating booking status")
    }
  }

  const handleDeleteBooking = async (bookingId: number) => {
    if (!confirm("Are you sure you want to delete this booking?")) return

    try {
      const response = await fetch(`/api/admin/bookings?id=${bookingId}`, {
        method: "DELETE",
      })

      const data = await response.json()
      if (data.success) {
        await fetchDashboardData()
      } else {
        alert("Failed to delete booking")
      }
    } catch (error) {
      console.error("Error deleting booking:", error)
      alert("Error deleting booking")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800"
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800"
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800"
      case "completed":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800"
    }
  }

  const filteredBookings = recentBookings.filter((booking) => {
    const matchesSearch =
      booking.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.service.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-200 border-t-pink-500 mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-pink-300 animate-ping mx-auto"></div>
          </div>
          <p className="mt-6 text-slate-600 dark:text-slate-400 font-medium">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Fixed Header - No overlapping */}
      <header className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-700/50 fixed top-0 left-0 right-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">L</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800"></div>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                    Admin Dashboard
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Lashed by Deedee Management</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Search */}
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search bookings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>

              {/* Notifications */}
              <Button variant="outline" size="sm" className="relative">
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>

              {/* Add Booking */}
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">New Booking</span>
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/images/deedee-portrait.png" />
                      <AvatarFallback className="bg-pink-100 text-pink-600">DD</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer to prevent content overlap */}
      <div className="h-16"></div>

      {/* Main Content - Proper spacing to avoid overlap */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Good morning, Deedee! 👋</h2>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Here's what's happening with your business today.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleExportData}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={fetchDashboardData} disabled={isRefreshing}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards - Responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">Today's Bookings</p>
                  <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.todayBookings}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
                    <span className="text-sm text-emerald-600 dark:text-emerald-400">+12% from yesterday</span>
                  </div>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-2xl">
                  <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-1">Weekly Bookings</p>
                  <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">{stats.weeklyBookings}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
                    <span className="text-sm text-emerald-600 dark:text-emerald-400">+8% from last week</span>
                  </div>
                </div>
                <div className="p-3 bg-emerald-500/10 rounded-2xl">
                  <Users className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">Monthly Revenue</p>
                  <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                    ₦{stats.monthlyRevenue.toLocaleString()}
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
                    <span className="text-sm text-emerald-600 dark:text-emerald-400">+15% from last month</span>
                  </div>
                </div>
                <div className="p-3 bg-purple-500/10 rounded-2xl">
                  <DollarSign className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-1">Pending Bookings</p>
                  <p className="text-3xl font-bold text-amber-900 dark:text-amber-100">{stats.pendingBookings}</p>
                  <div className="flex items-center mt-2">
                    <Clock className="w-4 h-4 text-amber-500 mr-1" />
                    <span className="text-sm text-amber-600 dark:text-amber-400">Needs attention</span>
                  </div>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-2xl">
                  <Clock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions - Responsive grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
            <Link href="/egusi/bookings">
              <CardContent className="p-8 text-center">
                <div className="relative mb-6">
                  <div className="p-4 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl w-16 h-16 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Calendar className="w-8 h-8 text-white mx-auto" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">Manage Bookings</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  View, edit, and manage all appointments with advanced filtering and search
                </p>
                <div className="mt-4 flex items-center justify-center text-pink-600 dark:text-pink-400 group-hover:text-pink-700 dark:group-hover:text-pink-300">
                  <span className="text-sm font-medium">Manage now</span>
                  <Eye className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
            <Link href="/egusi/calendar">
              <CardContent className="p-8 text-center">
                <div className="relative mb-6">
                  <div className="p-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl w-16 h-16 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Clock className="w-8 h-8 text-white mx-auto" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">Availability</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Set available dates and block time slots with intelligent scheduling
                </p>
                <div className="mt-4 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                  <span className="text-sm font-medium">Configure</span>
                  <Eye className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
            <Link href="/egusi/clients">
              <CardContent className="p-8 text-center">
                <div className="relative mb-6">
                  <div className="p-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl w-16 h-16 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Users className="w-8 h-8 text-white mx-auto" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">Client Management</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  View client history, preferences, and detailed information
                </p>
                <div className="mt-4 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-300">
                  <span className="text-sm font-medium">View clients</span>
                  <Eye className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Recent Bookings */}
        <Card className="border-0 shadow-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
          <CardHeader className="border-b border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">Recent Bookings</CardTitle>
                <p className="text-slate-600 dark:text-slate-400 mt-1">Latest appointments and their status</p>
              </div>
              <div className="flex items-center space-x-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setStatusFilter("all")}>All Status</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("pending")}>Pending</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("confirmed")}>Confirmed</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("completed")}>Completed</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("cancelled")}>Cancelled</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
                  asChild
                >
                  <Link href="/egusi/bookings">View All</Link>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-200/50 dark:divide-slate-700/50">
              {filteredBookings.length === 0 ? (
                <div className="text-center py-16">
                  <div className="relative mb-6">
                    <Calendar className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">No bookings found</h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-6">
                    {searchQuery || statusFilter !== "all"
                      ? "Try adjusting your search or filter criteria"
                      : "New bookings will appear here when they're created"}
                  </p>
                  <Button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Booking
                  </Button>
                </div>
              ) : (
                filteredBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors group gap-4"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold">
                          {booking.client_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                          {booking.client_name}
                        </h4>
                        <p className="text-slate-600 dark:text-slate-400 font-medium">{booking.service}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-500 flex items-center mt-1">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(booking.booking_date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          at {booking.booking_time}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end space-x-4">
                      <div className="text-left sm:text-right">
                        <p className="font-bold text-slate-900 dark:text-slate-100 text-lg">
                          ₦{booking.amount.toLocaleString()}
                        </p>
                        <Badge className={`${getStatusColor(booking.status)} border font-medium`}>
                          {booking.status}
                        </Badge>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleStatusUpdate(booking.id, "confirmed")}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Confirm
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusUpdate(booking.id, "completed")}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark Complete
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusUpdate(booking.id, "cancelled")}>
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancel
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteBooking(booking.id)} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Add Booking Modal */}
      <AddBookingModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onBookingAdded={fetchDashboardData}
      />
    </div>
  )
}

export default DashboardPage
