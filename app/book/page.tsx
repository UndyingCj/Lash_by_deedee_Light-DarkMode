"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, CreditCard, CheckCircle, AlertCircle } from "lucide-react"
import PaystackPayment from "@/components/paystack-payment"

const services = [
  { id: "classic-lashes", name: "Classic Lashes", price: 15000, duration: "2 hours" },
  { id: "volume-lashes", name: "Volume Lashes", price: 20000, duration: "2.5 hours" },
  { id: "hybrid-lashes", name: "Hybrid Lashes", price: 18000, duration: "2.5 hours" },
  { id: "lash-refill", name: "Lash Refill", price: 8000, duration: "1.5 hours" },
  { id: "brow-lamination", name: "Brow Lamination", price: 12000, duration: "1 hour" },
  { id: "brow-tinting", name: "Brow Tinting", price: 5000, duration: "30 minutes" },
]

const timeSlots = ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"]

export default function BookPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  })
  const [showPayment, setShowPayment] = useState(false)
  const [bookingComplete, setBookingComplete] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const totalAmount = selectedServices.reduce((total, serviceId) => {
    const service = services.find((s) => s.id === serviceId)
    return total + (service?.price || 0)
  }, 0)

  const depositAmount = Math.floor(totalAmount * 0.5) // 50% deposit

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId],
    )
  }

  const handleNextStep = () => {
    setError("")

    if (currentStep === 1 && selectedServices.length === 0) {
      setError("Please select at least one service")
      return
    }

    if (currentStep === 2 && (!selectedDate || !selectedTime)) {
      setError("Please select both date and time")
      return
    }

    if (currentStep === 3) {
      if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
        setError("Please fill in all required fields")
        return
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(customerInfo.email)) {
        setError("Please enter a valid email address")
        return
      }
    }

    setCurrentStep((prev) => prev + 1)
  }

  const handlePreviousStep = () => {
    setCurrentStep((prev) => prev - 1)
    setError("")
  }

  const handlePaymentSuccess = (reference: string) => {
    console.log("Payment successful with reference:", reference)
    setShowPayment(false)
    setBookingComplete(true)
  }

  const handlePaymentError = (error: string) => {
    console.error("Payment error:", error)
    setError(error)
    setShowPayment(false)
  }

  const handleBookingSubmit = () => {
    setShowPayment(true)
  }

  const getMinDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split("T")[0]
  }

  if (bookingComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
            <p className="text-gray-600 mb-4">
              Your appointment has been successfully booked and your deposit has been processed.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              You will receive a confirmation email shortly with all the details.
            </p>
            <Button onClick={() => (window.location.href = "/")} className="w-full bg-pink-600 hover:bg-pink-700">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Book Your Appointment</h1>
          <p className="text-gray-600">Follow the steps below to schedule your beauty session</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step ? "bg-pink-600 text-white" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step}
                </div>
                {step < 4 && <div className={`w-12 h-0.5 ${currentStep > step ? "bg-pink-600" : "bg-gray-200"}`} />}
              </div>
            ))}
          </div>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {currentStep === 1 && (
                <>
                  <CreditCard className="w-5 h-5" /> Select Services
                </>
              )}
              {currentStep === 2 && (
                <>
                  <Calendar className="w-5 h-5" /> Choose Date & Time
                </>
              )}
              {currentStep === 3 && (
                <>
                  <User className="w-5 h-5" /> Your Information
                </>
              )}
              {currentStep === 4 && (
                <>
                  <CheckCircle className="w-5 h-5" /> Confirm & Pay
                </>
              )}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-700">{error}</span>
              </div>
            )}

            {/* Step 1: Service Selection */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <p className="text-gray-600">Select the services you'd like to book:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedServices.includes(service.id)
                          ? "border-pink-500 bg-pink-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => handleServiceToggle(service.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">{service.name}</h3>
                          <p className="text-sm text-gray-600">{service.duration}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-pink-600">₦{service.price.toLocaleString()}</p>
                          {selectedServices.includes(service.id) && (
                            <Badge className="mt-1 bg-pink-600">Selected</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {selectedServices.length > 0 && (
                  <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                    <p className="font-semibold text-pink-800">Total: ₦{totalAmount.toLocaleString()}</p>
                    <p className="text-sm text-pink-600">Deposit required: ₦{depositAmount.toLocaleString()} (50%)</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Date & Time Selection */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="date">Select Date</Label>
                  <Input
                    id="date"
                    type="date"
                    min={getMinDate()}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="time">Select Time</Label>
                  <Select value={selectedTime} onValueChange={setSelectedTime}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Choose a time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 3: Customer Information */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo((prev) => ({ ...prev, name: e.target.value }))}
                    className="mt-1"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo((prev) => ({ ...prev, email: e.target.value }))}
                    className="mt-1"
                    placeholder="Enter your email address"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo((prev) => ({ ...prev, phone: e.target.value }))}
                    className="mt-1"
                    placeholder="Enter your phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Special Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={customerInfo.notes}
                    onChange={(e) => setCustomerInfo((prev) => ({ ...prev, notes: e.target.value }))}
                    className="mt-1"
                    placeholder="Any special requests or notes..."
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Step 4: Confirmation */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Booking Summary</h3>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Services:</span>
                      <span className="font-medium">
                        {selectedServices.map((id) => services.find((s) => s.id === id)?.name).join(", ")}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">
                        {new Date(selectedDate + "T12:00:00Z").toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-medium">{selectedTime}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Client:</span>
                      <span className="font-medium">{customerInfo.name}</span>
                    </div>

                    <div className="border-t pt-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Amount:</span>
                        <span className="font-medium">₦{totalAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold text-pink-600">
                        <span>Deposit Required:</span>
                        <span>₦{depositAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Balance Due at Appointment:</span>
                        <span>₦{(totalAmount - depositAmount).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleBookingSubmit}
                  disabled={isLoading}
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 text-lg font-semibold"
                >
                  {isLoading ? "Processing..." : `Pay Deposit - ₦${depositAmount.toLocaleString()}`}
                </Button>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              {currentStep > 1 && (
                <Button variant="outline" onClick={handlePreviousStep} disabled={isLoading}>
                  Previous
                </Button>
              )}

              {currentStep < 4 && (
                <Button onClick={handleNextStep} disabled={isLoading} className="ml-auto bg-pink-600 hover:bg-pink-700">
                  Next
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Modal */}
        {showPayment && (
          <PaystackPayment
            bookingData={{
              customerName: customerInfo.name,
              customerEmail: customerInfo.email,
              customerPhone: customerInfo.phone,
              services: selectedServices.map((id) => services.find((s) => s.id === id)?.name || ""),
              date: selectedDate,
              time: selectedTime,
              totalAmount,
              depositAmount,
              notes: customerInfo.notes,
            }}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            onClose={() => setShowPayment(false)}
          />
        )}
      </div>
    </div>
  )
}
