"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Home, Calendar, Users, BarChart3, Settings, LogOut, Search, Plus, Menu, X, Heart } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { AddBookingModal } from "@/components/admin/add-booking-modal"
import { NotificationBell } from "@/components/admin/notification-bell"

interface AdminLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
}

export function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const isAuth = localStorage.getItem("adminAuth")
    if (!isAuth) {
      router.push("/egusi")
      return
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("adminAuth")
    router.push("/egusi")
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
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/95 dark:bg-slate-800/95 backdrop-blur-lg border-r border-slate-200/50 dark:border-slate-700/50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Heart className="w-5 h-5 text-white fill-current" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800"></div>
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                  Admin Panel
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Lashed by Deedee</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)} className="lg:hidden">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive(item.href)
                      ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon
                    className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                      isActive(item.href) ? "text-white" : ""
                    }`}
                  />
                  <span className="font-medium">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
              <Avatar className="w-8 h-8">
                <AvatarImage src="/images/deedee-portrait.png" />
                <AvatarFallback className="bg-pink-100 text-pink-600 text-sm">DD</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">Deedee</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Administrator</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:ml-64">
        {/* Top Header */}
        <header className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-700/50 sticky top-0 z-40">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)} className="lg:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{title}</h1>
                  {subtitle && <p className="text-sm text-slate-600 dark:text-slate-400">{subtitle}</p>}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* Search */}
                <div className="relative hidden sm:block">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>

                {/* Notifications */}
                <NotificationBell />

                {/* Add Booking */}
                <Button
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">New Booking</span>
                </Button>

                {/* User Menu */}
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

        {/* Page Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8">{children}</div>

        {/* Footer */}
        <footer className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-t border-slate-200/50 dark:border-slate-700/50 p-4">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-2 sm:mb-0">
              <Heart className="w-4 h-4 text-pink-500 fill-current" />
              <span className="text-sm text-slate-600 dark:text-slate-400">© 2025 Lashed by Deedee Admin Panel</span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-500">Version 1.0.0 • Built with ❤️</div>
          </div>
        </footer>
      </main>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Add Booking Modal */}
      <AddBookingModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onBookingAdded={() => {
          // Refresh data if needed
          window.location.reload()
        }}
      />
    </div>
  )
}
