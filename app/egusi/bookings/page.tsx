"use client"

import type React from "react"
import { useState, useEffect } from "react"

interface Booking {
  id: number
  name: string
  email: string
  phone: string
  date: string
  time: string
  service: string
  status: string
}

const BookingsPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("")

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
        await fetchBookings() // Refresh the list
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
        await fetchBookings() // Refresh the list
      } else {
        console.error("Failed to delete booking:", data.error)
      }
    } catch (error) {
      console.error("Error deleting booking:", error)
    }
  }

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value)
  }

  const handleDateFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateFilter(e.target.value)
  }

  return (
    <div>
      <h1>Bookings</h1>

      <div>
        <label htmlFor="statusFilter">Filter by Status:</label>
        <select id="statusFilter" value={statusFilter} onChange={handleStatusFilterChange}>
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div>
        <label htmlFor="dateFilter">Filter by Date:</label>
        <input type="date" id="dateFilter" value={dateFilter} onChange={handleDateFilterChange} />
      </div>

      {loading ? (
        <p>Loading bookings...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Date</th>
              <th>Time</th>
              <th>Service</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td>{booking.id}</td>
                <td>{booking.name}</td>
                <td>{booking.email}</td>
                <td>{booking.phone}</td>
                <td>{booking.date}</td>
                <td>{booking.time}</td>
                <td>{booking.service}</td>
                <td>{booking.status}</td>
                <td>
                  <select value={booking.status} onChange={(e) => handleStatusUpdate(booking.id, e.target.value)}>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <button onClick={() => handleDelete(booking.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default BookingsPage
