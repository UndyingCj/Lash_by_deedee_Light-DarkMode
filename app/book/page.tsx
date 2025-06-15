"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, CreditCard, MessageSquare, AlertTriangle, XCircle, CheckCircle } from "lucide-react"

declare global {
  interface Window {
    PaystackPop?: any
  }
}

export default function BookingPage() {
  // Basic form state
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

  // Availability state with safe defaults
  const [blockedDates, setBlockedDates] = useState<string[]>([])
  const [blockedTimeSlots, setBlockedTimeSlots] = useState<Record<string, string[]>>({})
  const [availabilityLoaded, setAvailabilityLoaded] = useState(false)
  const [loadingAvailability, setLoadingAvailability] = useState(true)
  const [paystackLoaded, setPaystackLoaded] = useState(false)

  // Services data
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

  // Load availability data with comprehensive error handling
  useEffect(() => {
    let mounted = true

    const loadAvailability = async () => {
      try {
        setLoadingAvailability(true)

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
            // Safely handle blocked dates
            if (Array.isArray(data.blockedDates)) {
              const dates = data.blockedDates
                .filter((item) => item && typeof item === "object" && item.blocked_date)
                .map((item) => item.blocked_date)
              setBlockedDates(dates)
            }

            // Safely handle blocked time slots
            if (Array.isArray(data.blockedSlots)) {
              const slotsMap: Record<string, string[]> = {}
              data.blockedSlots
                .filter((slot) => slot && typeof slot === "object" && slot.blocked_date && slot.blocked_time)
                .forEach((slot) => {
                  if (!slotsMap[slot.blocked_date]) {
                    slotsMap[slot.blocked_date] = []
                  }
                  slotsMap[slot.blocked_date].push(slot.blocked_time)
                })
              setBlockedTimeSlots(slotsMap)
            }
          }
        }
      } catch (error) {
        console.error("Error loading availability:", error)
        // Continue with empty defaults
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

  // Load Paystack script with error handling
  useEffect(() => {
    let mounted = true

    const loadPaystack = () => {
      try {
        if (typeof window === "undefined") return

        if (window.PaystackPop) {
          if (mounted) setPaystackLoaded(true)
          return
        }

        const script = document.createElement("script")
        script.src = "https://js.paystack.co/v1/inline.js"
        script.async = true
        script.onload = () => {
          if (mounted) setPaystackLoaded(true)
        }
        script.onerror = () => {
          console.error("Failed to load Paystack")
          if (mounted) setPaystackLoaded(false)
        }
        document.head.appendChild(script)
      } catch (error) {
        console.error("Error loading Paystack script:", error)
        if (mounted) setPaystackLoaded(false)
      }
    }

    loadPaystack()

    return () => {
      mounted = false
    }
  }, [])

  // Safe utility functions
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
  const handleInputChange = (field: string, value: string) => {
    try {
      setFormData((prev) => ({ ...prev, [field]: value }))
    } catch (error) {
      console.error("Error updating form:", error)
    }
  }

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

  // Validation
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

  // Payment handlers
  const handlePaystackPayment = async () => {
    try {
      if (!validateForm()) return

      if (!paystackLoaded || typeof window === "undefined" || !window.PaystackPop) {
        alert("Payment system is loading. Please try again in a moment.")
        return
      }

      setIsProcessing(true)
      const depositAmount = getDepositAmount()

      const handler = window.PaystackPop.setup({
        key: "pk_test_your_paystack_public_key",
        email: formData.email || `${formData.phone.replace(/\D/g, "")}@temp.com`,
        amount: depositAmount * 100,
        currency: "NGN",
        ref: `LBD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        metadata: {
          custom_fields: [
            { display_name: "Service", variable_name: "service", value: selectedService },
            { display_name: "Date", variable_name: "date", value: selectedDate },
            { display_name: "Time", variable_name: "time", value: selectedTime },
            { display_name: "Phone", variable_name: "phone", value: formData.phone },
            { display_name: "Notes", variable_name: "notes", value: formData.notes || "No special notes" },
          ],
        },
        callback: (response: any) => {
          setIsProcessing(false)
          alert(
            `Payment successful! 🎉\n\nReference: ${response.reference}\n\nWe'll contact you within 24 hours to confirm your appointment details. Thank you for choosing Lashed by Deedee!`,
          )

          // Reset form
          setSelectedService("")
          setSelectedDate("")
          setSelectedTime("")
          setFormData({ name: "", phone: "", email: "", notes: "" })
        },
        onClose: () => {
          setIsProcessing(false)
        },
      })

      handler.openIframe()
    } catch (error) {
      setIsProcessing(false)
      console.error("Payment error:", error)
      alert("There was an error processing your payment. Please try again or contact us directly.")
    }
  }

  const handleWhatsAppBooking = () => {
    try {
      if (!validateForm()) return

      const service = services.find((s) => s.name === selectedService)
      const depositAmount = getDepositAmount()

      const message = `Hi! I'd like to book an appointment:

📅 Service: ${selectedService}
💰 Price: ₦${service?.price} (Deposit: ₦${depositAmount.toLocaleString()})
📅 Date: ${new Date(selectedDate).toLocaleDateString()}
⏰ Time: ${selectedTime}
👤 Name: ${formData.name}
📱 Phone: ${formData.phone}
${formData.email ? `📧 Email: ${formData.email}` : ""}
${formData.notes ? `📝 Notes: ${formData.notes}` : ""}

Please confirm my appointment and let me know how to pay the deposit. Thank you!`

      const whatsappUrl = `https://wa.me/message/X5M2NOA553NGK1?text=${encodeURIComponent(message)}`
      if (typeof window !== "undefined") {
        window.open(whatsappUrl, "_blank")
      }
    } catch (error) {
      console.error("WhatsApp booking error:", error)
      alert("There was an error processing your booking request. Please try again.")
    }
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
              All time slots are booked. Please select another date.
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
            {availableSlots.length} time slot{availableSlots.length !== 1 ? "s" : ""} available.
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading booking information...</p>
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
                    • <strong>Deposit:</strong> 50% non-refundable deposit required to confirm your appointment.
                  </li>
                  <li>
                    • <strong>Punctuality:</strong> Arrivals more than 1 hour late will result in cancellation.
                  </li>
                  <li>
                    • <strong>Rescheduling:</strong> You can reschedule only once. Missing after rescheduling forfeits
                    your deposit.
                  </li>
                  <li>
                    • <strong>Cancellations:</strong> 24 hours advance notice required for cancellations.
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
                      onChange={(e) => handleInputChange("name", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-base font-medium text-gray-900 dark:text-gray-100">Phone Number *</Label>
                    <Input
                      placeholder="+234 XXX XXX XXXX"
                      className="mt-2"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
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
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                </div>

                <div>
                  <Label className="text-base font-medium text-gray-900 dark:text-gray-100">Special Notes</Label>
                  <Textarea
                    placeholder="Any special requests or notes"
                    className="mt-2"
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
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

                {/* Payment Buttons */}
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
                      !paystackLoaded ||
                      isDateBlocked(selectedDate) ||
                      !isTimeSlotAvailable(selectedDate, selectedTime)
                    }
                    onClick={handlePaystackPayment}
                  >
                    {isProcessing ? "Processing..." : !paystackLoaded ? "Loading Payment..." : "Pay with Paystack"}
                  </Button>

                  <div className="text-center text-sm text-gray-500 dark:text-gray-400">or</div>

                  <Button
                    variant="outline"
                    className="w-full border-green-500 text-green-600 hover:bg-green-50 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-900/20"
                    disabled={
                      !selectedService ||
                      !selectedDate ||
                      !selectedTime ||
                      !formData.name ||
                      !formData.phone ||
                      isDateBlocked(selectedDate) ||
                      !isTimeSlotAvailable(selectedDate, selectedTime)
                    }
                    onClick={handleWhatsAppBooking}
                  >
                    Book via WhatsApp
                  </Button>
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  <p>Payment methods:</p>
                  <p>Paystack • WhatsApp • Bank Transfer</p>
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
