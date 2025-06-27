"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Settings,
  User,
  Shield,
  Bell,
  Key,
  Globe,
  Save,
  Copy,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
} from "lucide-react"

interface SettingsData {
  profile: {
    username: string
    email: string
    twoFactorEnabled: boolean
    lastLogin: string
  }
  notifications: {
    emailNotifications: boolean
    bookingAlerts: boolean
    systemUpdates: boolean
  }
  security: {
    sessionTimeout: number
    maxLoginAttempts: number
  }
  paystack: {
    publicKey: string
    secretKey: string
    webhookUrl: string
    testMode: boolean
  }
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData>({
    profile: {
      username: "deedee",
      email: "lashedbydeedeee@gmail.com",
      twoFactorEnabled: true,
      lastLogin: new Date().toISOString(),
    },
    notifications: {
      emailNotifications: true,
      bookingAlerts: true,
      systemUpdates: false,
    },
    security: {
      sessionTimeout: 24,
      maxLoginAttempts: 5,
    },
    paystack: {
      publicKey: "pk_live_edddbd4959b95ee7d1eebe12b71b68f8ce5ff0a7",
      secretKey: "sk_live_f3437bf92100d5b73c6aa72e78d7db300d9029bb",
      webhookUrl: `${typeof window !== "undefined" ? window.location.origin : "https://lashedbydeedee.com"}/api/payments/webhook`,
      testMode: false,
    },
  })

  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [showSecretKey, setShowSecretKey] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings")
      if (response.ok) {
        const data = await response.json()
        setSettings((prev) => ({ ...prev, ...data }))
      }
    } catch (err) {
      console.error("Failed to load settings:", err)
    }
  }

  const saveSettings = async () => {
    setIsLoading(true)
    setError("")
    setMessage("")

    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        throw new Error("Failed to save settings")
      }

      setMessage("Settings saved successfully!")
      setTimeout(() => setMessage(""), 3000)
    } catch (err) {
      setError("Failed to save settings. Please try again.")
      setTimeout(() => setError(""), 3000)
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setMessage("Copied to clipboard!")
    setTimeout(() => setMessage(""), 2000)
  }

  const updateSettings = (section: keyof SettingsData, field: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }))
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-8 h-8 text-pink-500" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your admin panel configuration</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Globe className="w-3 h-3 mr-1" />
            Live
          </Badge>
        </div>
      </div>

      {message && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          {message}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            Payments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={settings.profile.username}
                    onChange={(e) => updateSettings("profile", "username", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.profile.email}
                    onChange={(e) => updateSettings("profile", "email", e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Two-Factor Authentication</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Secure your account with 2FA codes sent to your email
                  </p>
                </div>
                <Switch
                  checked={settings.profile.twoFactorEnabled}
                  onCheckedChange={(checked) => updateSettings("profile", "twoFactorEnabled", checked)}
                />
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Last login: {new Date(settings.profile.lastLogin).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    min="3"
                    max="10"
                    value={settings.security.maxLoginAttempts}
                    onChange={(e) => updateSettings("security", "maxLoginAttempts", Number.parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Security Features Active</h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>✓ Password hashing with bcrypt</li>
                  <li>✓ Account lockout after failed attempts</li>
                  <li>✓ Session token validation</li>
                  <li>✓ Two-factor authentication</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Receive general notifications via email</p>
                  </div>
                  <Switch
                    checked={settings.notifications.emailNotifications}
                    onCheckedChange={(checked) => updateSettings("notifications", "emailNotifications", checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Booking Alerts</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Get notified about new bookings and cancellations
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.bookingAlerts}
                    onCheckedChange={(checked) => updateSettings("notifications", "bookingAlerts", checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">System Updates</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Receive notifications about system maintenance and updates
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.systemUpdates}
                    onCheckedChange={(checked) => updateSettings("notifications", "systemUpdates", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Payment Configuration
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Live Mode
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="publicKey">Live Public Key</Label>
                  <div className="flex gap-2">
                    <Input
                      id="publicKey"
                      value={settings.paystack.publicKey}
                      onChange={(e) => updateSettings("paystack", "publicKey", e.target.value)}
                      className="font-mono text-sm"
                    />
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(settings.paystack.publicKey)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="secretKey">Live Secret Key</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="secretKey"
                        type={showSecretKey ? "text" : "password"}
                        value={settings.paystack.secretKey}
                        onChange={(e) => updateSettings("paystack", "secretKey", e.target.value)}
                        className="font-mono text-sm pr-10"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowSecretKey(!showSecretKey)}
                      >
                        {showSecretKey ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(settings.paystack.secretKey)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="webhookUrl">Webhook URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="webhookUrl"
                      value={settings.paystack.webhookUrl}
                      onChange={(e) => updateSettings("paystack", "webhookUrl", e.target.value)}
                      className="font-mono text-sm"
                    />
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(settings.paystack.webhookUrl)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Configure this URL in your Paystack dashboard
                  </p>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">⚠️ Live Mode Active</h4>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  You are currently using live Paystack keys. All transactions will be processed with real money.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end pt-6">
        <Button onClick={saveSettings} disabled={isLoading} className="bg-pink-500 hover:bg-pink-600 text-white">
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
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
