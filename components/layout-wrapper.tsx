"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdminRoute = pathname.startsWith("/egusi")

  if (isAdminRoute) {
    return <>{children}</>
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  )
}
