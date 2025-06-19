"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, User } from "lucide-react"

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

interface AvailabilityData {
  success: boolean
  blockedDates: BlockedDate[]
  blockedSlots: BlockedSlot[]
  timestamp: string
  debug?: {
    blockedDatesCount: number
    blockedSlotsCount: number
    sampleBlockedDate: string
  }
}

const services = [
  { name: "Classic Lashes", duration: 120, price: 35000 },
  { name: "Volume Lashes", duration: 150, price: 45000 },
  { name: "Ombré Brows", duration: 180, price: 45000 },
  { name: "Lash Refill", duration: 90, price: 25000 },
]

const timeSlots = ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"]

export default function BookingPage() {
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [selectedService, setSelectedService] = useState("")
  const [availabilityData, setAvailabilityData] = useState<AvailabilityData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    notes: "",
  })

  // Fetch availability data
  useEffect(() => {
    async function fetchAvailability() {
      try {
        console.log("🔍 Frontend: Fetching availability...")
        setLoading(true)
        setError(null)

        const response = await fetch("/api/admin/availability")

        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`)
        }

        const data: AvailabilityData = await response.json()

        console.log("✅ Frontend: Received availability data:", {
          success: data.success,
          blockedDatesCount: data.blockedDates?.length || 0,
          blockedSlotsCount: data.blockedSlots?.length || 0,
          debug: data.debug,
        })

        if (!data.success) {
          throw new Error(data.error || "Failed to fetch availability")
        }

        setAvailabilityData(data)
      } catch (err) {
        console.error("❌ Frontend: Error fetching availability:", err)
        setError(err instanceof Error ? err.message : "Failed to load availability")
      } finally {
        setLoading(false)
      }
    }

    fetchAvailability()
  }, [])

  // Check if a date is blocked
  const isDateBlocked = (dateString: string): boolean => {
    if (!availabilityData) return false

    const isBlocked = availabilityData.blockedDates.some((blockedDate) => blockedDate.blocked_date === dateString)

    console.log(`🔍 Frontend: Checking if ${dateString} is blocked:`, isBlocked)
    return isBlocked
  }

  // Check if a time slot is blocked for a specific date
  const isTimeSlotBlocked = (dateString: string, timeString: string): boolean => {
    if (!availabilityData) return false

    return availabilityData.blockedSlots.some(
      (slot) => slot.blocked_date === dateString && slot.blocked_time === timeString,
    )
  }

  // Get available time slots for selected date
  const getAvailableTimeSlots = () => {
    if (!selectedDate) return []

    return timeSlots.filter((time) => !isTimeSlotBlocked(selectedDate, time))
  }

  // Generate date options (next 30 days)
  const getDateOptions = () => {
    const dates = []
    const today = new Date()

    for (let i = 1; i <= 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      const dateString = date.toISOString().split("T")[0] // YYYY-MM-DD format

      dates.push({
        value: dateString,
        label: date.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        blocked: isDateBlocked(dateString),
      })
    }

    return dates
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Handle booking submission
    console.log("Booking submitted:", {
      ...formData,
      date: selectedDate,
      time: selectedTime,
      service: selectedService,
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading availability...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Booking</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Book Your Appointment</h1>
          <p className="text-gray-600">Choose your service and preferred time</p>

          {/* Debug info */}
          {availabilityData?.debug && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm">
              <p className="font-semibold text-blue-800">Debug Info:</p>
              <p className="text-blue-600">
                Blocked dates: {availabilityData.debug.blockedDatesCount} | Blocked slots:{" "}
                {availabilityData.debug.blockedSlotsCount} | Sample blocked: {availabilityData.debug.sampleBlockedDate}
              </p>
            </div>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Appointment Details
            </CardTitle>
            <CardDescription>Select your preferred service, date, and time</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Service Selection */}
              <div className="space-y-2">
                <Label htmlFor="service">Service</Label>
                <Select value={selectedService} onValueChange={setSelectedService}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.name} value={service.name}>
                        {service.name} - ₦{service.price.toLocaleString()} ({service.duration} min)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Selection */}
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Select value={selectedDate} onValueChange={setSelectedDate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a date" />
                  </SelectTrigger>
                  <SelectContent>
                    {getDateOptions().map((date) => (
                      <SelectItem key={date.value} value={date.value} disabled={date.blocked}>
                        {date.label} {date.blocked ? "(Fully Booked)" : "(Available)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Time Selection */}
              {selectedDate && !isDateBlocked(selectedDate) && (
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Select value={selectedTime} onValueChange={setSelectedTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a time" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableTimeSlots().map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Personal Information */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Your Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Any special requests or information..."
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={
                  !selectedService ||
                  !selectedDate ||
                  !selectedTime ||
                  !formData.name ||
                  !formData.phone ||
                  !formData.email
                }
              >
                Book Appointment
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
