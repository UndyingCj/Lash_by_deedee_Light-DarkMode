"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, CreditCard, Smartphone, QrCode, Building2, Shield, CheckCircle } from "lucide-react"
import { generatePaymentReference, convertToKobo } from "@/lib/paystack"

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
    PaystackPop: any
  }
}

export default function PaystackPayment({ bookingData, onSuccess, onError, onClose }: PaystackPaymentProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [paymentReference, setPaymentReference] = useState<string>("")
  const [scriptLoaded, setScriptLoaded] = useState(false)

  // Load Paystack script
  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://js.paystack.co/v1/inline.js"
    script.async = true
    script.onload = () => setScriptLoaded(true)
    script.onerror = () => {
      console.error("Failed to load Paystack script")
      onError("Failed to load payment system. Please try again.")
    }
    document.body.appendChild(script)

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [onError])

  const handlePayment = async () => {
    if (!scriptLoaded) {
      onError("Payment system is still loading. Please try again.")
      return
    }

    setIsLoading(true)
    const reference = generatePaymentReference()
    setPaymentReference(reference)

    try {
      console.log("🚀 Starting payment process with reference:", reference)

      // Initialize payment on our backend
      const initResponse = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: bookingData.customerEmail,
          amount: convertToKobo(bookingData.depositAmount),
          reference,
          metadata: {
            customerName: bookingData.customerName,
            customerPhone: bookingData.customerPhone,
            services: bookingData.services,
            bookingDate: bookingData.date,
            bookingTime: bookingData.time,
            totalAmount: bookingData.totalAmount,
            depositAmount: bookingData.depositAmount,
            notes: bookingData.notes,
          },
        }),
      })

      if (!initResponse.ok) {
        const errorData = await initResponse.json()
        throw new Error(errorData.message || "Failed to initialize payment")
      }

      const initData = await initResponse.json()

      if (!initData.status) {
        throw new Error(initData.message || "Failed to initialize payment")
      }

      console.log("✅ Payment initialized successfully")

      // Open Paystack popup
      const handler = window.PaystackPop.setup({
        key: "pk_live_edddbd4959b95ee7d1eebe12b71b68f8ce5ff0a7", // Use live key directly
        email: bookingData.customerEmail,
        amount: convertToKobo(bookingData.depositAmount),
        reference: reference,
        currency: "NGN",
        channels: ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"],
        metadata: {
          customerName: bookingData.customerName,
          customerPhone: bookingData.customerPhone,
          services: bookingData.services.join(", "),
          bookingDate: bookingData.date,
          bookingTime: bookingData.time,
        },
        callback: (response: any) => {
          console.log("💳 Payment callback received:", response)
          if (response.status === "success") {
            verifyPayment(response.reference)
          } else {
            console.error("❌ Payment callback failed:", response)
            onError("Payment was not completed successfully. Please try again.")
            setIsLoading(false)
          }
        },
        onClose: () => {
          console.log("🚪 Payment popup closed")
          setIsLoading(false)
        },
      })

      handler.openIframe()
    } catch (error) {
      console.error("❌ Payment initialization error:", error)
      onError(error instanceof Error ? error.message : "Failed to start payment process")
      setIsLoading(false)
    }
  }

  const verifyPayment = async (reference: string) => {
    try {
      console.log("🔍 Verifying payment:", reference)

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
        console.log("✅ Payment verification successful")
        onSuccess(reference)
      } else {
        console.error("❌ Payment verification failed:", verifyData.message)
        onError(verifyData.message || "Payment verification failed. Please contact support.")
      }
    } catch (error) {
      console.error("❌ Payment verification error:", error)
      onError("Failed to verify payment. Please contact support.")
    } finally {
      setIsLoading(false)
    }
  }

  const paymentMethods = [
    { icon: CreditCard, name: "Debit/Credit Cards", desc: "Visa, Mastercard, Verve" },
    { icon: Building2, name: "Bank Transfer", desc: "Direct bank transfer" },
    { icon: Smartphone, name: "USSD", desc: "Dial *737# or bank codes" },
    { icon: Smartphone, name: "Mobile Money", desc: "MTN, Airtel, 9mobile" },
    { icon: QrCode, name: "QR Code", desc: "Scan to pay" },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
          <CardTitle className="text-2xl text-center text-gray-800 pr-12">Secure Payment with Paystack</CardTitle>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <Shield className="w-4 h-4 text-green-600" />
            <span>256-bit SSL encrypted • PCI DSS compliant</span>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Booking Summary */}
          <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-4 border border-pink-200 dark:border-pink-800">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">Booking Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Client:</span>
                <span className="font-medium">{bookingData.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Services:</span>
                <span className="font-medium text-right">{bookingData.services.join(", ")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Date & Time:</span>
                <span className="font-medium">
                  {new Date(bookingData.date + "T12:00:00Z").toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}{" "}
                  at {bookingData.time}
                </span>
              </div>
              <div className="border-t border-pink-200 dark:border-pink-700 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Total Service Cost:</span>
                  <span className="font-medium">₦{bookingData.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-pink-600 dark:text-pink-400">
                  <span>Deposit Required (50%):</span>
                  <span>₦{bookingData.depositAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">Supported Payment Methods</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {paymentMethods.map((method, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <method.icon className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-medium text-sm">{method.name}</div>
                    <div className="text-xs text-gray-500">{method.desc}</div>
                  </div>
                  <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
                </div>
              ))}
            </div>
          </div>

          {/* Security Features */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              Security Features
            </h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Bank-level 256-bit SSL encryption</li>
              <li>• PCI DSS compliant payment processing</li>
              <li>• Real-time fraud detection</li>
              <li>• Secure tokenization of card details</li>
            </ul>
          </div>

          {/* Payment Button */}
          <div className="space-y-4">
            <Button
              onClick={handlePayment}
              disabled={isLoading || !scriptLoaded}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5" />
                  <span>Pay ₦{bookingData.depositAmount.toLocaleString()} Deposit</span>
                </div>
              )}
            </Button>

            <div className="text-center">
              <Button variant="outline" onClick={onClose} disabled={isLoading} className="text-gray-600 bg-transparent">
                Cancel Payment
              </Button>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-500 space-y-1">
            <p>Powered by Paystack • Trusted by 200,000+ businesses</p>
            <p>Your payment information is secure and encrypted</p>
            {paymentReference && (
              <p className="font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded">Reference: {paymentReference}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
