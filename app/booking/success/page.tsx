"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Calendar, Clock, CreditCard, Home, MessageSquare, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"

interface BookingDetails {
  id: string
  reference: string
  customer_name: string
  service: string
  date: string
  time: string
  amount: number
  deposit: number
}

export default function BookingSuccessPage() {
  const searchParams = useSearchParams()
  const reference = searchParams.get("reference")
  const [booking, setBooking] = useState<BookingDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!reference) {
      setError("No payment reference found")
      setLoading(false)
      return
    }

    const verifyPayment = async () => {
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

        if (result.status === "ok" && result.success) {
          setBooking(result.booking)
        } else {
          setError(result.message || "Payment verification failed")
        }
      } catch (error) {
        console.error("❌ Verification error:", error)
        setError("Failed to verify payment")
      } finally {
        setLoading(false)
      }
    }

    verifyPayment()
  }, [reference])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="w-12 h-12 text-green-500 animate-spin mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Verifying Payment</h2>
            <p className="text-gray-600 dark:text-gray-300 text-center">Please wait while we confirm your booking...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-rose-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Verification Failed</h2>
            <p className="text-gray-600 dark:text-gray-300 text-center mb-4">{error}</p>
            <div className="flex space-x-3">
              <Link href="/book">
                <Button variant="outline">Try Again</Button>
              </Link>
              <Link href="/">
                <Button>Go Home</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <AlertCircle className="w-12 h-12 text-yellow-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Booking Not Found</h2>
            <p className="text-gray-600 dark:text-gray-300 text-center mb-4">
              We couldn't find your booking details. Please contact us for assistance.
            </p>
            <div className="flex space-x-3">
              <Link href="/contact">
                <Button variant="outline">Contact Us</Button>
              </Link>
              <Link href="/">
                <Button>Go Home</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">Payment Successful!</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">Your booking has been confirmed</p>
        </div>

        {/* Booking Details Card */}
        <Card className="border-green-200 dark:border-green-700 mb-8">
          <CardHeader className="bg-green-50 dark:bg-green-900/20">
            <CardTitle className="text-2xl text-gray-800 dark:text-gray-100 flex items-center space-x-2">
              <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
              <span>Booking Confirmation</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Customer Name</label>
                  <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">{booking.customer_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Service</label>
                  <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">{booking.service}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Reference</label>
                  <p className="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {booking.reference}
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Date</label>
                    <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                      {new Date(booking.date + "T12:00:00Z").toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Time</label>
                    <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">{booking.time}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5 text-gray-500" />
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Deposit Paid</label>
                    <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                      ₦{booking.deposit.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="border-t pt-4 mt-6">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 dark:text-gray-300">Total Service Cost:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-100">
                    ₦{booking.amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 dark:text-gray-300">Deposit Paid:</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    ₦{booking.deposit.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
                  <span className="text-gray-800 dark:text-gray-100">Balance Due at Appointment:</span>
                  <span className="text-gray-800 dark:text-gray-100">
                    ₦{(booking.amount - booking.deposit).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Information */}
        <Card className="border-blue-200 dark:border-blue-700 mb-8">
          <CardHeader className="bg-blue-50 dark:bg-blue-900/20">
            <CardTitle className="text-xl text-gray-800 dark:text-gray-100">📋 Important Information</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <div className="flex items-start space-x-2">
                <span className="text-blue-500 font-bold">•</span>
                <p>
                  <strong>Confirmation Email:</strong> You will receive a detailed confirmation email shortly with all
                  appointment details.
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-blue-500 font-bold">•</span>
                <p>
                  <strong>Arrival Time:</strong> Please arrive 10 minutes early for your appointment.
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-blue-500 font-bold">•</span>
                <p>
                  <strong>Preparation:</strong> Please come with a clean face (no makeup) for the best results.
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-blue-500 font-bold">•</span>
                <p>
                  <strong>Duration:</strong> Your appointment will take approximately 2-3 hours.
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-blue-500 font-bold">•</span>
                <p>
                  <strong>Balance Payment:</strong> The remaining balance of ₦
                  {(booking.amount - booking.deposit).toLocaleString()} is due at your appointment.
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-blue-500 font-bold">•</span>
                <p>
                  <strong>Rescheduling:</strong> You can reschedule once with 24 hours advance notice.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button size="lg" className="w-full sm:w-auto bg-pink-600 hover:bg-pink-700 text-white">
              <Home className="w-5 h-5 mr-2" />
              Back to Home
            </Button>
          </Link>
          <a href="https://wa.me/2348165435528" target="_blank" rel="noopener noreferrer">
            <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
              <MessageSquare className="w-5 h-5 mr-2" />
              Contact Us on WhatsApp
            </Button>
          </a>
        </div>

        {/* Footer Message */}
        <div className="text-center mt-8 p-4 bg-white dark:bg-gray-800 rounded-lg border">
          <p className="text-gray-600 dark:text-gray-300">
            Thank you for choosing <strong className="text-pink-600 dark:text-pink-400">Lashed by Deedee</strong>! We
            look forward to seeing you soon. ✨
          </p>
        </div>
      </div>
    </div>
  )
}
