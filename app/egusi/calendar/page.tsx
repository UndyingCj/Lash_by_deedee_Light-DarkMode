"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Plus, X, Clock } from "lucide-react"

interface BlockedDate {
  id: number
  blocked_date: string
  reason?: string
}

interface BlockedSlot {
  id: number
  blocked_date: string
  blocked_time: string
  reason?: string
}

const timeSlots = ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"]

export default function CalendarPage() {
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState("")

  // Load availability data
  const loadAvailability = async () => {
    try {
      const response = await fetch("/api/admin/availability")
      if (response.ok) {
        const data = await response.json()
        setBlockedDates(data.blockedDates || [])
        setBlockedSlots(data.blockedSlots || [])
      }
    } catch (error) {
      console.error("Error loading availability:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAvailability()
  }, [])

  // Block/unblock entire date
  const toggleDateBlock = async (date: string) => {
    try {
      const isBlocked = blockedDates.some((d) => d.blocked_date === date)

      const response = await fetch("/api/admin/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "date",
          date: date, // Send as pure DATE string: "2025-06-20"
          action: isBlocked ? "unblock" : "block",
          reason: isBlocked ? undefined : "Blocked by admin",
        }),
      })

      if (response.ok) {
        console.log(`✅ Date ${date} ${isBlocked ? "unblocked" : "blocked"} successfully`)
        await loadAvailability() // Reload to see changes
      } else {
        console.error("❌ Failed to toggle date block")
      }
    } catch (error) {
      console.error("Error toggling date block:", error)
    }
  }

  // Block/unblock specific time slot
  const toggleTimeSlot = async (date: string, time: string) => {
    try {
      const isBlocked = blockedSlots.some((s) => s.blocked_date === date && s.blocked_time === time)

      const response = await fetch("/api/admin/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "slot",
          date: date, // Send as pure DATE string: "2025-06-20"
          time: time,
          action: isBlocked ? "unblock" : "block",
          reason: isBlocked ? undefined : "Blocked by admin",
        }),
      })

      if (response.ok) {
        console.log(`✅ Time slot ${time} on ${date} ${isBlocked ? "unblocked" : "blocked"} successfully`)
        await loadAvailability() // Reload to see changes
      } else {
        console.error("❌ Failed to toggle time slot")
      }
    } catch (error) {
      console.error("Error toggling time slot:", error)
    }
  }

  // Generate next 30 days
  const getNext30Days = () => {
    const days = []
    const today = new Date()

    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)

      // CRITICAL: Format as pure DATE string to avoid timezone issues
      const dateString =
        date.getFullYear() +
        "-" +
        String(date.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(date.getDate()).padStart(2, "0")

      days.push({
        date: dateString,
        display: date.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
        isBlocked: blockedDates.some((d) => d.blocked_date === dateString),
      })
    }

    return days
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Calendar Management</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>Manage availability and blocked dates</span>
        </div>
      </div>

      {/* Debug Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800 text-sm">Debug Information</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-700">
          <p>Blocked dates: {blockedDates.length}</p>
          <p>Blocked slots: {blockedSlots.length}</p>
          <p>Sample blocked date: {blockedDates[0]?.blocked_date || "none"}</p>
        </CardContent>
      </Card>

      {/* Calendar Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Next 30 Days</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {getNext30Days().map((day) => (
              <div
                key={day.date}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  day.isBlocked
                    ? "bg-red-100 border-red-300 text-red-800"
                    : "bg-green-50 border-green-200 text-green-800 hover:bg-green-100"
                }`}
                onClick={() => toggleDateBlock(day.date)}
              >
                <div className="text-center">
                  <div className="font-medium">{day.display}</div>
                  <div className="text-xs mt-1">{day.isBlocked ? "Blocked" : "Available"}</div>
                  <div className="text-xs text-gray-500 mt-1">{day.date}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Time Slot Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Time Slot Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Date to Manage Time Slots:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2"
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            {selectedDate && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Time Slots for {selectedDate}:</h4>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((time) => {
                    const isBlocked = blockedSlots.some(
                      (s) => s.blocked_date === selectedDate && s.blocked_time === time,
                    )

                    return (
                      <Button
                        key={time}
                        variant={isBlocked ? "destructive" : "outline"}
                        size="sm"
                        onClick={() => toggleTimeSlot(selectedDate, time)}
                        className="justify-between"
                      >
                        <span>{time}</span>
                        {isBlocked ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      </Button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Currently Blocked Items */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Blocked Dates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {blockedDates.length === 0 ? (
                <p className="text-gray-500 text-sm">No blocked dates</p>
              ) : (
                blockedDates.map((date) => (
                  <div key={date.id} className="flex items-center justify-between p-2 bg-red-50 rounded">
                    <span className="font-medium">{date.blocked_date}</span>
                    <Button size="sm" variant="ghost" onClick={() => toggleDateBlock(date.blocked_date)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Blocked Time Slots</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {blockedSlots.length === 0 ? (
                <p className="text-gray-500 text-sm">No blocked time slots</p>
              ) : (
                blockedSlots.map((slot) => (
                  <div key={slot.id} className="flex items-center justify-between p-2 bg-red-50 rounded">
                    <span className="font-medium">
                      {slot.blocked_date} at {slot.blocked_time}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleTimeSlot(slot.blocked_date, slot.blocked_time)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
