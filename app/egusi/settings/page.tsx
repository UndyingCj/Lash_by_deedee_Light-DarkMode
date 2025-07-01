"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Settings, Shield, Bell, Clock, Users, Save, Loader2, CheckCircle, AlertCircle } from "lucide-react"

interface BusinessHours {
  open: string
  close: string
  closed: boolean
}

interface BusinessSettings {
  businessName: string
  businessEmail: string
  businessPhone: string
  businessAddress: string
  businessHours: {
    monday: BusinessHours
    tuesday: BusinessHours
    wednesday: BusinessHours
    thursday: BusinessHours
    friday: BusinessHours
    saturday: BusinessHours
    sunday: BusinessHours
  }
}

interface NotificationSettings {
  emailNotifications: boolean
  smsNotifications: boolean
  bookingConfirmations: boolean
  reminderNotifications: boolean
  cancelationNotifications: boolean
  reminderHours: number
}

interface SecuritySettings {
  twoFactorEnabled: boolean
  sessionTimeout: number
  passwordExpiry: number
  loginAttempts: number
}

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const [error, setError] = useState<string | null>(null)

  const [businessSettings, setBusinessSettings] = useState<BusinessSettings>({
    businessName: "Lashed by Deedee",
    businessEmail: "lashedbydeedeee@gmail.com",
    businessPhone: "+234 XXX XXX XXXX",
    businessAddress: "Rumigbo, Port Harcourt, Rivers State",
    businessHours: {
      monday: { open: "09:00", close: "18:00", closed: false },
      tuesday: { open: "09:00", close: "18:00", closed: false },
      wednesday: { open: "09:00", close: "18:00", closed: false },
      thursday: { open: "09:00", close: "18:00", closed: false },
      friday: { open: "09:00", close: "18:00", closed: false },
      saturday: { open: "10:00", close: "16:00", closed: false },
      sunday: { open: "12:00", close: "16:00", closed: true },
    },
  })

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: false,
    bookingConfirmations: true,
    reminderNotifications: true,
    cancelationNotifications: true,
    reminderHours: 24,
  })

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    sessionTimeout: 24,
    passwordExpiry: 90,
    loginAttempts: 5,
  })

  // Fetch settings on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch("/api/admin/settings")

        if (!response.ok) {
          throw new Error(`Failed to fetch settings: ${response.status}`)
        }

        const data = await response.json()

        if (data.businessName) {
          setBusinessSettings({
            businessName: data.businessName || businessSettings.businessName,
            businessEmail: data.businessEmail || businessSettings.businessEmail,
            businessPhone: data.businessPhone || businessSettings.businessPhone,
            businessAddress: data.businessAddress || businessSettings.businessAddress,
            businessHours: data.businessHours || businessSettings.businessHours,
          })
        }

        if (data.notificationSettings) {
          setNotificationSettings(data.notificationSettings)
        }

        if (data.securitySettings) {
          setSecuritySettings(data.securitySettings)
        }
      } catch (err) {
        console.error("Error fetching settings:", err)
        setError("Failed to load settings. Please try refreshing the page.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const handleSaveSettings = async (settingsType: string) => {
    setIsLoading(true)
    setSaveStatus("saving")

    try {
      let settingsData = {}

      if (settingsType === "business") {
        settingsData = {
          businessName: businessSettings.businessName,
          businessEmail: businessSettings.businessEmail,
          businessPhone: businessSettings.businessPhone,
          businessAddress: businessSettings.businessAddress,
          businessHours: businessSettings.businessHours,
        }
      } else if (settingsType === "notifications") {
        settingsData = {
          notificationSettings,
        }
      } else if (settingsType === "security") {
        settingsData = {
          securitySettings,
        }
      }

      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsData),
      })

      if (!response.ok) {
        throw new Error(`Failed to save settings: ${response.status}`)
      }

      setSaveStatus("saved")
      setTimeout(() => setSaveStatus("idle"), 2000)
    } catch (err) {
      console.error("Error saving settings:", err)
      setSaveStatus("error")
      setTimeout(() => setSaveStatus("idle"), 3000)
    } finally {
      setIsLoading(false)
    }
  }

  const renderSaveButton = (settingsType: string) => (
    <Button
      onClick={() => handleSaveSettings(settingsType)}
      disabled={isLoading || saveStatus === "saving"}
      className="bg-pink-500 hover:bg-pink-600"
    >
      {saveStatus === "saving" ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Saving...
        </>
      ) : saveStatus === "saved" ? (
        <>
          <CheckCircle className="w-4 h-4 mr-2" />
          Saved!
        </>
      ) : saveStatus === "error" ? (
        <>
          <AlertCircle className="w-4 h-4 mr-2" />
          Error
        </>
      ) : (
        <>
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </>
      )}
    </Button>
  )

  if (isLoading && error === null) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="w-8 h-8 text-pink-500" />
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-gray-600">Loading settings...</p>
          </div>
        </div>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="w-8 h-8 text-pink-500" />
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-gray-600">Manage your business settings and preferences</p>
          </div>
        </div>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="w-6 h-6" />
              <p>{error}</p>
            </div>
            <Button onClick={() => window.location.reload()} className="mt-4 bg-pink-500 hover:bg-pink-600">
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-8 h-8 text-pink-500" />
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-gray-600">Manage your business settings and preferences</p>
        </div>
      </div>

      <Tabs defaultValue="business" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="business" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Business
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="business">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Business Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    value={businessSettings.businessName}
                    onChange={(e) =>
                      setBusinessSettings({
                        ...businessSettings,
                        businessName: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="businessEmail">Business Email</Label>
                  <Input
                    id="businessEmail"
                    type="email"
                    value={businessSettings.businessEmail}
                    onChange={(e) =>
                      setBusinessSettings({
                        ...businessSettings,
                        businessEmail: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="businessPhone">Business Phone</Label>
                  <Input
                    id="businessPhone"
                    value={businessSettings.businessPhone}
                    onChange={(e) =>
                      setBusinessSettings({
                        ...businessSettings,
                        businessPhone: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="businessAddress">Business Address</Label>
                  <Input
                    id="businessAddress"
                    value={businessSettings.businessAddress}
                    onChange={(e) =>
                      setBusinessSettings({
                        ...businessSettings,
                        businessAddress: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Business Hours
                </h3>
                <div className="space-y-3">
                  {Object.entries(businessSettings.businessHours).map(([day, hours]) => (
                    <div key={day} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="w-20 font-medium capitalize">{day}</div>
                      <Switch
                        checked={!hours.closed}
                        onCheckedChange={(checked) =>
                          setBusinessSettings({
                            ...businessSettings,
                            businessHours: {
                              ...businessSettings.businessHours,
                              [day]: { ...hours, closed: !checked },
                            },
                          })
                        }
                      />
                      {!hours.closed && (
                        <>
                          <Input
                            type="time"
                            value={hours.open}
                            onChange={(e) =>
                              setBusinessSettings({
                                ...businessSettings,
                                businessHours: {
                                  ...businessSettings.businessHours,
                                  [day]: { ...hours, open: e.target.value },
                                },
                              })
                            }
                            className="w-32"
                          />
                          <span>to</span>
                          <Input
                            type="time"
                            value={hours.close}
                            onChange={(e) =>
                              setBusinessSettings({
                                ...businessSettings,
                                businessHours: {
                                  ...businessSettings.businessHours,
                                  [day]: { ...hours, close: e.target.value },
                                },
                              })
                            }
                            className="w-32"
                          />
                        </>
                      )}
                      {hours.closed && <Badge variant="secondary">Closed</Badge>}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">{renderSaveButton("business")}</div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <p className="text-sm text-gray-600">Receive notifications via email</p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        emailNotifications: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="smsNotifications">SMS Notifications</Label>
                    <p className="text-sm text-gray-600">Receive notifications via SMS</p>
                  </div>
                  <Switch
                    id="smsNotifications"
                    checked={notificationSettings.smsNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        smsNotifications: checked,
                      })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="bookingConfirmations">Booking Confirmations</Label>
                    <p className="text-sm text-gray-600">Get notified when bookings are made</p>
                  </div>
                  <Switch
                    id="bookingConfirmations"
                    checked={notificationSettings.bookingConfirmations}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        bookingConfirmations: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="reminderNotifications">Appointment Reminders</Label>
                    <p className="text-sm text-gray-600">Send reminders to clients</p>
                  </div>
                  <Switch
                    id="reminderNotifications"
                    checked={notificationSettings.reminderNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        reminderNotifications: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="cancelationNotifications">Cancellation Notifications</Label>
                    <p className="text-sm text-gray-600">Get notified when bookings are cancelled</p>
                  </div>
                  <Switch
                    id="cancelationNotifications"
                    checked={notificationSettings.cancelationNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        cancelationNotifications: checked,
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="reminderHours">Reminder Time (hours before appointment)</Label>
                  <Input
                    id="reminderHours"
                    type="number"
                    min="1"
                    max="168"
                    value={notificationSettings.reminderHours}
                    onChange={(e) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        reminderHours: Number.parseInt(e.target.value) || 24,
                      })
                    }
                    className="w-32 mt-2"
                  />
                </div>
              </div>

              <div className="flex justify-end">{renderSaveButton("notifications")}</div>
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
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="twoFactorEnabled">Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                  </div>
                  <Switch
                    id="twoFactorEnabled"
                    checked={securitySettings.twoFactorEnabled}
                    onCheckedChange={(checked) =>
                      setSecuritySettings({
                        ...securitySettings,
                        twoFactorEnabled: checked,
                      })
                    }
                  />
                </div>

                <Separator />

                <div>
                  <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
                  <p className="text-sm text-gray-600 mb-2">How long before you're automatically logged out</p>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    min="1"
                    max="168"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) =>
                      setSecuritySettings({
                        ...securitySettings,
                        sessionTimeout: Number.parseInt(e.target.value) || 24,
                      })
                    }
                    className="w-32"
                  />
                </div>

                <div>
                  <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
                  <p className="text-sm text-gray-600 mb-2">How often you need to change your password</p>
                  <Input
                    id="passwordExpiry"
                    type="number"
                    min="30"
                    max="365"
                    value={securitySettings.passwordExpiry}
                    onChange={(e) =>
                      setSecuritySettings({
                        ...securitySettings,
                        passwordExpiry: Number.parseInt(e.target.value) || 90,
                      })
                    }
                    className="w-32"
                  />
                </div>

                <div>
                  <Label htmlFor="loginAttempts">Maximum Login Attempts</Label>
                  <p className="text-sm text-gray-600 mb-2">Account locks after this many failed attempts</p>
                  <Input
                    id="loginAttempts"
                    type="number"
                    min="3"
                    max="10"
                    value={securitySettings.loginAttempts}
                    onChange={(e) =>
                      setSecuritySettings({
                        ...securitySettings,
                        loginAttempts: Number.parseInt(e.target.value) || 5,
                      })
                    }
                    className="w-32"
                  />
                </div>
              </div>

              <div className="flex justify-end">{renderSaveButton("security")}</div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
