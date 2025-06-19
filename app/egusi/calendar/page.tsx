"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  RefreshCw,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
} from "lucide-react"

interface BlockedDate {
  id: number
  blocked_date: string
  reason?: string
  created_at?: string
}

interface BlockedSlot {
  id: number
  blocked_date: string
  blocked_time: string
  reason?: string
  created_at?: string
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

const TIME_SLOTS = [
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
]

export default function CalendarPage() {
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [showTimeSlots, setShowTimeSlots] = useState(false)

  // Load availability data
  const loadAvailability = async () => {
    try {
      setRefreshing(true)
      const response = await fetch("/api/admin/availability")
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          setBlockedDates(result.data.blockedDates || [])
          setBlockedSlots(result.data.blockedSlots || [])
        }
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
          type: isBlocked ? "unblock_date" : "block_date",
          date: date,
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

  // Block/unblock time slot
  const toggleTimeSlot = async (date: string, time: string) => {
    try {
      const isBlocked = blockedSlots.some((s) => s.blocked_date === date && s.blocked_time === time)

      const response = await fetch("/api/admin/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: isBlocked ? "unblock_slot" : "block_slot",
          date: date,
          time: time,
          reason: isBlocked ? undefined : "Blocked by admin",
        }),
      })

      if (response.ok) {
        await loadAvailability()
      }
    } catch (error) {
      console.error("Error toggling time slot:", error)
    }
  }

  // Generate calendar days for current month
  const getCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const firstDay = new Date(year, month, 1)
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
      const blockedSlotsCount = blockedSlots.filter((s) => s.blocked_date === dateString).length
      const isToday = dateString === new Date().toISOString().split("T")[0]

      days.push({
        date: new Date(currentDateObj),
        dateString,
        day: currentDateObj.getDate(),
        isCurrentMonth,
        isBlocked,
        blockedSlotsCount,
        isToday,
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

  const handleDateClick = (dateString: string, isCurrentMonth: boolean, isPast: boolean) => {
    if (!isCurrentMonth || isPast) return

    if (selectedDate === dateString) {
      setSelectedDate("")
      setShowTimeSlots(false)
    } else {
      setSelectedDate(dateString)
      setShowTimeSlots(true)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="text-slate-400">Loading calendar...</p>
        </div>
      </div>
    )
  }

  const calendarDays = getCalendarDays()
  const selectedDateSlots = selectedDate ? blockedSlots.filter((s) => s.blocked_date === selectedDate) : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="p-6 space-y-8">
        {/* Professional Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  Availability Calendar
                </h1>
                <p className="text-slate-400">Manage your schedule and blocked dates</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Badge variant="outline" className="text-slate-300 border-slate-600">
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </Badge>
            <Button
              onClick={loadAvailability}
              disabled={refreshing}
              className="bg-slate-800 hover:bg-slate-700 text-white border-slate-600 shadow-lg"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-red-500 to-red-600 border-red-400 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium uppercase tracking-wide">Blocked Dates</p>
                  <p className="text-4xl font-bold text-white mt-2">{blockedDates.length}</p>
                  <p className="text-red-200 text-xs mt-1">Full day blocks</p>
                </div>
                <div className="p-3 bg-red-400/20 rounded-xl">
                  <XCircle className="w-8 h-8 text-red-100" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 border-orange-400 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium uppercase tracking-wide">Blocked Slots</p>
                  <p className="text-4xl font-bold text-white mt-2">{blockedSlots.length}</p>
                  <p className="text-orange-200 text-xs mt-1">Individual time slots</p>
                </div>
                <div className="p-3 bg-orange-400/20 rounded-xl">
                  <Clock className="w-8 h-8 text-orange-100" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 border-emerald-400 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium uppercase tracking-wide">Available Days</p>
                  <p className="text-4xl font-bold text-white mt-2">
                    {calendarDays.filter((d) => d.isCurrentMonth && !d.isPast && !d.isBlocked).length}
                  </p>
                  <p className="text-emerald-200 text-xs mt-1">This month</p>
                </div>
                <div className="p-3 bg-emerald-400/20 rounded-xl">
                  <CheckCircle className="w-8 h-8 text-emerald-100" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Professional Calendar */}
        <Card className="bg-slate-800/50 border-slate-700 shadow-2xl backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="space-y-8">
              {/* Calendar Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-pink-500/20 rounded-lg">
                    <Calendar className="w-5 h-5 text-pink-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Calendar View</h2>
                    <p className="text-slate-400 text-sm">Click dates to manage availability</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-slate-300 border-slate-600">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Interactive Mode
                  </Badge>
                </div>
              </div>

              {/* Month Navigation */}
              <div className="flex items-center justify-between bg-slate-900/50 rounded-xl p-4">
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

                <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
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
                    <div key={day} className="text-center py-3 bg-slate-900/30 rounded-lg">
                      <span className="text-sm font-semibold text-slate-300 uppercase tracking-wider">{day}</span>
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((day, index) => (
                    <button
                      key={index}
                      onClick={() => handleDateClick(day.dateString, day.isCurrentMonth, day.isPast)}
                      disabled={!day.isCurrentMonth || day.isPast}
                      className={`
                        relative aspect-square p-3 rounded-xl text-sm font-medium transition-all duration-300 group
                        ${
                          !day.isCurrentMonth
                            ? "text-slate-600 cursor-not-allowed opacity-30"
                            : day.isPast
                              ? "text-slate-500 cursor-not-allowed opacity-50"
                              : day.isToday
                                ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg ring-2 ring-blue-400/50"
                                : day.isBlocked
                                  ? "bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg hover:shadow-xl"
                                  : selectedDate === day.dateString
                                    ? "bg-gradient-to-br from-pink-500 to-pink-600 text-white shadow-lg ring-2 ring-pink-400/50"
                                    : "bg-slate-700/50 text-slate-300 hover:bg-slate-600 hover:text-white hover:shadow-lg"
                        }
                      `}
                    >
                      <div className="flex flex-col items-center justify-center h-full">
                        <span className="text-lg font-bold">{day.day}</span>
                        {day.blockedSlotsCount > 0 && !day.isBlocked && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-white">{day.blockedSlotsCount}</span>
                          </div>
                        )}
                        {day.isToday && <span className="text-xs opacity-75 mt-1">Today</span>}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Enhanced Legend */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-700">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow"></div>
                    <span className="text-sm text-slate-300 font-medium">Blocked Dates</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full shadow"></div>
                    <span className="text-sm text-slate-300 font-medium">Available</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow"></div>
                    <span className="text-sm text-slate-300 font-medium">Today</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-orange-500 rounded-full shadow flex items-center justify-center">
                      <span className="text-xs text-white font-bold">N</span>
                    </div>
                    <span className="text-sm text-slate-300 font-medium">Partial Blocks</span>
                  </div>
                </div>
                <div className="text-sm text-slate-400 bg-slate-900/50 px-3 py-1 rounded-lg">
                  {blockedDates.length} blocked dates • {blockedSlots.length} blocked slots
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Time Slot Management Panel */}
        {showTimeSlots && selectedDate && (
          <Card className="bg-slate-800/50 border-slate-700 shadow-2xl backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-pink-500/20 rounded-lg">
                      <Clock className="w-5 h-5 text-pink-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">Time Slot Management</h3>
                      <p className="text-slate-400">
                        Managing slots for{" "}
                        {new Date(selectedDate).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => toggleDateBlock(selectedDate)}
                    className={`${
                      blockedDates.some((d) => d.blocked_date === selectedDate)
                        ? "bg-emerald-600 hover:bg-emerald-700"
                        : "bg-red-600 hover:bg-red-700"
                    } text-white shadow-lg`}
                  >
                    {blockedDates.some((d) => d.blocked_date === selectedDate) ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Unblock Entire Day
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 mr-2" />
                        Block Entire Day
                      </>
                    )}
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {TIME_SLOTS.map((time) => {
                    const isBlocked = selectedDateSlots.some((s) => s.blocked_time === time)
                    return (
                      <Button
                        key={time}
                        onClick={() => toggleTimeSlot(selectedDate, time)}
                        variant={isBlocked ? "destructive" : "outline"}
                        className={`h-12 ${
                          isBlocked
                            ? "bg-red-500 hover:bg-red-600 text-white border-red-400"
                            : "bg-slate-700 hover:bg-slate-600 text-slate-300 border-slate-600"
                        } transition-all duration-200`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium">{time}</span>
                          {isBlocked ? <XCircle className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        </div>
                      </Button>
                    )
                  })}
                </div>

                {selectedDateSlots.length > 0 && (
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-slate-300 mb-3">Currently Blocked Slots:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedDateSlots.map((slot) => (
                        <Badge
                          key={slot.id}
                          variant="destructive"
                          className="bg-red-500/20 text-red-300 border-red-500/30"
                        >
                          {slot.blocked_time}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
