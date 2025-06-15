"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Calendar,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Trash2,
  Download,
  RefreshCw,
} from "lucide-react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { AddBookingModal } from "@/components/admin/add-booking-modal"

interface Booking {
  id: number
  client_name: string
  phone: string
  email: string
  service: string
  booking_date: string
  booking_time: string
  status: string
  amount: number
  notes?: string
}

const BookingsPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.append("status", statusFilter)
      if (dateFilter) params.append("date", dateFilter)

      const response = await fetch(`/api/admin/bookings?${params}`)
      const data = await response.json()

      if (data.success) {
        setBookings(data.data)
      } else {
        console.error("Failed to fetch bookings:", data.error)
      }
    } catch (error) {
      console.error("Error fetching bookings:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [statusFilter, dateFilter])

  const handleStatusUpdate = async (bookingId: number, newStatus: string) => {
    try {
      const response = await fetch("/api/admin/bookings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: bookingId, status: newStatus }),
      })

      const data = await response.json()
      if (data.success) {
        await fetchBookings()
      } else {
        console.error("Failed to update booking:", data.error)
      }
    } catch (error) {
      console.error("Error updating booking:", error)
    }
  }

  const handleDelete = async (bookingId: number) => {
    if (!confirm("Are you sure you want to delete this booking?")) return

    try {
      const response = await fetch(`/api/admin/bookings?id=${bookingId}`, {
        method: "DELETE",
      })

      const data = await response.json()
      if (data.success) {
        await fetchBookings()
      } else {
        console.error("Failed to delete booking:", data.error)
      }
    } catch (error) {
      console.error("Error deleting booking:", error)
    }
  }

  const handleExportData = () => {
    const csvData = [
      ["ID", "Client Name", "Phone", "Email", "Service", "Date", "Time", "Status", "Amount", "Notes"],
      ...bookings
        .filter((booking) => {
          const matchesSearch =
            booking.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.phone.includes(searchQuery) ||
            booking.email.toLowerCase().includes(searchQuery.toLowerCase())
          return matchesSearch
        })
        .map((booking) => [
          booking.id.toString(),
          booking.client_name,
          booking.phone,
          booking.email,
          booking.service,
          booking.booking_date,
          booking.booking_time,
          booking.status,
          booking.amount.toString(),
          booking.notes || "",
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

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.phone.includes(searchQuery) ||
      booking.email.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  return (
    <AdminLayout title="Bookings Management" subtitle="View and manage all client appointments">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search bookings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Status: {statusFilter === "all" ? "All" : statusFilter}
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
          <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="w-40" />
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleExportData}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={fetchBookings}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Booking
          </Button>
        </div>
      </div>

      {/* Bookings List */}
      <Card className="border-0 shadow-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
            All Bookings ({filteredBookings.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-pink-200 border-t-pink-500"></div>
              <span className="ml-3 text-slate-600 dark:text-slate-400">Loading bookings...</span>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-16">
              <Calendar className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">No bookings found</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                {searchQuery || statusFilter !== "all" || dateFilter
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
            <div className="divide-y divide-slate-200/50 dark:divide-slate-700/50">
              {filteredBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex flex-col lg:flex-row lg:items-center justify-between p-6 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors group gap-4"
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
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                        {booking.client_name}
                      </h4>
                      <p className="text-slate-600 dark:text-slate-400 font-medium">{booking.service}</p>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-sm text-slate-500 dark:text-slate-500 mt-1">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(booking.booking_date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          at {booking.booking_time}
                        </span>
                        <span className="hidden sm:block">•</span>
                        <span>{booking.phone}</span>
                        <span className="hidden sm:block">•</span>
                        <span className="truncate">{booking.email}</span>
                      </div>
                      {booking.notes && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 italic">"{booking.notes}"</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between lg:justify-end space-x-4">
                    <div className="text-left lg:text-right">
                      <p className="font-bold text-slate-900 dark:text-slate-100 text-lg">
                        ₦{booking.amount.toLocaleString()}
                      </p>
                      <Badge className={`${getStatusColor(booking.status)} border font-medium`}>{booking.status}</Badge>
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
                        <DropdownMenuItem onClick={() => handleDelete(booking.id)} className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Booking Modal */}
      <AddBookingModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onBookingAdded={fetchBookings}
      />
    </AdminLayout>
  )
}

export default BookingsPage
