"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Loader2, Save, Settings, Bell, CreditCard, Building } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface BusinessSettings {
  id: string
  businessName: string
  businessEmail: string
  businessPhone: string
  businessAddress: string
  businessHours: any
  timezone: string
  currency: string
  bookingBuffer: number
  maxAdvanceBooking: number
  cancellationPolicy: string
}

interface NotificationSettings {
  id: string
  emailNotifications: boolean
  smsNotifications: boolean
  bookingConfirmations: boolean
  bookingReminders: boolean
  reminderHours: number
  cancellationNotifications: boolean
  paymentNotifications: boolean
  adminNotifications: boolean
}

interface PaymentSettings {
  id: string
  paystackPublicKey: string
  paystackSecretKey: string
  requirePayment: boolean
  depositPercentage: number
  refundPolicy: string
  acceptedPaymentMethods: string[]
}

interface SettingsData {
  business: BusinessSettings
  notifications: NotificationSettings
  payments: PaymentSettings
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/settings")
      const data = await response.json()

      if (data.success) {
        setSettings(data.data)
      } else {
        toast({
          title: "Error",
          description: "Failed to load settings",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async (type: "business" | "notifications" | "payments", data: any) => {
    try {
      setSaving(true)
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type, data }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: "Settings saved successfully",
        })
        fetchSettings() // Refresh settings
      } else {
        toast({
          title: "Error",
          description: "Failed to save settings",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Failed to load settings</h2>
          <Button onClick={fetchSettings}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <Tabs defaultValue="business" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="business" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Business
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="business">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>Manage your business details and operating hours</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    value={settings.business.businessName}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        business: { ...settings.business, businessName: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessEmail">Business Email</Label>
                  <Input
                    id="businessEmail"
                    type="email"
                    value={settings.business.businessEmail}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        business: { ...settings.business, businessEmail: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessPhone">Business Phone</Label>
                  <Input
                    id="businessPhone"
                    value={settings.business.businessPhone}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        business: { ...settings.business, businessPhone: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input
                    id="timezone"
                    value={settings.business.timezone}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        business: { ...settings.business, timezone: e.target.value },
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessAddress">Business Address</Label>
                <Textarea
                  id="businessAddress"
                  value={settings.business.businessAddress}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      business: { ...settings.business, businessAddress: e.target.value },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cancellationPolicy">Cancellation Policy</Label>
                <Textarea
                  id="cancellationPolicy"
                  value={settings.business.cancellationPolicy}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      business: { ...settings.business, cancellationPolicy: e.target.value },
                    })
                  }
                />
              </div>

              <Separator />

              <Button onClick={() => saveSettings("business", settings.business)} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save Business Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure how and when you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={settings.notifications.emailNotifications}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, emailNotifications: checked },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                  </div>
                  <Switch
                    checked={settings.notifications.smsNotifications}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, smsNotifications: checked },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Booking Confirmations</Label>
                    <p className="text-sm text-muted-foreground">Send confirmation emails for new bookings</p>
                  </div>
                  <Switch
                    checked={settings.notifications.bookingConfirmations}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, bookingConfirmations: checked },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Booking Reminders</Label>
                    <p className="text-sm text-muted-foreground">Send reminder emails before appointments</p>
                  </div>
                  <Switch
                    checked={settings.notifications.bookingReminders}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, bookingReminders: checked },
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reminderHours">Reminder Hours Before Appointment</Label>
                  <Input
                    id="reminderHours"
                    type="number"
                    value={settings.notifications.reminderHours}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, reminderHours: Number.parseInt(e.target.value) },
                      })
                    }
                  />
                </div>
              </div>

              <Separator />

              <Button onClick={() => saveSettings("notifications", settings.notifications)} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment Settings</CardTitle>
              <CardDescription>Configure payment processing and policies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paystackPublicKey">Paystack Public Key</Label>
                  <Input
                    id="paystackPublicKey"
                    value={settings.payments.paystackPublicKey}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        payments: { ...settings.payments, paystackPublicKey: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paystackSecretKey">Paystack Secret Key</Label>
                  <Input
                    id="paystackSecretKey"
                    type="password"
                    value={settings.payments.paystackSecretKey}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        payments: { ...settings.payments, paystackSecretKey: e.target.value },
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Payment</Label>
                    <p className="text-sm text-muted-foreground">Require payment to confirm bookings</p>
                  </div>
                  <Switch
                    checked={settings.payments.requirePayment}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        payments: { ...settings.payments, requirePayment: checked },
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="depositPercentage">Deposit Percentage</Label>
                  <Input
                    id="depositPercentage"
                    type="number"
                    min="0"
                    max="100"
                    value={settings.payments.depositPercentage}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        payments: { ...settings.payments, depositPercentage: Number.parseInt(e.target.value) },
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="refundPolicy">Refund Policy</Label>
                  <Textarea
                    id="refundPolicy"
                    value={settings.payments.refundPolicy}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        payments: { ...settings.payments, refundPolicy: e.target.value },
                      })
                    }
                  />
                </div>
              </div>

              <Separator />

              <Button onClick={() => saveSettings("payments", settings.payments)} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save Payment Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
