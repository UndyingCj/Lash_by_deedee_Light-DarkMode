"use client"

import { useCallback } from "react"
import { Button } from "@/components/ui/button"
import { generatePaymentReference, PAYSTACK_PUBLIC_KEY, type PaymentMetadata } from "@/lib/paystack"

interface PaystackPaymentProps {
  /** Amount in NAIRA (NOT kobo) */
  amount: number | undefined
  email: string
  fullName?: string
  phone?: string
  metadata?: PaymentMetadata
  /** Called when Paystack reports `status === "success"` */
  onSuccess?: (reference: string) => void
  /** Called for any error (failed charge, popup closed, etc.) */
  onError?: (error: unknown) => void
}

/* -------------------------------------------------------------------------- */
/*  Types for the Paystack inline script (loaded globally on the client)      */
/* -------------------------------------------------------------------------- */
declare global {
  interface Window {
    PaystackPop?: {
      setup(options: Record<string, unknown>): {
        openIframe(): void
      }
    }
  }
}

/* -------------------------------------------------------------------------- */
/*  Main component                                                            */
/* -------------------------------------------------------------------------- */
export default function PaystackPayment(props: PaystackPaymentProps) {
  const { amount, email, fullName, phone, metadata, onSuccess, onError } = props

  const handlePay = useCallback(() => {
    /* ------------------------------------------------------ */
    /*  Basic safety checks                                   */
    /* ------------------------------------------------------ */
    if (!PAYSTACK_PUBLIC_KEY) {
      alert(
        "Payment cannot be processed because the Paystack public key " +
          "is not configured. Please contact the site administrator.",
      )
      return
    }

    if (typeof window === "undefined" || !window.PaystackPop) {
      alert("Payment cannot be processed because the Paystack script " + "did not load. Please refresh the page.")
      return
    }

    /* ------------------------------------------------------ */
    /*  Initialise Paystack                                   */
    /* ------------------------------------------------------ */
    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email,
      amount: Math.floor((amount ?? 0) * 100), // convert to kobo
      currency: "NGN",
      firstname: fullName,
      phone,
      metadata,
      ref: generatePaymentReference(),
      callback: (response: { status: string; reference: string }) => {
        if (response.status === "success") {
          onSuccess?.(response.reference)
        } else {
          onError?.(new Error("Payment was not successful"))
          alert("Payment failed. Please try again.")
        }
      },
      onClose: () => {
        onError?.(new Error("Payment popup closed by user"))
      },
    })

    handler.openIframe()
  }, [amount, email, fullName, phone, metadata, onSuccess, onError])

  /* -------------------------------------------------------- */
  /*  Render ------------------------------------------------ */
  /* -------------------------------------------------------- */
  const displayAmount = (amount ?? 0).toLocaleString("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  })

  return (
    <Button type="button" onClick={handlePay}>
      {`Pay ${displayAmount}`}
    </Button>
  )
}
