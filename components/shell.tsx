"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Simple max-width wrapper that centers page content.
 * Accepts an optional `className` for further styling.
 */
export function Shell({ children, className }: React.PropsWithChildren<{ className?: string }>) {
  return <main className={cn("w-full max-w-7xl mx-auto px-4", className)}>{children}</main>
}
