"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User, CreditCard, CheckCircle, XCircle } from "lucide-react"
import PaystackPayment from "@/components/paystack-payment"

const services = [
  { name: "Classic Lashes", price: 15000, deposit: 5000 },
  { name: "Volume Lashes", price: 20000, deposit: 7000 },
  { name: "Hybrid Lashes", price: 18000, deposit: 6000 },
  { name: "Lash Refill", price: 8000, deposit: 3000 },
  { name: "Brow Lamination", price: 12000, deposit: 4000 },
  { name: "Brow Tinting", price: 8000, deposit: 3000 },
  { name: "Brow Shaping", price: 6000, deposit: 2000 },
]

const timeSlots = ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"]

function BookingContent() {
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    email: "",
    notes: "",
  })
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "success" | "error">("idle")
  const [statusMessage, setStatusMessage] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)

  // Handle payment verification on page load
  useEffect(() => {
    const verifyReference = searchParams.get("verify")
    const error = searchParams.get("error")

    if (verifyReference) {
      verifyPayment(verifyReference)
    } else if (error) {
      setPaymentStatus("error")
      setStatusMessage(error === "payment_failed" ? "Payment was cancelled or failed" : "Payment verification failed")
    }
  }, [searchParams])

  const verifyPayment = async (reference: string) => {
    setIsVerifying(true)
    try {
      console.log("🔍 Verifying payment:", reference)

      const response = await fetch("/api/payments/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reference }),
      })

      const result = await response.json()

      console.log("📊 Verification result:", result)

      if (result.status) {
        setPaymentStatus("success")
        setStatusMessage("Payment successful! Your booking has been confirmed.")

        // Clear stored data
        sessionStorage.removeItem("paystack_reference")
        sessionStorage.removeItem("booking_data")

        // Reset form
        setCurrentStep(1)
        setSelectedServices([])
        setSelectedDate("")
        setSelectedTime("")
        setCustomerInfo({ name: "", phone: "", email: "", notes: "" })
      } else {
        setPaymentStatus("error")
        setStatusMessage(result.message || "Payment verification failed")
      }
    } catch (error) {
      console.error("💥 Verification error:", error)
      setPaymentStatus("error")
      setStatusMessage("Failed to verify payment. Please contact support.")
    } finally {
      setIsVerifying(false)
    }
  }

  const calculateTotal = () => {
    return selectedServices.reduce((total, serviceName) => {
      const service = services.find((s) => s.name === serviceName)
      return total + (service?.price || 0)
    }, 0)
  }

  const calculateDeposit = () => {
    return selectedServices.reduce((total, serviceName) => {
      const service = services.find((s) => s.name === serviceName)
      return total + (service?.deposit || 0)
    }, 0)
  }

  const handleServiceToggle = (serviceName: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceName) ? prev.filter((s) => s !== serviceName) : [...prev, serviceName],
    )
  }

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canProceedFromStep1 = selectedServices.length > 0
  const canProceedFromStep2 = selectedDate && selectedTime
  const canProceedFromStep3 = customerInfo.name && customerInfo.phone && customerInfo.email

  const handlePaymentSuccess = (data: any) => {
    setPaymentStatus("success")
    setStatusMessage("Payment successful! Your booking has been confirmed.")
  }

  const handlePaymentError = (error: string) => {
    setPaymentStatus("error")
    setStatusMessage(error)
  }

  // Show verification loading
  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Verifying Payment</h2>
            <p className="text-gray-600 text-center">Please wait while we confirm your payment...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show payment status
  if (paymentStatus !== "idle") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            {paymentStatus === "success" ? (
              <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            ) : (
              <XCircle className="h-16 w-16 text-red-500 mb-4" />
            )}
            <h2
              className={`text-xl font-semibold mb-2 ${paymentStatus === "success" ? "text-green-700" : "text-red-700"}`}
            >
              {paymentStatus === "success" ? "Booking Confirmed!" : "Payment Failed"}
            </h2>
            <p className="text-gray-600 text-center mb-6">{statusMessage}</p>
            <Button
              onClick={() => {
                setPaymentStatus("idle")
                setStatusMessage("")
                setCurrentStep(1)
              }}
              className="w-full"
            >
              {paymentStatus === "success" ? "Book Another Appointment" : "Try Again"}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Book Your Appointment</h1>
          <p className="text-gray-600">Transform your look with our premium lash and brow services</p>
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

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {currentStep === 1 && (
                <>
                  <Calendar className="h-5 w-5" /> Select Services
                </>
              )}
              {currentStep === 2 && (
                <>
                  <Clock className="h-5 w-5" /> Choose Date & Time
                </>
              )}
              {currentStep === 3 && (
                <>
                  <User className="h-5 w-5" /> Your Information
                </>
              )}
              {currentStep === 4 && (
                <>
                  <CreditCard className="h-5 w-5" /> Payment
                </>
              )}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "Choose the services you'd like to book"}
              {currentStep === 2 && "Select your preferred date and time"}
              {currentStep === 3 && "Please provide your contact information"}
              {currentStep === 4 && "Secure your booking with a deposit"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step 1: Service Selection */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {services.map((service) => (
                    <div
                      key={service.name}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedServices.includes(service.name)
                          ? "border-pink-500 bg-pink-50"
                          : "border-gray-200 hover:border-pink-300"
                      }`}
                      onClick={() => handleServiceToggle(service.name)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{service.name}</h3>
                          <p className="text-sm text-gray-600">₦{service.price.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">Deposit: ₦{service.deposit.toLocaleString()}</p>
                        </div>
                        {selectedServices.includes(service.name) && (
                          <Badge variant="secondary" className="bg-pink-100 text-pink-700">
                            Selected
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {selectedServices.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Selected Services:</h4>
                    <div className="space-y-1">
                      {selectedServices.map((serviceName) => {
                        const service = services.find((s) => s.name === serviceName)
                        return (
                          <div key={serviceName} className="flex justify-between text-sm">
                            <span>{serviceName}</span>
                            <span>₦{service?.price.toLocaleString()}</span>
                          </div>
                        )
                      })}
                      <div className="border-t pt-2 flex justify-between font-semibold">
                        <span>Total:</span>
                        <span>₦{calculateTotal().toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm text-pink-600">
                        <span>Deposit Required:</span>
                        <span>₦{calculateDeposit().toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Date & Time Selection */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="date">Preferred Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Preferred Time</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {timeSlots.map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedTime(time)}
                        className={selectedTime === time ? "bg-pink-600 hover:bg-pink-700" : ""}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>

                {selectedDate && selectedTime && (
                  <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                    <h4 className="font-semibold text-pink-800 mb-2">Appointment Summary</h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        <strong>Services:</strong> {selectedServices.join(", ")}
                      </p>
                      <p>
                        <strong>Date:</strong>{" "}
                        {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <p>
                        <strong>Time:</strong> {selectedTime}
                      </p>
                      <p>
                        <strong>Total:</strong> ₦{calculateTotal().toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Customer Information */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter your full name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="Enter your phone number"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email address"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Special Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={customerInfo.notes}
                    onChange={(e) => setCustomerInfo((prev) => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any special requests or notes for your appointment"
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Step 4: Payment */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-3">Booking Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Customer:</span>
                      <span>{customerInfo.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Email:</span>
                      <span>{customerInfo.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Phone:</span>
                      <span>{customerInfo.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Services:</span>
                      <span>{selectedServices.join(", ")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date & Time:</span>
                      <span>
                        {new Date(selectedDate + "T12:00:00").toLocaleDateString()} at {selectedTime}
                      </span>
                    </div>
                  </div>
                </div>

                <PaystackPayment
                  bookingData={{
                    customerName: customerInfo.name,
                    customerPhone: customerInfo.phone,
                    customerEmail: customerInfo.email,
                    services: selectedServices,
                    bookingDate: selectedDate,
                    bookingTime: selectedTime,
                    totalAmount: calculateTotal(),
                    depositAmount: calculateDeposit(),
                    notes: customerInfo.notes,
                  }}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
                Back
              </Button>

              {currentStep < 4 && (
                <Button
                  onClick={handleNext}
                  disabled={
                    (currentStep === 1 && !canProceedFromStep1) ||
                    (currentStep === 2 && !canProceedFromStep2) ||
                    (currentStep === 3 && !canProceedFromStep3)
                  }
                  className="bg-pink-600 hover:bg-pink-700"
                >
                  Next
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function BookPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
        </div>
      }
    >
      <BookingContent />
    </Suspense>
  )
}
