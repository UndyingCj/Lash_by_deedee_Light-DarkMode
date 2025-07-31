"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, CreditCard, Shield, AlertCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PaystackPaymentProps {
  bookingData: {
    customerName: string
    customerEmail: string
    customerPhone: string
    services: string[] // This matches what's passed from the booking page
    date: string // This matches what's passed from the booking page
    time: string // This matches what's passed from the booking page
    totalAmount: number
    depositAmount: number
    notes?: string
  }
  onSuccess: (reference: string) => void
  onError: (error: string) => void
  onClose: () => void
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    PaystackPop: {
      setup: (config: any) => {
        openIframe: () => void
      }
    }
  }
}

export default function PaystackPayment({ bookingData, onSuccess, onError, onClose }: PaystackPaymentProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handlePayment = async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log("🚀 Initializing payment for:", bookingData.customerName)

      // Validate booking data before sending
      if (!bookingData.customerName?.trim()) {
        throw new Error("Customer name is required")
      }

      if (!bookingData.customerEmail?.trim() || !bookingData.customerEmail.includes("@")) {
        throw new Error("Valid customer email is required")
      }

      if (!bookingData.services || bookingData.services.length === 0) {
        throw new Error("At least one service must be selected")
      }

      if (!bookingData.date || !/^\d{4}-\d{2}-\d{2}$/.test(bookingData.date)) {
        throw new Error("Valid booking date is required")
      }

      if (!bookingData.time?.trim()) {
        throw new Error("Booking time is required")
      }

      if (!bookingData.totalAmount || bookingData.totalAmount <= 0) {
        throw new Error("Valid total amount is required")
      }

      if (!bookingData.depositAmount || bookingData.depositAmount <= 0) {
        throw new Error("Valid deposit amount is required")
      }

      // Prepare clean request data with correct field names
      const requestData = {
        customerName: bookingData.customerName.trim(),
        customerEmail: bookingData.customerEmail.trim().toLowerCase(),
        customerPhone: bookingData.customerPhone?.trim() || "",
        services: bookingData.services,
        date: bookingData.date.trim(),
        time: bookingData.time.trim(),
        totalAmount: Number(bookingData.totalAmount),
        depositAmount: Number(bookingData.depositAmount),
        notes: bookingData.notes?.trim() || "",
      }

      console.log("📤 Sending payment initialization request:", requestData)

      const response = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      })

      const responseText = await response.text()
      console.log("📥 Raw response:", responseText)

      let result
      try {
        result = JSON.parse(responseText)
      } catch (parseError) {
        console.error("❌ Failed to parse response:", parseError)
        throw new Error("Invalid response from server")
      }

      if (!response.ok) {
        console.error("❌ HTTP error:", response.status, result)
        throw new Error(result.message || result.error || `HTTP ${response.status}`)
      }

      if (!result.status) {
        console.error("❌ Payment initialization failed:", result.message)
        throw new Error(result.message || result.error || "Payment initialization failed")
      }

      if (!result.data) {
        console.error("❌ No payment data received:", result)
        throw new Error("No payment data received from server")
      }

      if (!result.data.public_key) {
        console.error("❌ No public key received:", result.data)
        throw new Error("Payment configuration error - missing public key")
      }

      console.log("✅ Payment initialized:", result.data.reference)

      // Load Paystack script if not already loaded
      if (!window.PaystackPop) {
        const script = document.createElement("script")
        script.src = "https://js.paystack.co/v1/inline.js"
        script.async = true
        document.head.appendChild(script)

        await new Promise((resolve, reject) => {
          script.onload = resolve
          script.onerror = reject
        })
      }

      console.log("💳 Opening Paystack payment modal")

      const handler = window.PaystackPop.setup({
        key: result.data.public_key,
        email: bookingData.customerEmail,
        amount: result.data.amount,
        currency: "NGN",
        ref: result.data.reference,
        metadata: {
          customerName: bookingData.customerName,
          customerPhone: bookingData.customerPhone,
          services: bookingData.services.join(", "),
          bookingDate: bookingData.date,
          bookingTime: bookingData.time,
        },
        callback: (response: any) => {
          console.log("💰 Payment callback received:", response)
          verifyPayment(response.reference)
        },
        onClose: () => {
          console.log("❌ Payment modal closed")
          setIsLoading(false)
          setError("Payment was cancelled by user")
          toast({
            title: "Payment Cancelled",
            description: "You cancelled the payment process",
            variant: "destructive",
          })
        },
      })

      handler.openIframe()
    } catch (error) {
      console.error("❌ Payment initialization error:", error)
      const errorMessage = error instanceof Error ? error.message : "Payment initialization failed"
      setError(errorMessage)
      setIsLoading(false)
      toast({
        title: "Payment Error",
        description: errorMessage,
        variant: "destructive",
      })
      onError(errorMessage)
    }
  }

  const verifyPayment = async (reference: string) => {
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
      console.log("📊 Payment verification result:", result)

      // Check if result.status is true (boolean)
      if (result.status === true) {
        console.log("✅ Payment verified successfully")
        toast({
          title: "Payment Successful!",
          description: "Your booking has been confirmed. Check your email for details.",
        })
        onSuccess(reference)
      } else {
        throw new Error(result.message || "Payment verification failed")
      }
    } catch (error) {
      console.error("❌ Payment verification error:", error)
      const errorMessage = error instanceof Error ? error.message : "Payment verification failed"
      setError(errorMessage)
      toast({
        title: "Verification Failed",
        description: errorMessage,
        variant: "destructive",
      })
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
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0" disabled={isLoading}>
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
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay ₦${bookingData.depositAmount.toLocaleString()} Now`
            )}
          </Button>

          {/* Retry Button */}
          {error && (
            <Button onClick={handlePayment} variant="outline" className="w-full bg-transparent" disabled={isLoading}>
              Retry Payment
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
