"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface PaystackPaymentProps {
  email: string
  amount: number
  metadata: {
    client_name: string
    phone: string
    email: string
    service: string | string[]
    booking_date: string
    booking_time: string
    notes?: string
  }
  onSuccess: (reference: string) => void
  onError: (error: string) => void
  disabled?: boolean
  children?: React.ReactNode
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

export default function PaystackPayment({
  email,
  amount,
  metadata,
  onSuccess,
  onError,
  disabled = false,
  children,
}: PaystackPaymentProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handlePayment = async () => {
    console.log("💳 Payment initiated")
    setIsLoading(true)

    try {
      // Initialize payment
      console.log("🚀 Initializing payment...")
      const initResponse = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          amount,
          metadata,
        }),
      })

      const initData = await initResponse.json()
      console.log("📋 Initialization response:", initData)

      if (!initData.success) {
        console.error("❌ Payment initialization failed:", initData.message)
        onError(initData.message || "Payment initialization failed")
        setIsLoading(false)
        return
      }

      const { authorization_url, reference, access_code } = initData.data

      console.log("✅ Payment initialized:", { reference, access_code })

      // Load Paystack script if not already loaded
      if (!window.PaystackPop) {
        console.log("📦 Loading Paystack script...")
        const script = document.createElement("script")
        script.src = "https://js.paystack.co/v1/inline.js"
        script.onload = () => {
          console.log("✅ Paystack script loaded")
          openPaystackPopup(reference, access_code)
        }
        script.onerror = () => {
          console.error("❌ Failed to load Paystack script")
          onError("Failed to load payment system")
          setIsLoading(false)
        }
        document.head.appendChild(script)
      } else {
        openPaystackPopup(reference, access_code)
      }
    } catch (error) {
      console.error("❌ Payment error:", error)
      onError("Payment initialization failed")
      setIsLoading(false)
    }
  }

  const openPaystackPopup = (reference: string, access_code: string) => {
    console.log("🔓 Opening Paystack popup...")

    const handler = window.PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      email: email,
      amount: amount * 100, // Convert to kobo
      ref: reference,
      metadata: metadata,
      callback: (response: any) => {
        console.log("✅ Payment callback received:", response)

        if (response.status === "success") {
          console.log("✅ Payment successful, verifying...")
          verifyPayment(response.reference)
        } else {
          console.error("❌ Payment failed in callback:", response)
          onError("Payment was not completed successfully")
          setIsLoading(false)
        }
      },
      onClose: () => {
        console.log("🔒 Payment popup closed")
        setIsLoading(false)
      },
    })

    handler.openIframe()
  }

  const verifyPayment = async (reference: string) => {
    console.log("🔍 Verifying payment:", reference)

    try {
      const verifyResponse = await fetch("/api/payments/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reference }),
      })

      const verifyData = await verifyResponse.json()
      console.log("📋 Verification response:", verifyData)

      if (verifyData.success && verifyData.status) {
        console.log("✅ Payment verified successfully")
        onSuccess(reference)
      } else {
        console.error("❌ Payment verification failed:", verifyData.message)
        onError(verifyData.message || "Payment verification failed")
      }
    } catch (error) {
      console.error("❌ Verification error:", error)
      onError("Payment verification failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handlePayment}
      disabled={disabled || isLoading}
      className="w-full bg-pink-600 hover:bg-pink-700 text-white"
    >
      {isLoading ? "Processing..." : children || `Pay ₦${amount.toLocaleString()}`}
    </Button>
  )
}
