"use client"

import { useState, useEffect } from "react"
import Calendar from "react-calendar"
import "react-calendar/dist/Calendar.css"

const EgusiCalendarPage = () => {
  const [date, setDate] = useState(new Date())
  const [blockedDates, setBlockedDates] = useState<string[]>([])
  const [blockedTimeSlots, setBlockedTimeSlots] = useState<Record<string, string[]>>({})
  const [availableTimeSlots, setAvailableTimeSlots] = useState([
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
  ])

  useEffect(() => {
    fetchBlockedData()
  }, [])

  const fetchBlockedData = async () => {
    try {
      const [datesResponse, timesResponse] = await Promise.all([
        fetch("/api/admin/calendar?type=dates"),
        fetch("/api/admin/calendar?type=timeslots"),
      ])

      if (datesResponse.ok) {
        const datesData = await datesResponse.json()
        if (datesData.success) {
          setBlockedDates(datesData.data.map((item: any) => item.blocked_date))
        }
      }

      if (timesResponse.ok) {
        const timesData = await timesResponse.json()
        if (timesData.success) {
          const timeSlots: { [key: string]: string[] } = {}
          timesData.data.forEach((item: any) => {
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
      return "blocked"
    }
    return null
  }

  const onChange = (date: any) => {
    setDate(date)
  }

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0]
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Egusi Calendar</h1>
      <div className="flex">
        <Calendar
          onChange={onChange}
          value={date}
          tileClassName={tileClassName}
          onClickDay={(value, event) => {
            const dateString = formatDate(value)
            handleDateClick(dateString)
          }}
        />
        <div className="ml-4">
          <h2 className="text-lg font-semibold mb-2">Available Time Slots</h2>
          {availableTimeSlots.map((time) => {
            const dateString = formatDate(date)
            const isBlocked = blockedTimeSlots[dateString]?.includes(time)
            return (
              <div
                key={time}
                className={`p-2 rounded cursor-pointer ${isBlocked ? "bg-red-500 text-white" : "bg-green-200"} mb-1`}
                onClick={() => handleTimeSlotClick(dateString, time)}
              >
                {time} - {isBlocked ? "Blocked" : "Available"}
              </div>
            )
          })}
        </div>
      </div>
      <style jsx>{`
        .react-calendar {
          width: 400px;
          max-width: 100%;
          background-color: #fff;
          color: #222;
          border-radius: 8px;
          font-family: Arial, sans-serif;
          line-height: 1.125em;
        }
        .react-calendar__navigation {
          display: flex;
          height: 44px;
          margin-bottom: 1em;
        }
        .react-calendar__navigation button {
          min-width: 44px;
          background: none;
          padding: 0;
          border: none;
          outline: none;
        }
        .react-calendar__navigation button:disabled {
          background-color: #f0f0f0;
          cursor: default;
        }
        .react-calendar__navigation button:hover {
          background-color: #e6e6e6;
        }
        .react-calendar__navigation__label {
          font-weight: bold;
        }
        .react-calendar__month-view__weekdays {
          text-align: center;
          font-weight: bold;
          font-size: 0.75em;
        }
        .react-calendar__month-view__weekdays__weekday {
          padding: 0.5em;
        }
        .react-calendar__month-view__days__day {
          padding: 0.5em;
          border-radius: 4px;
          background: none;
          border: none;
          outline: none;
        }
        .react-calendar__month-view__days__day--weekend {
          color: #d10000;
        }
        .react-calendar__month-view__days__day--neighboringMonth {
          color: #757575;
        }
        .react-calendar__month-view__days__day--today {
          font-weight: bold;
        }
        .react-calendar__month-view__days__day:hover {
          background-color: #e6e6e6;
        }
        .react-calendar__tile--active {
          background: #006aff;
          color: white;
        }
        .react-calendar__tile--active:hover {
          background: #1e7fff;
        }
        .blocked {
          background-color: red;
          color: white;
        }
      `}</style>
    </div>
  )
}

export default EgusiCalendarPage
