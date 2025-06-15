"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LogOut, Bell, Calendar, Users, BarChart3, Settings, Menu, X, Home } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface AdminLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
}

export function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    // Check authentication
    const isAuth = localStorage.getItem("adminAuth")
    if (!isAuth) {
      window.location.href = "/egusi"
      return
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("adminAuth")
    window.location.href = "/egusi"
  }

  const navigation = [
    { name: "Dashboard", href: "/egusi/dashboard", icon: Home },
    { name: "Bookings", href: "/egusi/bookings", icon: Calendar },
    { name: "Calendar", href: "/egusi/calendar", icon: Calendar },
    { name: "Analytics", href: "/egusi/analytics", icon: BarChart3 },
    { name: "Clients", href: "/egusi/clients", icon: Users },
    { name: "Settings", href: "/egusi/settings", icon: Settings },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Fixed Header */}
      <header className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-700/50 fixed top-0 left-0 right-0 z-50 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>

              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">L</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800"></div>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                    Admin Panel
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Lashed by Deedee</p>
                </div>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="relative">
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/images/deedee-portrait.png" />
                      <AvatarFallback className="bg-pink-100 text-pink-600">DD</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar for desktop */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:w-64 lg:flex lg:flex-col lg:pt-16">
        <div className="flex flex-col flex-1 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-r border-slate-200/50 dark:border-slate-700/50">
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive(item.href)
                      ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-100"
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 pt-16">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="fixed left-0 top-16 bottom-0 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700">
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive(item.href)
                        ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-100"
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="lg:pl-64 pt-16">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          {/* Page header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{title}</h2>
            {subtitle && <p className="text-slate-600 dark:text-slate-400 mt-1">{subtitle}</p>}
          </div>

          {/* Page content */}
          {children}
        </div>
      </main>
    </div>
  )
}
