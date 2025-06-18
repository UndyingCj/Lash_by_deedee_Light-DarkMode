"use client"

import type React from "react"
import { useState } from "react"
import { utcToZonedTime, format } from "date-fns-tz"

const TIMEZONE = "Africa/Lagos"

const BookPage = () => {
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")

  const blockedDates = ["2024-03-10", "2024-03-15", "2024-03-20"]
  const blockedTimeSlots = {
    "2024-03-12": ["10:00", "11:00"],
    "2024-03-18": ["14:00", "15:00"],
  }

  const normalizeDateString = (dateString: string): string => {
    try {
      if (!dateString) return ""

      // If it's already in YYYY-MM-DD format, convert to Lagos timezone
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        const zonedDate = utcToZonedTime(new Date(dateString + "T12:00:00Z"), TIMEZONE)
        return format(zonedDate, "yyyy-MM-dd", { timeZone: TIMEZONE })
      }

      // Handle ISO strings
      if (dateString.includes("T")) {
        const zonedDate = utcToZonedTime(new Date(dateString), TIMEZONE)
        return format(zonedDate, "yyyy-MM-dd", { timeZone: TIMEZONE })
      }

      // For any other format, normalize to Lagos timezone
      const zonedDate = utcToZonedTime(new Date(dateString), TIMEZONE)
      return format(zonedDate, "yyyy-MM-dd", { timeZone: TIMEZONE })
    } catch (error) {
      console.error("Error normalizing date to Lagos timezone:", dateString, error)
      return dateString
    }
  }

  const isDateBlocked = (date: string): boolean => {
    try {
      if (!date) return false

      // Normalize both the input date and blocked dates to Lagos timezone
      const normalizedInputDate = normalizeDateString(date)

      const blocked =
        Array.isArray(blockedDates) &&
        blockedDates.some((blockedDate) => {
          const normalizedBlockedDate = normalizeDateString(blockedDate)
          const isBlocked = normalizedBlockedDate === normalizedInputDate

          if (isBlocked) {
            console.log("🚫 Date blocked in Lagos timezone:", {
              input: date,
              normalizedInput: normalizedInputDate,
              blocked: blockedDate,
              normalizedBlocked: normalizedBlockedDate,
            })
          }

          return isBlocked
        })

      return blocked
    } catch (error) {
      console.error("Error checking if date is blocked:", error)
      return false
    }
  }

  const isTimeSlotBlocked = (date: string, time: string) => {
    const dateToCheck = date
    return blockedTimeSlots[dateToCheck] && blockedTimeSlots[dateToCheck].includes(time)
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value)
    setSelectedTime("") // Reset time when date changes
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTime(e.target.value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedDate && selectedTime) {
      alert(`Booked on ${selectedDate} at ${selectedTime}`)
    } else {
      alert("Please select a date and time.")
    }
  }

  const availableTimeSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"]

  const getAvailableTimeSlots = (date: string): string[] => {
    try {
      if (!date || isDateBlocked(date)) {
        console.log("🚫 No slots available - date blocked or empty:", date)
        return []
      }

      const normalizedDate = normalizeDateString(date)
      const blocked = blockedTimeSlots[normalizedDate] || []
      const available = availableTimeSlots.filter((slot) => !blocked.includes(slot))

      console.log("⏰ Available time slots for", date, "→ Lagos normalized:", normalizedDate, ":", available)
      return available
    } catch (error) {
      console.error("Error getting available time slots:", error)
      return availableTimeSlots
    }
  }

  return (
    <div>
      <h1>Book an Appointment</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="date">Date:</label>
          <input type="date" id="date" value={selectedDate} onChange={handleDateChange} />
        </div>
        <div>
          <label htmlFor="time">Time:</label>
          <select id="time" value={selectedTime} onChange={handleTimeChange} disabled={!selectedDate}>
            <option value="">Select a time</option>
            {getAvailableTimeSlots(selectedDate).map(
              (time) =>
                !isTimeSlotBlocked(selectedDate, time) && (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ),
            )}
          </select>
        </div>
        <button type="submit" disabled={!selectedDate || !selectedTime}>
          Book
        </button>
        {selectedDate && isDateBlocked(selectedDate) && <p style={{ color: "red" }}>This date is blocked.</p>}
        {selectedDate && selectedTime && isTimeSlotBlocked(selectedDate, selectedTime) && (
          <p style={{ color: "red" }}>This time slot is blocked.</p>
        )}
        {selectedDate && (
          <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
            <span>
              {(() => {
                try {
                  const zonedDate = utcToZonedTime(new Date(selectedDate + "T12:00:00Z"), TIMEZONE)
                  return format(zonedDate, "EEEE, MMMM d, yyyy", { timeZone: TIMEZONE })
                } catch {
                  return selectedDate
                }
              })()}
            </span>
            {isDateBlocked(selectedDate) && <span className="text-red-500 text-sm font-medium">(Fully Booked)</span>}
          </div>
        )}
      </form>
    </div>
  )
}

export default BookPage
