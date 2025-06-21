"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, CreditCard, Loader2 } from "lucide-react"

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
      setup: (config: any) => {
        openIframe: () => void
      }
    }
  }
}

export default function PaystackPayment({ bookingData, onSuccess, onError, onClose }: PaystackPaymentProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [scriptLoaded, setScriptLoaded] = useState(false)

  useEffect(() => {
    // Load Paystack script
    const script = document.createElement("script")
    script.src = "https://js.paystack.co/v1/inline.js"
    script.async = true
    script.onload = () => setScriptLoaded(true)
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const handlePayment = async () => {
    if (!scriptLoaded) {
      onError("Payment system not ready. Please try again.")
      return
    }

    setIsLoading(true)

    try {
      // Initialize payment with backend
      const response = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to initialize payment")
      }

      // Configure Paystack popup - NO CRYPTO CHANNELS
      const handler = window.PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email: bookingData.customerEmail,
        amount: bookingData.depositAmount * 100, // Convert to kobo
        currency: "NGN",
        ref: data.reference,
        channels: ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"], // Removed crypto
        metadata: {
          custom_fields: [
            {
              display_name: "Customer Name",
              variable_name: "customer_name",
              value: bookingData.customerName,
            },
            {
              display_name: "Services",
              variable_name: "services",
              value: bookingData.services.join(", "),
            },
            {
              display_name: "Appointment Date",
              variable_name: "appointment_date",
              value: bookingData.date,
            },
            {
              display_name: "Appointment Time",
              variable_name: "appointment_time",
              value: bookingData.time,
            },
          ],
        },
        onClose: () => {
          setIsLoading(false)
          onClose()
        },
        callback: (response: any) => {
          setIsLoading(false)
          if (response.status === "success") {
            onSuccess(response.reference)
          } else {
            onError("Payment was not completed")
          }
        },
      })

      handler.openIframe()
    } catch (error) {
      setIsLoading(false)
      onError(error instanceof Error ? error.message : "Payment initialization failed")
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">Complete Payment</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Booking Summary</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <strong>Customer:</strong> {bookingData.customerName}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <strong>Services:</strong> {bookingData.services.join(", ")}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <strong>Date:</strong> {new Date(bookingData.date).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <strong>Time:</strong> {bookingData.time}
            </p>
            <div className="border-t pt-2 mt-2">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <strong>Total Amount:</strong> ₦{bookingData.totalAmount.toLocaleString()}
              </p>
              <p className="text-lg font-bold text-green-600">
                <strong>Deposit (50%):</strong> ₦{bookingData.depositAmount.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-300 mb-2">
              <CreditCard className="w-5 h-5" />
              <span className="font-medium">Secure Payment</span>
            </div>
            <p className="text-sm text-blue-600 dark:text-blue-400">Your payment is secured by Paystack. We accept:</p>
            <ul className="text-sm text-blue-600 dark:text-blue-400 mt-1">
              <li>• Debit/Credit Cards (Visa, Mastercard, Verve)</li>
              <li>• Bank Transfer</li>
              <li>• USSD</li>
              <li>• Mobile Money</li>
            </ul>
          </div>

          <Button
            onClick={handlePayment}
            disabled={isLoading || !scriptLoaded}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Pay ₦{bookingData.depositAmount.toLocaleString()} Deposit
              </>
            )}
          </Button>

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            By proceeding, you agree to our booking policies. This deposit is non-refundable.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
