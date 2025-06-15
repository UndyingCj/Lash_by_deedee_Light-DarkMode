"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Clock, Plus, Trash2, AlertCircle } from "lucide-react"
import { AdminLayout } from "@/components/admin/admin-layout"
import Calendar from "react-calendar"
import "react-calendar/dist/Calendar.css"

interface BlockedDate {
  id: number
  blocked_date: string
  reason?: string
}

interface BlockedTimeSlot {
  id: number
  blocked_date: string
  blocked_time: string
  reason?: string
}

const CalendarPage = () => {
  const [date, setDate] = useState(new Date())
  const [blockedDates, setBlockedDates] = useState<string[]>([])
  const [blockedTimeSlots, setBlockedTimeSlots] = useState<Record<string, string[]>>({})
  const [availableTimeSlots] = useState(["09:00 AM", "11:00 AM", "02:00 PM", "04:00 PM"])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBlockedData()
  }, [])

  const fetchBlockedData = async () => {
    try {
      setLoading(true)
      const [datesResponse, timesResponse] = await Promise.all([
        fetch("/api/admin/calendar?type=dates"),
        fetch("/api/admin/calendar?type=timeslots"),
      ])

      if (datesResponse.ok) {
        const datesData = await datesResponse.json()
        if (datesData.success) {
          setBlockedDates(datesData.data.map((item: BlockedDate) => item.blocked_date))
        }
      }

      if (timesResponse.ok) {
        const timesData = await timesResponse.json()
        if (timesData.success) {
          const timeSlots: { [key: string]: string[] } = {}
          timesData.data.forEach((item: BlockedTimeSlot) => {
            if (!timeSlots[item.blocked_date]) {
              timeSlots[item.blocked_date] = []
            }
            timeSlots[item.blocked_date].push(item.blocked_time)
          })
          setBlockedTimeSlots(timeSlots)
        }
      }
    } catch (error) {
      console.error("Error fetching blocked data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDateClick = async (date: string) => {
    const isBlocked = blockedDates.includes(date)

    try {
      if (isBlocked) {
        // Unblock date
        const response = await fetch(`/api/admin/calendar?type=date&date=${date}`, {
          method: "DELETE",
        })

        if (response.ok) {
          setBlockedDates((prev) => prev.filter((d) => d !== date))
        }
      } else {
        // Block date
        const reason = prompt("Reason for blocking this date (optional):")
        const response = await fetch("/api/admin/calendar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "date", date, reason }),
        })

        if (response.ok) {
          setBlockedDates((prev) => [...prev, date])
        }
      }
    } catch (error) {
      console.error("Error updating blocked date:", error)
    }
  }

  const handleTimeSlotClick = async (date: string, time: string) => {
    const isBlocked = blockedTimeSlots[date]?.includes(time)

    try {
      if (isBlocked) {
        // Unblock time slot
        const response = await fetch(`/api/admin/calendar?type=timeslot&date=${date}&time=${time}`, {
          method: "DELETE",
        })

        if (response.ok) {
          setBlockedTimeSlots((prev) => ({
            ...prev,
            [date]: prev[date]?.filter((t) => t !== time) || [],
          }))
        }
      } else {
        // Block time slot
        const reason = prompt("Reason for blocking this time slot (optional):")
        const response = await fetch("/api/admin/calendar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "timeslot", date, time, reason }),
        })

        if (response.ok) {
          setBlockedTimeSlots((prev) => ({
            ...prev,
            [date]: [...(prev[date] || []), time],
          }))
        }
      }
    } catch (error) {
      console.error("Error updating blocked time slot:", error)
    }
  }

  const tileClassName = ({ date }: any) => {
    const dateString = date.toISOString().split("T")[0]
    if (blockedDates.includes(dateString)) {
      return "blocked-date"
    }
    return null
  }

  const onChange = (date: any) => {
    setDate(date)
  }

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0]
  }

  const selectedDateString = formatDate(date)
  const selectedDateBlocked = blockedDates.includes(selectedDateString)

  if (loading) {
    return (
      <AdminLayout title="Availability Calendar" subtitle="Loading calendar data...">
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-pink-200 border-t-pink-500"></div>
          <span className="ml-3 text-slate-600 dark:text-slate-400">Loading calendar...</span>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Availability Calendar" subtitle="Manage your available dates and time slots">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Calendar Section */}
        <Card className="border-0 shadow-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CalendarIcon className="w-5 h-5 text-pink-500" />
              <span>Calendar View</span>
            </CardTitle>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Click on dates to block/unblock them. Red dates are blocked.
            </p>
          </CardHeader>
          <CardContent>
            <div className="calendar-container">
              <Calendar
                onChange={onChange}
                value={date}
                tileClassName={tileClassName}
                onClickDay={(value) => {
                  const dateString = formatDate(value)
                  handleDateClick(dateString)
                }}
                className="custom-calendar"
              />
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">Blocked Dates</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">Available Dates</span>
                </div>
              </div>
              <Badge variant="outline" className="text-slate-600 dark:text-slate-400">
                {blockedDates.length} blocked dates
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Time Slots Section */}
        <Card className="border-0 shadow-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-500" />
                <span>Time Slots</span>
              </div>
              <Badge variant="outline" className={selectedDateBlocked ? "border-red-500 text-red-600" : ""}>
                {date.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </Badge>
            </CardTitle>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Click on time slots to block/unblock them for the selected date.
            </p>
          </CardHeader>
          <CardContent>
            {selectedDateBlocked ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">Date Blocked</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  This entire date is blocked. Unblock the date first to manage individual time slots.
                </p>
                <Button
                  onClick={() => handleDateClick(selectedDateString)}
                  variant="outline"
                  className="border-red-500 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Unblock Date
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {availableTimeSlots.map((time) => {
                  const isBlocked = blockedTimeSlots[selectedDateString]?.includes(time)
                  return (
                    <Button
                      key={time}
                      onClick={() => handleTimeSlotClick(selectedDateString, time)}
                      variant={isBlocked ? "destructive" : "outline"}
                      className={`h-16 flex flex-col items-center justify-center transition-all ${
                        isBlocked
                          ? "bg-red-500 hover:bg-red-600 text-white"
                          : "border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                      }`}
                    >
                      <Clock className="w-5 h-5 mb-1" />
                      <span className="text-sm font-medium">{time}</span>
                      <span className="text-xs opacity-75">{isBlocked ? "Blocked" : "Available"}</span>
                    </Button>
                  )
                })}
              </div>
            )}

            <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Quick Actions</h4>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDateClick(selectedDateString)}
                  className={selectedDateBlocked ? "border-green-500 text-green-600" : "border-red-500 text-red-600"}
                >
                  {selectedDateBlocked ? (
                    <>
                      <Plus className="w-4 h-4 mr-1" />
                      Unblock Date
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-1" />
                      Block Entire Date
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <style jsx global>{`
        .custom-calendar {
          width: 100%;
          max-width: 100%;
          background-color: transparent;
          border: none;
          font-family: inherit;
        }
        
        .custom-calendar .react-calendar__navigation {
          display: flex;
          height: 44px;
          margin-bottom: 1em;
        }
        
        .custom-calendar .react-calendar__navigation button {
          min-width: 44px;
          background: none;
          padding: 0;
          border: none;
          outline: none;
          font-size: 16px;
          font-weight: 500;
          color: rgb(71 85 105);
        }
        
        .custom-calendar .react-calendar__navigation button:enabled:hover,
        .custom-calendar .react-calendar__navigation button:enabled:focus {
          background-color: rgb(248 250 252);
          border-radius: 6px;
        }
        
        .custom-calendar .react-calendar__navigation button:disabled {
          background-color: transparent;
          color: rgb(148 163 184);
        }
        
        .custom-calendar .react-calendar__navigation__label {
          font-weight: 600;
          font-size: 18px;
        }
        
        .custom-calendar .react-calendar__month-view__weekdays {
          text-align: center;
          font-weight: 600;
          font-size: 14px;
          color: rgb(100 116 139);
        }
        
        .custom-calendar .react-calendar__month-view__weekdays__weekday {
          padding: 0.75em 0.5em;
        }
        
        .custom-calendar .react-calendar__tile {
          max-width: 100%;
          padding: 0.75em 0.5em;
          background: none;
          border: none;
          outline: none;
          font-size: 14px;
          font-weight: 500;
          color: rgb(71 85 105);
          border-radius: 6px;
          transition: all 0.2s;
        }
        
        .custom-calendar .react-calendar__tile:enabled:hover,
        .custom-calendar .react-calendar__tile:enabled:focus {
          background-color: rgb(248 250 252);
          color: rgb(15 23 42);
        }
        
        .custom-calendar .react-calendar__tile--now {
          background: rgb(59 130 246);
          color: white;
          font-weight: 600;
        }
        
        .custom-calendar .react-calendar__tile--now:enabled:hover,
        .custom-calendar .react-calendar__tile--now:enabled:focus {
          background: rgb(37 99 235);
        }
        
        .custom-calendar .react-calendar__tile--active {
          background: rgb(236 72 153);
          color: white;
          font-weight: 600;
        }
        
        .custom-calendar .react-calendar__tile--active:enabled:hover,
        .custom-calendar .react-calendar__tile--active:enabled:focus {
          background: rgb(219 39 119);
        }
        
        .custom-calendar .blocked-date {
          background-color: rgb(239 68 68) !important;
          color: white !important;
          font-weight: 600;
        }
        
        .custom-calendar .blocked-date:enabled:hover,
        .custom-calendar .blocked-date:enabled:focus {
          background-color: rgb(220 38 38) !important;
        }
        
        .custom-calendar .react-calendar__month-view__days__day--weekend {
          color: rgb(239 68 68);
        }
        
        .custom-calendar .react-calendar__month-view__days__day--neighboringMonth {
          color: rgb(148 163 184);
        }
        
        .dark .custom-calendar .react-calendar__navigation button {
          color: rgb(203 213 225);
        }
        
        .dark .custom-calendar .react-calendar__navigation button:enabled:hover,
        .dark .custom-calendar .react-calendar__navigation button:enabled:focus {
          background-color: rgb(51 65 85);
        }
        
        .dark .custom-calendar .react-calendar__tile {
          color: rgb(203 213 225);
        }
        
        .dark .custom-calendar .react-calendar__tile:enabled:hover,
        .dark .custom-calendar .react-calendar__tile:enabled:focus {
          background-color: rgb(51 65 85);
          color: rgb(241 245 249);
        }
        
        .dark .custom-calendar .react-calendar__month-view__weekdays {
          color: rgb(148 163 184);
        }
      `}</style>
    </AdminLayout>
  )
}

export default CalendarPage
