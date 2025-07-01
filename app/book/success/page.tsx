"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Calendar, Mail, Phone } from "lucide-react"
import Link from "next/link"

export default function BookingSuccess() {
  const searchParams = useSearchParams()
  const [isVerifying, setIsVerifying] = useState(true)
  const [paymentVerified, setPaymentVerified] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const reference = searchParams.get("reference")

    if (reference) {
      verifyPayment(reference)
    } else {
      setIsVerifying(false)
      setError("No payment reference found")
    }
  }, [searchParams])

  const verifyPayment = async (reference: string) => {
    try {
      const response = await fetch("/api/payments/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reference }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setPaymentVerified(true)
      } else {
        setError(data.error || "Payment verification failed")
      }
    } catch (error) {
      console.error("Payment verification error:", error)
      setError("Failed to verify payment")
    } finally {
      setIsVerifying(false)
    }
  }

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-100">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mb-4"></div>
            <p>Verifying your payment...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-100">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Payment Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/book">Try Again</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">Booking Confirmed!</CardTitle>
          <CardDescription className="text-lg">
            Your payment has been processed successfully and your appointment is confirmed.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">What happens next?</h3>
            <ul className="space-y-2 text-green-700">
              <li className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                You'll receive a confirmation email shortly
              </li>
              <li className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />A calendar invite will be sent to you
              </li>
              <li className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                We'll send you a reminder 24 hours before your appointment
              </li>
            </ul>
          </div>

          <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
            <h3 className="font-semibold text-pink-800 mb-2">Important Notes:</h3>
            <ul className="space-y-1 text-pink-700 text-sm">
              <li>• Please arrive 10 minutes early for your appointment</li>
              <li>• Bring a valid ID for verification</li>
              <li>• If you need to reschedule, contact us at least 24 hours in advance</li>
              <li>• Your deposit is non-refundable but can be transferred to a new date</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild className="flex-1">
              <Link href="/">Return Home</Link>
            </Button>
            <Button variant="outline" asChild className="flex-1 bg-transparent">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
