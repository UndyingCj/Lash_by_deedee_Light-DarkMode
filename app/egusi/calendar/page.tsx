"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, X, Plus, ArrowLeft, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function CalendarManagement() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [blockedDates, setBlockedDates] = useState(["2024-06-20", "2024-06-25", "2024-06-30"])

  const [blockedTimeSlots, setBlockedTimeSlots] = useState([
    { date: "2024-06-15", time: "9:00 AM" },
    { date: "2024-06-16", time: "2:00 PM" },
  ])

  const timeSlots = ["9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM"]

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0]
  }

  const isDateBlocked = (date: Date) => {
    return blockedDates.includes(formatDate(date))
  }

  const isTimeSlotBlocked = (date: Date, time: string) => {
    return blockedTimeSlots.some((slot) => slot.date === formatDate(date) && slot.time === time)
  }

  const toggleDateBlock = (date: Date) => {
    const dateStr = formatDate(date)
    if (blockedDates.includes(dateStr)) {
      setBlockedDates(blockedDates.filter((d) => d !== dateStr))
    } else {
      setBlockedDates([...blockedDates, dateStr])
    }
  }

  const toggleTimeSlotBlock = (date: Date, time: string) => {
    const dateStr = formatDate(date)
    const existingIndex = blockedTimeSlots.findIndex((slot) => slot.date === dateStr && slot.time === time)

    if (existingIndex >= 0) {
      setBlockedTimeSlots(blockedTimeSlots.filter((_, index) => index !== existingIndex))
    } else {
      setBlockedTimeSlots([...blockedTimeSlots, { date: dateStr, time }])
    }
  }

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  const days = getDaysInMonth(currentDate)
  const monthYear = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })

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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Calendar & Availability</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage available dates and time slots</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    {monthYear}
                  </CardTitle>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {days.map((day, index) => (
                    <div key={index} className="aspect-square">
                      {day && (
                        <button
                          onClick={() => toggleDateBlock(day)}
                          className={`w-full h-full p-1 text-sm rounded-lg border transition-colors ${
                            isDateBlocked(day)
                              ? "bg-red-100 border-red-300 text-red-800 dark:bg-red-900/50 dark:border-red-700 dark:text-red-300"
                              : "bg-white border-gray-200 text-gray-900 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-700"
                          }`}
                        >
                          {day.getDate()}
                          {isDateBlocked(day) && <div className="text-xs mt-1">Blocked</div>}
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                  <p>• Click on a date to block/unblock the entire day</p>
                  <p>• Use the time slot manager to block specific hours</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Blocked Dates Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Blocked Dates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {blockedDates.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No blocked dates</p>
                  ) : (
                    blockedDates.map((date) => (
                      <div
                        key={date}
                        className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded"
                      >
                        <span className="text-sm">{new Date(date).toLocaleDateString()}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setBlockedDates(blockedDates.filter((d) => d !== date))}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Time Slot Management */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Block Time Slots</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Select Date & Time to Block
                    </label>
                    <div className="mt-2 space-y-2">
                      {timeSlots.map((time) => (
                        <div key={time} className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm">{time}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const today = new Date()
                              toggleTimeSlotBlock(today, time)
                            }}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Blocked Time Slots */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Blocked Time Slots</h4>
                    <div className="space-y-2">
                      {blockedTimeSlots.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400 text-sm">No blocked time slots</p>
                      ) : (
                        blockedTimeSlots.map((slot, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded"
                          >
                            <div className="text-sm">
                              <div>{new Date(slot.date).toLocaleDateString()}</div>
                              <div className="text-gray-500">{slot.time}</div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setBlockedTimeSlots(blockedTimeSlots.filter((_, i) => i !== index))}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="outline">
                  Block Next Weekend
                </Button>
                <Button className="w-full" variant="outline">
                  Block Holiday Period
                </Button>
                <Button className="w-full bg-pink-500 hover:bg-pink-600">Save Changes</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
