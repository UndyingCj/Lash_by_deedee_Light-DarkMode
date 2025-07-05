import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const reference = searchParams.get("reference")
  const status = searchParams.get("status")

  console.log("🔄 Payment callback received:", { reference, status })

  if (!reference) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/book?error=no_reference`)
  }

  if (status === "success") {
    // Redirect to verification page
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/book?verify=${reference}`)
  } else {
    // Payment failed or cancelled
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/book?error=payment_failed`)
  }
}
