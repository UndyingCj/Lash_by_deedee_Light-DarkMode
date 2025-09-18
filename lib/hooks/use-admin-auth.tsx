'use client'

import React, { useState, useEffect, createContext, useContext, type ReactNode } from 'react'

interface AdminUser {
  id: string
  username: string
  email: string
}

interface AdminAuthContextType {
  admin: AdminUser | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const validateSession = async () => {
    try {
      const response = await fetch('/api/admin/auth/validate', {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setAdmin(data.admin)
      } else {
        setAdmin(null)
      }
    } catch (error) {
      console.error('Session validation error:', error)
      setAdmin(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    validateSession()
  }, [])

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ username, password })
      })

      const data = await response.json()

      if (response.ok) {
        setAdmin(data.admin)
        return { success: true }
      } else {
        return { success: false, error: data.error || 'Login failed' }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Network error occurred' }
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/admin/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setAdmin(null)
      window.location.href = '/egusi'
    }
  }

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        isLoading,
        login,
        logout,
        isAuthenticated: !!admin
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
}