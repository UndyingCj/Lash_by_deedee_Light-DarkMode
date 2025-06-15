"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Calendar,
  Clock,
  CreditCard,
  MessageSquare,
  AlertTriangle,
  XCircle,
  CheckCircle,
  RefreshCw,
} from "lucide-react"

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

export default function BookingPage() {
  // Form state
  const [selectedService, setSelectedService] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    notes: "",
  })

  // Availability state
  const [blockedDates, setBlockedDates] = useState<string[]>([])
  const [blockedTimeSlots, setBlockedTimeSlots] = useState<Record<string, string[]>>({})
  const [availabilityLoaded, setAvailabilityLoaded] = useState(false)
  const [loadingAvailability, setLoadingAvailability] = useState(true)
  const [availabilityError, setAvailabilityError] = useState<string | null>(null)

  const services = [
    { name: "Microblading", price: "40,000", duration: "2.5 hours" },
    { name: "Ombré Brows", price: "45,000", duration: "2.5 hours" },
    { name: "Combo Brows", price: "50,000", duration: "3 hours" },
    { name: "Microshading", price: "55,000", duration: "2.5 hours" },
    { name: "Brow Lamination", price: "15,000", duration: "1 hour" },
    { name: "Brow Lamination & Tint", price: "25,000", duration: "1.5 hours" },
    { name: "Classic Lashes", price: "15,000", duration: "2 hours" },
    { name: "Hybrid Lashes", price: "20,000", duration: "2.5 hours" },
    { name: "Volume Lashes", price: "25,000", duration: "2.5 hours" },
    { name: "Mega Volume Lashes", price: "30,000", duration: "3 hours" },
    { name: "Brow Touch-Up (2-4 months) - Done by Deedee", price: "25,000", duration: "1.5 hours" },
    { name: "Brow Touch-Up (2-4 months) - Not done by Deedee", price: "30,000", duration: "2 hours" },
    { name: "Brow Touch-Up (5-9 months) - Done by Deedee", price: "30,000", duration: "2 hours" },
    { name: "Brow Touch-Up (5-9 months) - Not done by Deedee", price: "35,000", duration: "2.5 hours" },
    { name: "Wispy Effect (Add-on)", price: "3,000", duration: "30 mins" },
    { name: "Full Effect (Add-on)", price: "2,000", duration: "20 mins" },
    { name: "Bottom Lashes", price: "6,000", duration: "45 mins" },
    { name: "Lash Removal", price: "4,000", duration: "30 mins" },
  ]

  const timeSlots = ["9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM"]

  // Load availability data
  useEffect(() => {
    let mounted = true

    const loadAvailability = async () => {
      try {
        setLoadingAvailability(true)
        setAvailabilityError(null)

        const response = await fetch("/api/admin/availability", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!mounted) return

        if (response.ok) {
          const data = await response.json()

          if (data && typeof data === "object") {
            // Handle blocked dates
            if (Array.isArray(data.blockedDates)) {
              const dates = data.blockedDates
                .filter((item: BlockedDate) => item && typeof item === "object" && item.blocked_date)
                .map((item: BlockedDate) => item.blocked_date)
              setBlockedDates(dates)
            }

            // Handle blocked time slots
            if (Array.isArray(data.blockedSlots)) {
              const slotsMap: Record<string, string[]> = {}
              data.blockedSlots
                .filter(
                  (slot: BlockedTimeSlot) => slot && typeof slot === "object" && slot.blocked_date && slot.blocked_time,
                )
                .forEach((slot: BlockedTimeSlot) => {
                  if (!slotsMap[slot.blocked_date]) {
                    slotsMap[slot.blocked_date] = []
                  }
                  slotsMap[slot.blocked_date].push(slot.blocked_time)
                })
              setBlockedTimeSlots(slotsMap)
            }
          }
        } else {
          console.warn("Failed to load availability data")
          setAvailabilityError("Unable to load availability. All dates will be shown as available.")
        }
      } catch (error) {
        console.error("Error loading availability:", error)
        if (mounted) {
          setAvailabilityError("Connection error. All dates will be shown as available.")
        }
      } finally {
        if (mounted) {
          setAvailabilityLoaded(true)
          setLoadingAvailability(false)
        }
      }
    }

    loadAvailability()

    return () => {
      mounted = false
    }
  }, [])

  // Utility functions
  const isDateBlocked = (date: string): boolean => {
    try {
      return Array.isArray(blockedDates) && blockedDates.includes(date)
    } catch {
      return false
    }
  }

  const getAvailableTimeSlots = (date: string): string[] => {
    try {
      if (!date || isDateBlocked(date)) return []

      const blocked = blockedTimeSlots[date] || []
      return timeSlots.filter((slot) => !blocked.includes(slot))
    } catch {
      return timeSlots
    }
  }

  const isTimeSlotAvailable = (date: string, time: string): boolean => {
    try {
      if (!date || !time || isDateBlocked(date)) return false

      const blocked = blockedTimeSlots[date] || []
      return !blocked.includes(time)
    } catch {
      return true
    }
  }

  const getDepositAmount = (): number => {
    try {
      const service = services.find((s) => s.name === selectedService)
      if (!service) return 0

      const price = Number.parseInt(service.price.replace(/,/g, ""), 10)
      return Math.floor(price / 2)
    } catch {
      return 0
    }
  }

  const getMinDate = (): string => {
    try {
      return new Date().toISOString().split("T")[0]
    } catch {
      return ""
    }
  }

  // Form handlers
  const handleDateChange = (value: string) => {
    try {
      setSelectedDate(value)
      setSelectedTime("")
    } catch (error) {
      console.error("Error changing date:", error)
    }
  }

  const handleTimeChange = (value: string) => {
    try {
      if (selectedDate && !isDateBlocked(selectedDate)) {
        setSelectedTime(value)
      }
    } catch (error) {
      console.error("Error changing time:", error)
    }
  }

  const validateForm = (): boolean => {
    try {
      if (!selectedService) {
        alert("Please select a service")
        return false
      }
      if (!selectedDate) {
        alert("Please select a date")
        return false
      }
      if (isDateBlocked(selectedDate)) {
        alert("This date is fully booked. Please select another date.")
        return false
      }
      if (!selectedTime) {
        alert("Please select a time")
        return false
      }
      if (!isTimeSlotAvailable(selectedDate, selectedTime)) {
        alert("This time slot is no longer available.")
        return false
      }
      if (!formData.name.trim()) {
        alert("Please enter your full name")
        return false
      }
      if (!formData.phone.trim()) {
        alert("Please enter your phone number")
        return false
      }
      return true
    } catch (error) {
      console.error("Validation error:", error)
      alert("Please check your booking details and try again.")
      return false
    }
  }

  const handleWhatsAppBooking = () => {
    if (!validateForm()) return

    const service = services.find((s) => s.name === selectedService)
    const depositAmount = getDepositAmount()

    const message = `Hi! I'd like to book an appointment:

📅 Service: ${selectedService}
💰 Price: ₦${service?.price} (Deposit: ₦${depositAmount.toLocaleString()})
📅 Date: ${new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })}
⏰ Time: ${selectedTime}
👤 Name: ${formData.name}
📱 Phone: ${formData.phone}${
      formData.email
        ? `
📧 Email: ${formData.email}`
        : ""
    }${
      formData.notes
        ? `
📝 Notes: ${formData.notes}`
        : ""
    }

Please confirm my appointment and let me know how to pay the deposit. Thank you!`

    const whatsappUrl = `https://wa.me/2348165435528?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  // Render availability message
  const renderAvailabilityMessage = () => {
    try {
      if (!selectedDate || !availabilityLoaded) return null

      if (isDateBlocked(selectedDate)) {
        return (
          <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center space-x-2 text-red-700 dark:text-red-300">
              <XCircle className="w-5 h-5" />
              <span className="font-medium">Fully Booked</span>
            </div>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              This date is fully booked. Please select another date.
            </p>
          </div>
        )
      }

      const availableSlots = getAvailableTimeSlots(selectedDate)
      if (availableSlots.length === 0) {
        return (
          <div className="mt-2 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <div className="flex items-center space-x-2 text-orange-700 dark:text-orange-300">
              <XCircle className="w-5 h-5" />
              <span className="font-medium">No Available Slots</span>
            </div>
            <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
              All time slots are booked for this date. Please select another date.
            </p>
          </div>
        )
      }

      return (
        <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center space-x-2 text-green-700 dark:text-green-300">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Available Slots</span>
          </div>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">
            {availableSlots.length} time slot{availableSlots.length !== 1 ? "s" : ""} available for this date.
          </p>
        </div>
      )
    } catch (error) {
      console.error("Error rendering availability message:", error)
      return null
    }
  }

  // Show loading state
  if (loadingAvailability) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-rose-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4">
            <RefreshCw className="w-6 h-6 text-pink-500" />
          </div>
          <p className="text-gray-600 dark:text-gray-300">Loading availability information...</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Checking which dates and times are available...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-rose-50 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-pink-500 mb-4">Book an Appointment</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Select a service, pick a date, and secure your spot with a 50% deposit.
          </p>
        </div>

        {/* Availability Error Message */}
        {availabilityError && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center space-x-2 text-yellow-700 dark:text-yellow-300">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">Availability Notice</span>
            </div>
            <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">{availabilityError}</p>
          </div>
        )}

        {/* Booking Policies */}
        <Card className="border-pink-200 dark:border-pink-700 bg-pink-50 dark:bg-gray-800 mb-8">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-6 h-6 text-pink-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
                  Important Booking Policies
                </h3>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li>
                    • <strong>Session Time:</strong> Each session takes approximately 2-3 hours. Please schedule
                    accordingly.
                  </li>
                  <li>
                    • <strong>Deposit:</strong> 50% non-refundable deposit required to confirm your appointment.
                  </li>
                  <li>
                    • <strong>Punctuality:</strong> Arrivals more than 1 hour late will result in cancellation and
                    rescheduling.
                  </li>
                  <li>
                    • <strong>Rescheduling:</strong> You can reschedule only once. Missing after rescheduling forfeits
                    your deposit.
                  </li>
                  <li>
                    • <strong>Cancellations:</strong> 24 hours advance notice required for cancellations.
                  </li>
                  <li>
                    • <strong>No-Shows:</strong> Deposit will be forfeited for no-shows or failure to notify us.
                  </li>
                  <li>
                    • <strong>Makeup Policy:</strong> Please avoid wearing makeup to ensure the best results.
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <Card className="border-pink-200 dark:border-pink-700 dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-800 dark:text-gray-100 flex items-center space-x-2">
                  <Calendar className="w-6 h-6 text-pink-500" />
                  <span>Booking Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Service Selection */}
                <div>
                  <Label className="text-base font-medium text-gray-900 dark:text-gray-100">Select Service *</Label>
                  <Select value={selectedService} onValueChange={setSelectedService}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Choose your service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service, index) => (
                        <SelectItem key={index} value={service.name}>
                          {service.name} - ₦{service.price} ({service.duration})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Selection */}
                <div>
                  <Label className="text-base font-medium text-gray-900 dark:text-gray-100">Preferred Date *</Label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="mt-2"
                    min={getMinDate()}
                  />
                  {renderAvailabilityMessage()}
                </div>

                {/* Time Selection */}
                <div>
                  <Label className="text-base font-medium text-gray-900 dark:text-gray-100">Preferred Time *</Label>
                  <Select
                    value={selectedTime}
                    onValueChange={handleTimeChange}
                    disabled={!selectedDate || isDateBlocked(selectedDate)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue
                        placeholder={
                          !selectedDate
                            ? "Select a date first"
                            : isDateBlocked(selectedDate)
                              ? "Date fully booked"
                              : "Choose your time"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedDate && !isDateBlocked(selectedDate) ? (
                        getAvailableTimeSlots(selectedDate).length > 0 ? (
                          getAvailableTimeSlots(selectedDate).map((time, index) => (
                            <SelectItem key={index} value={time}>
                              {time}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="" disabled>
                            No available time slots
                          </SelectItem>
                        )
                      ) : (
                        <SelectItem value="" disabled>
                          {!selectedDate ? "Please select a date first" : "Date fully booked"}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Personal Information */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-base font-medium text-gray-900 dark:text-gray-100">Full Name *</Label>
                    <Input
                      placeholder="Your full name"
                      className="mt-2"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label className="text-base font-medium text-gray-900 dark:text-gray-100">Phone Number *</Label>
                    <Input
                      placeholder="+234 XXX XXX XXXX"
                      className="mt-2"
                      value={formData.phone}
                      onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium text-gray-900 dark:text-gray-100">Email Address</Label>
                  <Input
                    type="email"
                    placeholder="your.email@example.com"
                    className="mt-2"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  />
                </div>

                <div>
                  <Label className="text-base font-medium text-gray-900 dark:text-gray-100">Special Notes</Label>
                  <Textarea
                    placeholder="Any special requests or notes (e.g., 'I want natural-looking brows')"
                    className="mt-2"
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Summary */}
          <div>
            <Card className="border-pink-200 dark:border-pink-700 dark:bg-gray-800 sticky top-8">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800 dark:text-gray-100">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedService && (
                  <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg border dark:border-pink-800">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-100">{selectedService}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {services.find((s) => s.name === selectedService)?.duration}
                    </p>
                    <p className="text-lg font-bold text-pink-500 dark:text-pink-400">
                      ₦{services.find((s) => s.name === selectedService)?.price}
                    </p>
                  </div>
                )}

                {selectedDate && (
                  <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(selectedDate).toLocaleDateString()}</span>
                    {isDateBlocked(selectedDate) && (
                      <span className="text-red-500 text-sm font-medium">(Fully Booked)</span>
                    )}
                  </div>
                )}

                {selectedTime && (
                  <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                    <Clock className="w-4 h-4" />
                    <span>{selectedTime}</span>
                  </div>
                )}

                <div className="border-t dark:border-gray-700 pt-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300 mb-2">
                    <CreditCard className="w-4 h-4" />
                    <span>50% deposit required (non-refundable)</span>
                  </div>
                  {selectedService && (
                    <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
                      Deposit: ₦{getDepositAmount().toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Booking Button */}
                <div className="space-y-3">
                  <Button
                    className="w-full bg-pink-500 hover:bg-pink-600 text-white"
                    disabled={
                      !selectedService ||
                      !selectedDate ||
                      !selectedTime ||
                      !formData.name ||
                      !formData.phone ||
                      isProcessing ||
                      isDateBlocked(selectedDate) ||
                      !isTimeSlotAvailable(selectedDate, selectedTime)
                    }
                    onClick={handleWhatsAppBooking}
                  >
                    {isProcessing ? "Processing..." : "Book via WhatsApp"}
                  </Button>
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  <p>Contact us via WhatsApp to confirm your appointment</p>
                  <p>and arrange payment details</p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Card */}
            <Card className="border-pink-200 dark:border-pink-700 dark:bg-gray-800 mt-6">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 text-pink-500 dark:text-pink-400 mb-2">
                  <MessageSquare className="w-5 h-5" />
                  <span className="font-medium">Need Help?</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  Have questions about your booking? Contact us directly.
                </p>
                <a href="https://wa.me/message/X5M2NOA553NGK1" target="_blank" rel="noopener noreferrer">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-pink-300 dark:border-pink-700 text-pink-600 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/20"
                  >
                    WhatsApp Us
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
