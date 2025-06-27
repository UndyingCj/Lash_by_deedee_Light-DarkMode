"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Settings, User, Bell, Shield, Key, Save, Eye, EyeOff } from "lucide-react"

interface AdminSettings {
  profile: {
    name: string
    email: string
    phone: string
  }
  notifications: {
    emailNotifications: boolean
    smsNotifications: boolean
    bookingAlerts: boolean
    paymentAlerts: boolean
  }
  security: {
    twoFactorEnabled: boolean
    sessionTimeout: number
  }
  business: {
    businessHours: {
      monday: { open: string; close: string; closed: boolean }
      tuesday: { open: string; close: string; closed: boolean }
      wednesday: { open: string; close: string; closed: boolean }
      thursday: { open: string; close: string; closed: boolean }
      friday: { open: string; close: string; closed: boolean }
      saturday: { open: string; close: string; closed: boolean }
      sunday: { open: string; close: string; closed: boolean }
    }
    bookingSettings: {
      advanceBookingDays: number
      cancellationHours: number
      depositRequired: boolean
      depositPercentage: number
    }
  }
}

const defaultSettings: AdminSettings = {
  profile: {
    name: "Deedee",
    email: "lashedbydeedeee@gmail.com",
    phone: "+1 (555) 123-4567",
  },
  notifications: {
    emailNotifications: true,
    smsNotifications: false,
    bookingAlerts: true,
    paymentAlerts: true,
  },
  security: {
    twoFactorEnabled: true,
    sessionTimeout: 24,
  },
  business: {
    businessHours: {
      monday: { open: "09:00", close: "18:00", closed: false },
      tuesday: { open: "09:00", close: "18:00", closed: false },
      wednesday: { open: "09:00", close: "18:00", closed: false },
      thursday: { open: "09:00", close: "18:00", closed: false },
      friday: { open: "09:00", close: "18:00", closed: false },
      saturday: { open: "10:00", close: "16:00", closed: false },
      sunday: { open: "10:00", close: "16:00", closed: true },
    },
    bookingSettings: {
      advanceBookingDays: 30,
      cancellationHours: 24,
      depositRequired: true,
      depositPercentage: 25,
    },
  },
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<AdminSettings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/admin/settings")

      if (response.ok) {
        const data = await response.json()
        setSettings({ ...defaultSettings, ...data })
      } else {
        // Use default settings if API fails
        setSettings(defaultSettings)
      }
    } catch (err) {
      console.error("Failed to load settings:", err)
      setSettings(defaultSettings)
    } finally {
      setIsLoading(false)
    }
  }

  const saveSettings = async () => {
    try {
      setIsSaving(true)
      setError("")
      setMessage("")

      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        setMessage("Settings saved successfully!")
        setTimeout(() => setMessage(""), 3000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to save settings")
      }
    } catch (err) {
      setError("Failed to save settings. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match")
      return
    }

    if (passwordData.newPassword.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }

    try {
      setIsSaving(true)
      setError("")
      setMessage("")

      const response = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })

      if (response.ok) {
        setMessage("Password changed successfully!")
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
        setShowPasswordChange(false)
        setTimeout(() => setMessage(""), 3000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to change password")
      }
    } catch (err) {
      setError("Failed to change password. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const updateSettings = (section: keyof AdminSettings, field: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }))
  }

  const updateBusinessHours = (day: string, field: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      business: {
        ...prev.business,
        businessHours: {
          ...prev.business.businessHours,
          [day]: {
            ...prev.business.businessHours[day as keyof typeof prev.business.businessHours],
            [field]: value,
          },
        },
      },
    }))
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Settings className="w-8 h-8 text-pink-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your admin panel preferences</p>
          </div>
        </div>
        <Badge variant="outline" className="text-green-600 border-green-600">
          Live
        </Badge>
      </div>

      {message && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg">{error}</div>
      )}

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>Profile</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <Bell className="w-4 h-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span>Security</span>
          </TabsTrigger>
          <TabsTrigger value="business" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Business</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={settings.profile.name}
                  onChange={(e) => updateSettings("profile", "name", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.profile.email}
                  onChange={(e) => updateSettings("profile", "email", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={settings.profile.phone}
                  onChange={(e) => updateSettings("profile", "phone", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Receive notifications via email</p>
                </div>
                <Switch
                  checked={settings.notifications.emailNotifications}
                  onCheckedChange={(checked) => updateSettings("notifications", "emailNotifications", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Receive notifications via SMS</p>
                </div>
                <Switch
                  checked={settings.notifications.smsNotifications}
                  onCheckedChange={(checked) => updateSettings("notifications", "smsNotifications", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Booking Alerts</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Get notified of new bookings</p>
                </div>
                <Switch
                  checked={settings.notifications.bookingAlerts}
                  onCheckedChange={(checked) => updateSettings("notifications", "bookingAlerts", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Payment Alerts</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Get notified of payments</p>
                </div>
                <Switch
                  checked={settings.notifications.paymentAlerts}
                  onCheckedChange={(checked) => updateSettings("notifications", "paymentAlerts", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Add an extra layer of security</p>
                  </div>
                  <Switch
                    checked={settings.security.twoFactorEnabled}
                    onCheckedChange={(checked) => updateSettings("security", "twoFactorEnabled", checked)}
                  />
                </div>
                <div>
                  <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    min="1"
                    max="168"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => updateSettings("security", "sessionTimeout", Number.parseInt(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Key className="w-5 h-5" />
                  <span>Change Password</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!showPasswordChange ? (
                  <Button onClick={() => setShowPasswordChange(true)} variant="outline" className="w-full">
                    Change Password
                  </Button>
                ) : (
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showPasswords.current ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                          required
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowPasswords((prev) => ({ ...prev, current: !prev.current }))}
                        >
                          {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showPasswords.new ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
                          required
                          minLength={8}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowPasswords((prev) => ({ ...prev, new: !prev.new }))}
                        >
                          {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                          required
                          minLength={8}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))}
                        >
                          {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button type="submit" disabled={isSaving}>
                        {isSaving ? "Changing..." : "Change Password"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowPasswordChange(false)
                          setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="business">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Business Hours</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(settings.business.businessHours).map(([day, hours]) => (
                  <div key={day} className="flex items-center space-x-4">
                    <div className="w-24">
                      <Label className="capitalize">{day}</Label>
                    </div>
                    <Switch
                      checked={!hours.closed}
                      onCheckedChange={(checked) => updateBusinessHours(day, "closed", !checked)}
                    />
                    {!hours.closed && (
                      <>
                        <Input
                          type="time"
                          value={hours.open}
                          onChange={(e) => updateBusinessHours(day, "open", e.target.value)}
                          className="w-32"
                        />
                        <span>to</span>
                        <Input
                          type="time"
                          value={hours.close}
                          onChange={(e) => updateBusinessHours(day, "close", e.target.value)}
                          className="w-32"
                        />
                      </>
                    )}
                    {hours.closed && <span className="text-gray-500">Closed</span>}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Booking Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="advanceBookingDays">Advance Booking Days</Label>
                  <Input
                    id="advanceBookingDays"
                    type="number"
                    min="1"
                    max="365"
                    value={settings.business.bookingSettings.advanceBookingDays}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        business: {
                          ...prev.business,
                          bookingSettings: {
                            ...prev.business.bookingSettings,
                            advanceBookingDays: Number.parseInt(e.target.value),
                          },
                        },
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="cancellationHours">Cancellation Notice (hours)</Label>
                  <Input
                    id="cancellationHours"
                    type="number"
                    min="1"
                    max="168"
                    value={settings.business.bookingSettings.cancellationHours}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        business: {
                          ...prev.business,
                          bookingSettings: {
                            ...prev.business.bookingSettings,
                            cancellationHours: Number.parseInt(e.target.value),
                          },
                        },
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Deposit Required</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Require deposit for bookings</p>
                  </div>
                  <Switch
                    checked={settings.business.bookingSettings.depositRequired}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        business: {
                          ...prev.business,
                          bookingSettings: {
                            ...prev.business.bookingSettings,
                            depositRequired: checked,
                          },
                        },
                      }))
                    }
                  />
                </div>
                {settings.business.bookingSettings.depositRequired && (
                  <div>
                    <Label htmlFor="depositPercentage">Deposit Percentage</Label>
                    <Input
                      id="depositPercentage"
                      type="number"
                      min="1"
                      max="100"
                      value={settings.business.bookingSettings.depositPercentage}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          business: {
                            ...prev.business,
                            bookingSettings: {
                              ...prev.business.bookingSettings,
                              depositPercentage: Number.parseInt(e.target.value),
                            },
                          },
                        }))
                      }
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end mt-6">
        <Button onClick={saveSettings} disabled={isSaving} className="bg-pink-500 hover:bg-pink-600">
          {isSaving ? (
            <>
              <Save className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
