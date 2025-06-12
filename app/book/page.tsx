"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, CreditCard, MessageSquare, AlertTriangle } from "lucide-react"

declare global {
  interface Window {
    PaystackPop: any
  }
}

export default function BookingPage() {
  const [selectedService, setSelectedService] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [paystackLoaded, setPaystackLoaded] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    notes: "",
  })

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

  // Load Paystack script
  useEffect(() => {
    const loadPaystackScript = () => {
      if (window.PaystackPop) {
        setPaystackLoaded(true)
        return
      }

      const script = document.createElement("script")
      script.src = "https://js.paystack.co/v1/inline.js"
      script.async = true
      script.onload = () => {
        setPaystackLoaded(true)
      }
      script.onerror = () => {
        console.error("Failed to load Paystack script")
        setPaystackLoaded(false)
      }
      document.head.appendChild(script)
    }

    loadPaystackScript()
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const getDepositAmount = () => {
    const service = services.find((s) => s.name === selectedService)
    if (!service) return 0
    return Math.floor(Number.parseInt(service.price.replace(",", "")) / 2)
  }

  const validateForm = () => {
    if (!selectedService) {
      alert("Please select a service")
      return false
    }
    if (!selectedDate) {
      alert("Please select a date")
      return false
    }
    if (!selectedTime) {
      alert("Please select a time")
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
  }

  const handlePaystackPayment = () => {
    if (!validateForm()) return

    if (!paystackLoaded || !window.PaystackPop) {
      alert("Payment system is loading. Please try again in a moment.")
      return
    }

    setIsProcessing(true)
    const depositAmount = getDepositAmount()
    const service = services.find((s) => s.name === selectedService)

    try {
      const handler = window.PaystackPop.setup({
        key: "pk_test_your_paystack_public_key", // Replace with your actual Paystack public key
        email: formData.email || `${formData.phone.replace(/\D/g, "")}@temp.com`,
        amount: depositAmount * 100, // Paystack expects amount in kobo
        currency: "NGN",
        ref: `LBD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        metadata: {
          custom_fields: [
            {
              display_name: "Service",
              variable_name: "service",
              value: selectedService,
            },
            {
              display_name: "Date",
              variable_name: "date",
              value: selectedDate,
            },
            {
              display_name: "Time",
              variable_name: "time",
              value: selectedTime,
            },
            {
              display_name: "Phone",
              variable_name: "phone",
              value: formData.phone,
            },
            {
              display_name: "Notes",
              variable_name: "notes",
              value: formData.notes || "No special notes",
            },
          ],
        },
        callback: (response: any) => {
          setIsProcessing(false)
          // Payment successful
          alert(
            `Payment successful! 🎉

Reference: ${response.reference}

We'll contact you within 24 hours to confirm your appointment details. Thank you for choosing Lashed by Deedee!`,
          )

          // Reset form
          setSelectedService("")
          setSelectedDate("")
          setSelectedTime("")
          setFormData({ name: "", phone: "", email: "", notes: "" })

          // Here you would typically send the booking details to your backend
          console.log("Payment successful:", response)
        },
        onClose: () => {
          setIsProcessing(false)
          // User closed the payment modal
        },
      })

      handler.openIframe()
    } catch (error) {
      setIsProcessing(false)
      console.error("Payment error:", error)
      alert("There was an error processing your payment. Please try again or contact us directly.")
    }
  }

  const handleAlternativeBooking = () => {
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
    window.open(whatsappUrl, "_blank")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-rose-50 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-pink-500 mb-4">Book an Appointment</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Select a service, pick a date, and secure your spot with a 50% deposit. Each session takes approximately 2-3
            hours.
          </p>
        </div>

        {/* Booking Policies Notice */}
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
                  <Label htmlFor="service" className="text-base font-medium text-gray-900 dark:text-gray-100">
                    Select Service *
                  </Label>
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
                  <Label htmlFor="date" className="text-base font-medium text-gray-900 dark:text-gray-100">
                    Preferred Date *
                  </Label>
                  <Input
                    type="date"
                    id="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="mt-2"
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>

                {/* Time Selection */}
                <div>
                  <Label htmlFor="time" className="text-base font-medium text-gray-900 dark:text-gray-100">
                    Preferred Time * (2 hours each slot)
                  </Label>
                  <Select value={selectedTime} onValueChange={setSelectedTime}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Choose your time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time, index) => (
                        <SelectItem key={index} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Personal Information */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-base font-medium text-gray-900 dark:text-gray-100">
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      placeholder="Your full name"
                      className="mt-2"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-base font-medium text-gray-900 dark:text-gray-100">
                      Phone Number *
                    </Label>
                    <Input
                      id="phone"
                      placeholder="+234 XXX XXX XXXX"
                      className="mt-2"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-base font-medium text-gray-900 dark:text-gray-100">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    className="mt-2"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                </div>

                {/* Special Notes */}
                <div>
                  <Label htmlFor="notes" className="text-base font-medium text-gray-900 dark:text-gray-100">
                    Special Notes
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special requests or notes (e.g., 'I want natural-looking brows')"
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
                      !paystackLoaded
                    }
                    onClick={handlePaystackPayment}
                  >
                    {isProcessing ? "Processing..." : !paystackLoaded ? "Loading Payment..." : "Pay with Paystack"}
                  </Button>

                  <div className="text-center text-sm text-gray-500 dark:text-gray-400">or</div>

                  <a href="https://wa.me/message/X5M2NOA553NGK1" target="_blank" rel="noopener noreferrer">
                    <Button
                      variant="outline"
                      className="w-full border-green-500 text-green-600 hover:bg-green-50 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-900/20"
                      disabled={!selectedService || !selectedDate || !selectedTime || !formData.name || !formData.phone}
                      onClick={handleAlternativeBooking}
                    >
                      Book via WhatsApp
                    </Button>
                  </a>
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
