"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { generatePaymentReference } from "@/lib/paystack"

interface PaystackPaymentProps {
  bookingData: {
    customerName: string
    customerPhone: string
    customerEmail: string
    services: string[]
    bookingDate: string
    bookingTime: string
    totalAmount: number
    depositAmount: number
    notes?: string
  }
  onSuccess: (data: any) => void
  onError: (error: string) => void
}

export default function PaystackPayment({ bookingData, onSuccess, onError }: PaystackPaymentProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handlePayment = async () => {
    try {
      setIsLoading(true)

      // Generate unique payment reference
      const reference = generatePaymentReference()

      console.log("🚀 Initializing payment with data:", {
        reference,
        email: bookingData.customerEmail,
        amount: bookingData.depositAmount * 100, // Convert to kobo
        metadata: bookingData,
      })

      // Initialize payment with Paystack
      const response = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: bookingData.customerEmail,
          amount: bookingData.depositAmount * 100, // Convert to kobo
          reference,
          metadata: {
            customerName: bookingData.customerName,
            customerPhone: bookingData.customerPhone,
            services: bookingData.services,
            bookingDate: bookingData.bookingDate,
            bookingTime: bookingData.bookingTime,
            totalAmount: bookingData.totalAmount,
            depositAmount: bookingData.depositAmount,
            notes: bookingData.notes,
          },
        }),
      })

      const result = await response.json()

      if (!result.status) {
        throw new Error(result.message || "Failed to initialize payment")
      }

      console.log("✅ Payment initialized successfully:", result.data)

      // Redirect to Paystack payment page
      if (result.data?.authorization_url) {
        // Store payment reference for verification
        sessionStorage.setItem("paystack_reference", reference)
        sessionStorage.setItem("booking_data", JSON.stringify(bookingData))

        window.location.href = result.data.authorization_url
      } else {
        throw new Error("No payment URL received")
      }
    } catch (error) {
      console.error("❌ Payment initialization failed:", error)
      onError(error instanceof Error ? error.message : "Payment initialization failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
        <h3 className="font-semibold text-pink-800 mb-2">Payment Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Services:</span>
            <span>{bookingData.services.join(", ")}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Amount:</span>
            <span>₦{bookingData.totalAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Deposit Required:</span>
            <span>₦{bookingData.depositAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Balance Due at Appointment:</span>
            <span>₦{(bookingData.totalAmount - bookingData.depositAmount).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <Button onClick={handlePayment} disabled={isLoading} className="w-full bg-pink-600 hover:bg-pink-700" size="lg">
        {isLoading ? "Processing..." : `Pay Deposit - ₦${bookingData.depositAmount.toLocaleString()}`}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        Secure payment powered by Paystack. Your payment information is encrypted and secure.
      </p>
    </div>
  )
}
