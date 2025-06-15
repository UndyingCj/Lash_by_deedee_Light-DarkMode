"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Bell, Shield, Clock, Save, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { AdminLayout } from "@/components/admin/admin-layout"
import type { BusinessSettings } from "@/lib/settings"

const SettingsPage = () => {
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [settings, setSettings] = useState<BusinessSettings>({
    businessName: "",
    businessEmail: "",
    businessPhone: "",
    businessAddress: "",
    businessDescription: "",
    bookingBuffer: 15,
    maxAdvanceBooking: 30,
    cancellationPolicy: 24,
    autoConfirmBookings: false,
    emailNotifications: true,
    smsNotifications: false,
    bookingReminders: true,
    marketingEmails: false,
    twoFactorAuth: false,
    sessionTimeout: 60,
    passwordExpiry: 90,
    theme: "light",
    primaryColor: "pink",
    timezone: "Africa/Lagos",
  })

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings")
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      } else {
        showMessage("error", "Failed to load settings")
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
      showMessage("error", "Failed to load settings")
    } finally {
      setInitialLoading(false)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        showMessage("success", "Settings saved successfully!")

        // Create notification for settings update
        await fetch("/api/admin/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "Settings Updated",
            message: "Business settings have been updated successfully",
            type: "success",
            expiresInHours: 24,
          }),
        })
      } else {
        const errorData = await response.json()
        showMessage("error", errorData.error || "Failed to save settings")
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      showMessage("error", "Failed to save settings. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof BusinessSettings, value: string | boolean | number) => {
    setSettings((prev) => ({ ...prev, [field]: value }))
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  if (initialLoading) {
    return (
      <AdminLayout title="Settings" subtitle="Loading settings...">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Settings" subtitle="Manage your business settings and preferences">
      {/* Success/Error Message */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
            message.type === "success"
              ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
              : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
          }`}
        >
          {message.type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Business Settings */}
        <Card className="border-0 shadow-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5 text-blue-500" />
              <span>Business Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                value={settings.businessName}
                onChange={(e) => handleInputChange("businessName", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="businessEmail">Business Email</Label>
              <Input
                id="businessEmail"
                type="email"
                value={settings.businessEmail}
                onChange={(e) => handleInputChange("businessEmail", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="businessPhone">Business Phone</Label>
              <Input
                id="businessPhone"
                value={settings.businessPhone}
                onChange={(e) => handleInputChange("businessPhone", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="businessAddress">Business Address</Label>
              <Textarea
                id="businessAddress"
                value={settings.businessAddress}
                onChange={(e) => handleInputChange("businessAddress", e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="businessDescription">Business Description</Label>
              <Textarea
                id="businessDescription"
                value={settings.businessDescription}
                onChange={(e) => handleInputChange("businessDescription", e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Booking Settings */}
        <Card className="border-0 shadow-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-green-500" />
              <span>Booking Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="bookingBuffer">Booking Buffer (minutes)</Label>
              <Select
                value={settings.bookingBuffer.toString()}
                onValueChange={(value) => handleInputChange("bookingBuffer", Number.parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No buffer</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="maxAdvanceBooking">Max Advance Booking (days)</Label>
              <Select
                value={settings.maxAdvanceBooking.toString()}
                onValueChange={(value) => handleInputChange("maxAdvanceBooking", Number.parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">1 week</SelectItem>
                  <SelectItem value="14">2 weeks</SelectItem>
                  <SelectItem value="30">1 month</SelectItem>
                  <SelectItem value="60">2 months</SelectItem>
                  <SelectItem value="90">3 months</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="cancellationPolicy">Cancellation Policy (hours)</Label>
              <Select
                value={settings.cancellationPolicy.toString()}
                onValueChange={(value) => handleInputChange("cancellationPolicy", Number.parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 hours</SelectItem>
                  <SelectItem value="12">12 hours</SelectItem>
                  <SelectItem value="24">24 hours</SelectItem>
                  <SelectItem value="48">48 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="autoConfirm">Auto-confirm bookings</Label>
              <Switch
                id="autoConfirm"
                checked={settings.autoConfirmBookings}
                onCheckedChange={(checked) => handleInputChange("autoConfirmBookings", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="border-0 shadow-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-yellow-500" />
              <span>Notifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="emailNotifications">Email Notifications</Label>
              <Switch
                id="emailNotifications"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => handleInputChange("emailNotifications", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="smsNotifications">SMS Notifications</Label>
              <Switch
                id="smsNotifications"
                checked={settings.smsNotifications}
                onCheckedChange={(checked) => handleInputChange("smsNotifications", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="bookingReminders">Booking Reminders</Label>
              <Switch
                id="bookingReminders"
                checked={settings.bookingReminders}
                onCheckedChange={(checked) => handleInputChange("bookingReminders", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="marketingEmails">Marketing Emails</Label>
              <Switch
                id="marketingEmails"
                checked={settings.marketingEmails}
                onCheckedChange={(checked) => handleInputChange("marketingEmails", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security & Appearance */}
        <Card className="border-0 shadow-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-red-500" />
              <span>Security & Appearance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
              <Switch
                id="twoFactorAuth"
                checked={settings.twoFactorAuth}
                onCheckedChange={(checked) => handleInputChange("twoFactorAuth", checked)}
              />
            </div>
            <div>
              <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
              <Select
                value={settings.sessionTimeout.toString()}
                onValueChange={(value) => handleInputChange("sessionTimeout", Number.parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                  <SelectItem value="480">8 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="theme">Theme</Label>
              <Select value={settings.theme} onValueChange={(value) => handleInputChange("theme", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={settings.timezone} onValueChange={(value) => handleInputChange("timezone", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Africa/Lagos">Africa/Lagos (WAT)</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                  <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="mt-8 flex justify-end">
        <Button
          onClick={handleSave}
          disabled={loading}
          className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-8"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </AdminLayout>
  )
}

export default SettingsPage
