"use client"

import type React from "react"
import { useState } from "react"

const BookPage = () => {
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")

  const blockedDates = ["2024-03-10", "2024-03-15", "2024-03-20"]
  const blockedTimeSlots = {
    "2024-03-12": ["10:00", "11:00"],
    "2024-03-18": ["14:00", "15:00"],
  }

  const isDateBlocked = (date: string) => {
    const dateToCheck = date
    return blockedDates.includes(dateToCheck)
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
            {availableTimeSlots.map(
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
      </form>
    </div>
  )
}

export default BookPage
