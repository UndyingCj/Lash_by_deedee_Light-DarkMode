"use client"

import { useState, useEffect } from "react"
import { Bell, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Notification {
  id: string
  type: "booking" | "payment" | "cancellation"
  title: string
  message: string
  timestamp: string
  read: boolean
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Load notifications from localStorage or API
    loadNotifications()

    // Set up polling for new notifications
    const interval = setInterval(loadNotifications, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const unread = notifications.filter((n) => !n.read).length
    setUnreadCount(unread)
  }, [notifications])

  const loadNotifications = async () => {
    try {
      // In a real app, this would fetch from an API
      // For now, we'll use localStorage as a simple example
      const stored = localStorage.getItem("admin-notifications")
      if (stored) {
        const parsed = JSON.parse(stored)
        setNotifications(parsed)
      }
    } catch (error) {
      console.error("Error loading notifications:", error)
    }
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      localStorage.setItem("admin-notifications", JSON.stringify(updated))
      return updated
    })
  }

  const markAllAsRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }))
      localStorage.setItem("admin-notifications", JSON.stringify(updated))
      return updated
    })
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.filter((n) => n.id !== id)
      localStorage.setItem("admin-notifications", JSON.stringify(updated))
      return updated
    })
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "booking":
        return "📅"
      case "payment":
        return "💰"
      case "cancellation":
        return "❌"
      default:
        return "📢"
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="relative">
      <Button variant="ghost" size="sm" onClick={() => setShowDropdown(!showDropdown)} className="relative p-2">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </Button>

      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 z-50">
          <Card className="w-80 max-h-96 overflow-hidden shadow-lg">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Notifications</CardTitle>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs h-6 px-2">
                      Mark all read
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => setShowDropdown(false)} className="h-6 w-6 p-0">
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">No notifications yet</div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                        !notification.read ? "bg-blue-50" : ""
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm">{getNotificationIcon(notification.type)}</span>
                            <span className="text-sm font-medium text-gray-900">{notification.title}</span>
                            {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                          </div>
                          <p className="text-xs text-gray-600 mb-1">{notification.message}</p>
                          <p className="text-xs text-gray-400">{formatTimestamp(notification.timestamp)}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteNotification(notification.id)
                          }}
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

// Helper function to add notifications (can be called from other parts of the app)
export function addNotification(notification: Omit<Notification, "id" | "timestamp" | "read">) {
  const newNotification: Notification = {
    ...notification,
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    read: false,
  }

  const stored = localStorage.getItem("admin-notifications")
  const existing = stored ? JSON.parse(stored) : []
  const updated = [newNotification, ...existing].slice(0, 50) // Keep only last 50 notifications

  localStorage.setItem("admin-notifications", JSON.stringify(updated))

  // Trigger a custom event to update the notification bell
  window.dispatchEvent(new CustomEvent("notification-added"))
}

// Default export for compatibility
export default NotificationBell
