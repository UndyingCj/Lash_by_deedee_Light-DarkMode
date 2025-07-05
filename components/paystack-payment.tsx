"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, CreditCard, Shield, AlertCircle } from "lucide-react"

interface PaystackPaymentProps {
  bookingData: {
    customerName: string
    customerEmail: string
    customerPhone: string
    services: string[]
    date: string
    time: string
    totalAmount: number
    depositAmount: number
    notes?: string
  }
  onSuccess: (reference: string) => void
  onError: (error: string) => void
  onClose: () => void
}

declare global {
  interface Window {
    PaystackPop: {
      setup: (options: any) => {
        openIframe: () => void
      }
    }
  }
}

export default function PaystackPayment({ bookingData, onSuccess, onError, onClose }: PaystackPaymentProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [paymentData, setPaymentData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  // Load Paystack script
  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://js.paystack.co/v1/inline.js"
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  // Initialize payment when component mounts
  useEffect(() => {
    initializePayment()
  }, [])

  const initializePayment = async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log("🚀 Initializing payment for:", bookingData.customerName)

      const response = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName: bookingData.customerName,
          customerEmail: bookingData.customerEmail,
          customerPhone: bookingData.customerPhone,
          services: bookingData.services,
          bookingDate: bookingData.date,
          bookingTime: bookingData.time,
          totalAmount: bookingData.totalAmount,
          depositAmount: bookingData.depositAmount,
          notes: bookingData.notes,
        }),
      })

      const result = await response.json()

      if (!result.status) {
        throw new Error(result.message || "Payment initialization failed")
      }

      console.log("✅ Payment initialized:", result.data.reference)
      setPaymentData(result.data)
    } catch (error) {
      console.error("❌ Payment initialization error:", error)
      const errorMessage = error instanceof Error ? error.message : "Payment initialization failed"
      setError(errorMessage)
      onError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePayment = () => {
    if (!paymentData || !window.PaystackPop) {
      setError("Payment system not ready. Please try again.")
      return
    }

    try {
      console.log("💳 Opening Paystack payment modal")

      const handler = window.PaystackPop.setup({
        key: paymentData.public_key || process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email: bookingData.customerEmail,
        amount: paymentData.amount,
        currency: "NGN",
        ref: paymentData.reference,
        metadata: {
          customerName: bookingData.customerName,
          customerPhone: bookingData.customerPhone,
          services: bookingData.services,
          bookingDate: bookingData.date,
          bookingTime: bookingData.time,
        },
        callback: async (response: any) => {
          console.log("💰 Payment callback:", response)
          await verifyPayment(response.reference)
        },
        onClose: () => {
          console.log("❌ Payment modal closed")
          setError("Payment was cancelled")
        },
      })

      handler.openIframe()
    } catch (error) {
      console.error("❌ Payment modal error:", error)
      setError("Failed to open payment modal")
    }
  }

  const verifyPayment = async (reference: string) => {
    try {
      setIsLoading(true)
      console.log("🔍 Verifying payment:", reference)

      const response = await fetch("/api/payments/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reference }),
      })

      const result = await response.json()

      if (!result.status) {
        throw new Error(result.message || "Payment verification failed")
      }

      console.log("✅ Payment verified successfully")
      onSuccess(reference)
    } catch (error) {
      console.error("❌ Payment verification error:", error)
      const errorMessage = error instanceof Error ? error.message : "Payment verification failed"
      setError(errorMessage)
      onError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white dark:bg-gray-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl text-gray-800 dark:text-gray-100 flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-pink-500" />
            <span>Secure Payment</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Booking Summary */}
          <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg border dark:border-pink-800">
            <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Booking Summary</h4>
            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
              <p>
                <strong>Customer:</strong> {bookingData.customerName}
              </p>
              <p>
                <strong>Services:</strong> {bookingData.services.join(", ")}
              </p>
              <p>
                <strong>Date:</strong> {new Date(bookingData.date + "T12:00:00Z").toLocaleDateString()}
              </p>
              <p>
                <strong>Time:</strong> {bookingData.time}
              </p>
              <p>
                <strong>Total Amount:</strong> ₦{bookingData.totalAmount.toLocaleString()}
              </p>
              <p className="text-lg font-bold text-pink-600 dark:text-pink-400">
                <strong>Deposit (50%):</strong> ₦{bookingData.depositAmount.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Security Notice */}
          <div className="flex items-start space-x-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border dark:border-green-800">
            <Shield className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-green-700 dark:text-green-300">
              <p className="font-medium">Secure Payment</p>
              <p>Your payment is processed securely by Paystack. We never store your card details.</p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start space-x-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border dark:border-red-800">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-700 dark:text-red-300">
                <p className="font-medium">Payment Error</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Payment Button */}
          <Button
            onClick={handlePayment}
            disabled={isLoading || !paymentData || !!error}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            size="lg"
          >
            {isLoading ? "Processing..." : `Pay ₦${bookingData.depositAmount.toLocaleString()} Now`}
          </Button>

          {/* Retry Button */}
          {error && (
            <Button
              onClick={initializePayment}
              variant="outline"
              className="w-full bg-transparent"
              disabled={isLoading}
            >
              {isLoading ? "Retrying..." : "Retry Payment"}
            </Button>
          )}

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            By proceeding, you agree to our booking policies and terms of service.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
