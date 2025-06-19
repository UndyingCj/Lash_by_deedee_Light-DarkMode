"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, Calendar, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

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

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]

export default function CalendarPage() {
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())

  // Load availability data
  const loadAvailability = async () => {
    try {
      setRefreshing(true)
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
      setRefreshing(false)
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
          date: date,
          action: isBlocked ? "unblock" : "block",
          reason: isBlocked ? undefined : "Blocked by admin",
        }),
      })

      if (response.ok) {
        await loadAvailability()
      }
    } catch (error) {
      console.error("Error toggling date block:", error)
    }
  }

  // Generate calendar days for current month
  const getCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)

    // Adjust to start on Monday
    const dayOfWeek = (firstDay.getDay() + 6) % 7
    startDate.setDate(firstDay.getDate() - dayOfWeek)

    const days = []
    const currentDateObj = new Date(startDate)

    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      const dateString = currentDateObj.toISOString().split("T")[0]
      const isCurrentMonth = currentDateObj.getMonth() === month
      const isBlocked = blockedDates.some((d) => d.blocked_date === dateString)

      days.push({
        date: new Date(currentDateObj),
        dateString,
        day: currentDateObj.getDate(),
        isCurrentMonth,
        isBlocked,
        isPast: currentDateObj < new Date(new Date().setHours(0, 0, 0, 0)),
      })

      currentDateObj.setDate(currentDateObj.getDate() + 1)
    }

    return days
  }

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const goToPreviousYear = () => {
    setCurrentDate(new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1))
  }

  const goToNextYear = () => {
    setCurrentDate(new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), 1))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  const calendarDays = getCalendarDays()

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Availability Calendar</h1>
            <p className="text-slate-400 mt-1">Manage your available dates and time slots</p>
          </div>
          <Button
            onClick={loadAvailability}
            disabled={refreshing}
            className="bg-slate-800 hover:bg-slate-700 text-white border-slate-700"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh Data
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-red-500 border-red-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">Blocked Dates</p>
                  <p className="text-4xl font-bold mt-2">{blockedDates.length}</p>
                </div>
                <Calendar className="w-8 h-8 text-red-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-orange-500 border-orange-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Blocked Time Slots</p>
                  <p className="text-4xl font-bold mt-2">{blockedSlots.length}</p>
                </div>
                <Calendar className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calendar Section */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-pink-500" />
                  <h2 className="text-xl font-semibold text-white">Calendar View</h2>
                </div>
                <p className="text-slate-400 text-sm">Click on dates to block/unblock them. Red dates are blocked.</p>
              </div>

              {/* Month Navigation */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={goToPreviousYear}
                    className="text-slate-400 hover:text-white hover:bg-slate-700"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={goToPreviousMonth}
                    className="text-slate-400 hover:text-white hover:bg-slate-700"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                </div>

                <h3 className="text-xl font-semibold text-white">
                  {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h3>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={goToNextMonth}
                    className="text-slate-400 hover:text-white hover:bg-slate-700"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={goToNextYear}
                    className="text-slate-400 hover:text-white hover:bg-slate-700"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="space-y-4">
                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-2">
                  {DAYS.map((day) => (
                    <div key={day} className="text-center py-2">
                      <span className="text-sm font-medium text-slate-400">{day}</span>
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((day, index) => (
                    <button
                      key={index}
                      onClick={() => day.isCurrentMonth && !day.isPast && toggleDateBlock(day.dateString)}
                      disabled={!day.isCurrentMonth || day.isPast}
                      className={`
                        aspect-square p-2 rounded-lg text-sm font-medium transition-all duration-200
                        ${
                          !day.isCurrentMonth
                            ? "text-slate-600 cursor-not-allowed"
                            : day.isPast
                              ? "text-slate-500 cursor-not-allowed"
                              : day.isBlocked
                                ? "bg-red-500 text-white hover:bg-red-600"
                                : "text-slate-300 hover:bg-slate-700 hover:text-white"
                        }
                      `}
                    >
                      {day.day}
                    </button>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span className="text-sm text-slate-400">Blocked Dates</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-sm text-slate-400">Available Dates</span>
                  </div>
                </div>
                <span className="text-sm text-slate-400">{blockedDates.length} blocked dates</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
