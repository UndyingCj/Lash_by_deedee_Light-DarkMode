'use client'

import { useEffect, useState } from 'react'
import { AdminAuthProvider, useAdminAuth } from '@/lib/hooks/use-admin-auth'

interface AdminAuthGuardProps {
  children: React.ReactNode
}

function AuthGuardContent({ children }: AdminAuthGuardProps) {
  const { isAuthenticated, isLoading } = useAdminAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated) {
      window.location.href = '/egusi'
    }
  }, [mounted, isLoading, isAuthenticated])

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Authenticating...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Redirect is handled in useEffect
  }

  return <>{children}</>
}

export function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  return (
    <AdminAuthProvider>
      <AuthGuardContent>{children}</AuthGuardContent>
    </AdminAuthProvider>
  )
}