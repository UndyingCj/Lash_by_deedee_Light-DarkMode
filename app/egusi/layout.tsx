import type React from "react"
import { Inter } from "next/font/google"
import "../globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Admin Panel - Lashed by Deedee",
  description: "Professional beauty management system",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} antialiased bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800`}
      >
        {children}
      </body>
    </html>
  )
}
