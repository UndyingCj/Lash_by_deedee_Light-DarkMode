"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, CheckCircle, AlertCircle, Loader2, ChevronDown } from "lucide-react"

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

interface AvailabilityData {
  success: boolean
  data: {
    blockedDates: BlockedDate[]
    blockedSlots: BlockedSlot[]
    statistics: {
      totalBlockedDates: number
      totalBlockedSlots: number
      processingTime: string
    }
    metadata: {
      lastUpdated: string
      version: string
    }
  }
  timestamp: string
  error?: string
}

const services = [
  {
    name: "Classic Lashes",
    duration: 120,
    price: 35000,
    description: "Natural-looking individual lash extensions",
  },
  {
    name: "Volume Lashes",
    duration: 150,
    price: 45000,
    description: "Fuller, more dramatic lash look",
  },
  {
    name: "Ombré Brows",
    duration: 180,
    price: 45000,
    description: "Semi-permanent eyebrow enhancement",
  },
  {
    name: "Lash Refill",
    duration: 90,
    price: 25000,
    description: "Maintenance for existing lash extensions",
  },
]

const timeSlots = ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"]

export default function BookingPage() {
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [selectedService, setSelectedService] = useState("")
  const [availabilityData, setAvailabilityData] = useState<AvailabilityData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    notes: "",
  })

  const [formErrors, setFormErrors] = useState({
    name: "",
    phone: "",
    email: "",
  })

  // Fetch availability data
  useEffect(() => {
    async function fetchAvailability() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch("/api/admin/availability")

        if (!response.ok) {
          throw new Error(`Failed to load availability (${response.status})`)
        }

        const data: AvailabilityData = await response.json()

        if (!data.success) {
          throw new Error(data.error || "Failed to fetch availability")
        }

        setAvailabilityData(data)
      } catch (err) {
        console.error("Error fetching availability:", err)
        setError(err instanceof Error ? err.message : "Failed to load availability")
      } finally {
        setLoading(false)
      }
    }

    fetchAvailability()
  }, [])

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
    return phoneRegex.test(phone.replace(/[\s\-()]/g, ""))
  }

  const validateForm = (): boolean => {
    const errors = {
      name: "",
      phone: "",
      email: "",
    }

    if (!formData.name.trim()) {
      errors.name = "Full name is required"
    } else if (formData.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters"
    }

    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required"
    } else if (!validatePhone(formData.phone)) {
      errors.phone = "Please enter a valid phone number"
    }

    if (!formData.email.trim()) {
      errors.email = "Email address is required"
    } else if (!validateEmail(formData.email)) {
      errors.email = "Please enter a valid email address"
    }

    setFormErrors(errors)
    return !Object.values(errors).some((error) => error !== "")
  }

  // Check if a date is blocked
  const isDateBlocked = (dateString: string): boolean => {
    if (!availabilityData?.data) return false
    return availabilityData.data.blockedDates.some((blockedDate) => blockedDate.blocked_date === dateString)
  }

  // Check if a time slot is blocked for a specific date
  const isTimeSlotBlocked = (dateString: string, timeString: string): boolean => {
    if (!availabilityData?.data) return false
    return availabilityData.data.blockedSlots.some(
      (slot) => slot.blocked_date === dateString && slot.blocked_time === timeString,
    )
  }

  // Get available time slots for selected date
  const getAvailableTimeSlots = () => {
    if (!selectedDate) return []
    return timeSlots.filter((time) => !isTimeSlotBlocked(selectedDate, time))
  }

  // Generate date options (next 30 days, excluding weekends)
  const getDateOptions = () => {
    const dates = []
    const today = new Date()

    for (let i = 1; i <= 45; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)

      // Skip weekends (Saturday = 6, Sunday = 0)
      if (date.getDay() === 0 || date.getDay() === 6) continue

      const dateString = date.toISOString().split("T")[0]

      dates.push({
        value: dateString,
        label: date.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        shortLabel: date.toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
        }),
        blocked: isDateBlocked(dateString),
      })
    }

    return dates.slice(0, 20)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      // Simulate booking submission
      await new Promise((resolve) => setTimeout(resolve, 2000))

      console.log("Booking submitted:", {
        ...formData,
        date: selectedDate,
        time: selectedTime,
        service: selectedService,
      })

      setSuccess(true)
    } catch (err) {
      setError("Failed to submit booking. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-pink-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Loading availability...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-800 border-red-500/20">
          <CardHeader className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-400">Unable to Load Booking</CardTitle>
            <CardDescription className="text-gray-400">{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-800 border-green-500/20">
          <CardHeader className="text-center">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <CardTitle className="text-2xl text-green-400 mb-2">Booking Confirmed!</CardTitle>
            <CardDescription className="text-gray-300 text-lg">
              Your appointment has been successfully scheduled
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-700 rounded-lg p-6 space-y-3">
              <div className="flex justify-between">
                <span className="font-medium text-gray-400">Service:</span>
                <span className="text-gray-200">{selectedService}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-400">Date:</span>
                <span className="text-gray-200">
                  {new Date(selectedDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-400">Time:</span>
                <span className="text-gray-200">{selectedTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-400">Client:</span>
                <span className="text-gray-200">{formData.name}</span>
              </div>
            </div>
            <div className="text-center pt-4">
              <p className="text-sm text-gray-400 mb-4">A confirmation email has been sent to {formData.email}</p>
              <Button onClick={() => (window.location.href = "/")} className="bg-pink-600 hover:bg-pink-700">
                Return to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-gray-800 border-pink-500/20 shadow-2xl">
            <CardHeader className="border-b border-gray-700">
              <CardTitle className="flex items-center gap-3 text-2xl text-white">
                <Calendar className="h-6 w-6 text-pink-500" />
                Booking Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Service Selection */}
                <div className="space-y-3">
                  <Label className="text-lg font-medium text-white">Select Service *</Label>
                  <Select value={selectedService} onValueChange={setSelectedService}>
                    <SelectTrigger className="h-14 bg-gray-900 border-gray-600 text-gray-300 hover:border-gray-500 focus:border-pink-500">
                      <SelectValue placeholder="Choose your service" />
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      {services.map((service) => (
                        <SelectItem
                          key={service.name}
                          value={service.name}
                          className="text-gray-200 hover:bg-gray-700 focus:bg-gray-700"
                        >
                          <div className="flex justify-between items-center w-full">
                            <div>
                              <span className="font-medium">{service.name}</span>
                              <span className="text-sm text-gray-400 ml-2">({service.duration} min)</span>
                            </div>
                            <span className="text-pink-400 font-semibold">₦{service.price.toLocaleString()}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Selection */}
                <div className="space-y-3">
                  <Label className="text-lg font-medium text-white">Preferred Date *</Label>
                  <Select value={selectedDate} onValueChange={setSelectedDate}>
                    <SelectTrigger className="h-14 bg-gray-900 border-gray-600 text-gray-300 hover:border-gray-500 focus:border-pink-500">
                      <div className="flex items-center justify-between w-full">
                        <SelectValue placeholder="Choose your date">
                          {selectedDate && (
                            <span className="text-white">
                              {getDateOptions().find((d) => d.value === selectedDate)?.shortLabel}
                            </span>
                          )}
                        </SelectValue>
                        <Calendar className="h-4 w-4 opacity-50" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      {getDateOptions().map((date) => (
                        <SelectItem
                          key={date.value}
                          value={date.value}
                          disabled={date.blocked}
                          className="text-gray-200 hover:bg-gray-700 focus:bg-gray-700"
                        >
                          <div className="flex justify-between items-center w-full">
                            <span>{date.label}</span>
                            {date.blocked && <span className="text-red-400 text-sm ml-2">Fully Booked</span>}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Available Slots Indicator */}
                {selectedDate && !isDateBlocked(selectedDate) && (
                  <div className="border-2 border-green-500/30 bg-green-500/10 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <div>
                        <h3 className="text-green-400 font-semibold">Available Slots</h3>
                        <p className="text-green-300 text-sm">
                          {getAvailableTimeSlots().length} time slots available for this date.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Time Selection */}
                {selectedDate && !isDateBlocked(selectedDate) && (
                  <div className="space-y-3">
                    <Label className="text-lg font-medium text-white">Preferred Time *</Label>
                    <Select value={selectedTime} onValueChange={setSelectedTime}>
                      <SelectTrigger className="h-14 bg-gray-900 border-gray-600 text-gray-300 hover:border-gray-500 focus:border-pink-500">
                        <SelectValue placeholder="Choose your time" />
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        {getAvailableTimeSlots().map((time) => (
                          <SelectItem
                            key={time}
                            value={time}
                            className="text-gray-200 hover:bg-gray-700 focus:bg-gray-700"
                          >
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-lg font-medium text-white">Full Name *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`h-14 bg-gray-900 border-gray-600 text-white placeholder-gray-500 hover:border-gray-500 focus:border-pink-500 ${
                        formErrors.name ? "border-red-500" : ""
                      }`}
                      placeholder="Your full name"
                    />
                    {formErrors.name && (
                      <p className="text-sm text-red-400 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {formErrors.name}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label className="text-lg font-medium text-white">Phone Number *</Label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={`h-14 bg-gray-900 border-gray-600 text-white placeholder-gray-500 hover:border-gray-500 focus:border-pink-500 ${
                        formErrors.phone ? "border-red-500" : ""
                      }`}
                      placeholder="+234 XXX XXX XXXX"
                    />
                    {formErrors.phone && (
                      <p className="text-sm text-red-400 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {formErrors.phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-3">
                  <Label className="text-lg font-medium text-white">Email Address *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`h-14 bg-gray-900 border-gray-600 text-white placeholder-gray-500 hover:border-gray-500 focus:border-pink-500 ${
                      formErrors.email ? "border-red-500" : ""
                    }`}
                    placeholder="your.email@example.com"
                  />
                  {formErrors.email && (
                    <p className="text-sm text-red-400 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {formErrors.email}
                    </p>
                  )}
                </div>

                {/* Additional Notes */}
                <div className="space-y-3">
                  <Label className="text-lg font-medium text-white">Additional Notes (Optional)</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="bg-gray-900 border-gray-600 text-white placeholder-gray-500 hover:border-gray-500 focus:border-pink-500 min-h-[100px]"
                    placeholder="Any special requests, allergies, or information we should know..."
                  />
                </div>

                <Button
                  type="submit"
                  disabled={
                    !selectedService ||
                    !selectedDate ||
                    !selectedTime ||
                    !formData.name ||
                    !formData.phone ||
                    !formData.email ||
                    submitting
                  }
                  className="w-full h-14 text-lg bg-pink-600 hover:bg-pink-700 disabled:bg-gray-700 disabled:text-gray-500"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Confirming Appointment...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Confirm Appointment
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
