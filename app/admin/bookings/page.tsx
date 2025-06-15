"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Search, Edit, Trash2, Phone, Mail, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function BookingsManagement() {
  const [bookings, setBookings] = useState([
    {
      id: 1,
      clientName: "Sarah Johnson",
      phone: "+234 801 234 5678",
      email: "sarah@email.com",
      service: "Ombré Brows",
      date: "2024-06-15",
      time: "10:00 AM",
      status: "confirmed",
      amount: 45000,
      notes: "First time client",
    },
    {
      id: 2,
      clientName: "Grace Okafor",
      phone: "+234 802 345 6789",
      email: "grace@email.com",
      service: "Volume Lashes",
      date: "2024-06-15",
      time: "2:00 PM",
      status: "pending",
      amount: 25000,
      notes: "Prefers natural look",
    },
    {
      id: 3,
      clientName: "Jennifer Eze",
      phone: "+234 803 456 7890",
      email: "jennifer@email.com",
      service: "Classic Lashes",
      date: "2024-06-16",
      time: "11:00 AM",
      status: "confirmed",
      amount: 15000,
      notes: "",
    },
    {
      id: 4,
      clientName: "Blessing Okoro",
      phone: "+234 804 567 8901",
      email: "blessing@email.com",
      service: "Microblading",
      date: "2024-06-17",
      time: "9:00 AM",
      status: "cancelled",
      amount: 40000,
      notes: "Cancelled due to illness",
    },
  ])

  const [filteredBookings, setFilteredBookings] = useState(bookings)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedBooking, setSelectedBooking] = useState<any>(null)

  useEffect(() => {
    let filtered = bookings

    if (searchTerm) {
      filtered = filtered.filter(
        (booking) =>
          booking.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.phone.includes(searchTerm),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((booking) => booking.status === statusFilter)
    }

    setFilteredBookings(filtered)
  }, [searchTerm, statusFilter, bookings])

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

  const handleStatusChange = (bookingId: number, newStatus: string) => {
    setBookings(bookings.map((booking) => (booking.id === bookingId ? { ...booking, status: newStatus } : booking)))
  }

  const handleDeleteBooking = (bookingId: number) => {
    if (confirm("Are you sure you want to delete this booking?")) {
      setBookings(bookings.filter((booking) => booking.id !== bookingId))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/admin/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Bookings Management</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage all client appointments</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by name, service, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bookings List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>All Bookings ({filteredBookings.length})</span>
              <Button className="bg-pink-500 hover:bg-pink-600">
                <Calendar className="w-4 h-4 mr-2" />
                Add New Booking
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{booking.clientName}</h3>
                        <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Service</p>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{booking.service}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Date & Time</p>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {booking.date} at {booking.time}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Amount</p>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            ₦{booking.amount.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Contact</p>
                          <div className="flex items-center gap-2">
                            <a href={`tel:${booking.phone}`} className="text-pink-500 hover:text-pink-600">
                              <Phone className="w-4 h-4" />
                            </a>
                            <a href={`mailto:${booking.email}`} className="text-pink-500 hover:text-pink-600">
                              <Mail className="w-4 h-4" />
                            </a>
                          </div>
                        </div>
                      </div>

                      {booking.notes && (
                        <div className="mt-3">
                          <p className="text-gray-500 dark:text-gray-400 text-sm">Notes</p>
                          <p className="text-gray-700 dark:text-gray-300 text-sm">{booking.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <Select value={booking.status} onValueChange={(value) => handleStatusChange(booking.id, value)}>
                        <SelectTrigger className="w-full lg:w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteBooking(booking.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
