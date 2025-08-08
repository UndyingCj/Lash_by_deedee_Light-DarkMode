import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import LayoutWrapper from "@/components/layout-wrapper"
import { logEnvironmentStatus } from "@/lib/env-validation"

// Validate environment on app startup
if (typeof window === 'undefined') {
  logEnvironmentStatus()
}

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Lashed by Deedee - Professional Lash & Brow Services",
  description: "Where Beauty Meets Precision. Professional lash and brow services in Port Harcourt.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <LayoutWrapper>{children}</LayoutWrapper>
        </ThemeProvider>
      </body>
    </html>
  )
}
