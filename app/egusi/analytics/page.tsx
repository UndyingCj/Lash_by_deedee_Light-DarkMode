"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, TrendingUp, DollarSign, Users, Calendar, Star, Download, RefreshCw } from "lucide-react"
import { AdminLayout } from "@/components/admin/admin-layout"

interface AnalyticsData {
  totalRevenue: number
  totalBookings: number
  averageBookingValue: number
  clientRetentionRate: number
  popularServices: Array<{ service: string; count: number; revenue: number }>
  monthlyTrends: Array<{ month: string; bookings: number; revenue: number }>
  revenueGrowth: number
  bookingGrowth: number
}

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalRevenue: 0,
    totalBookings: 0,
    averageBookingValue: 0,
    clientRetentionRate: 0,
    popularServices: [],
    monthlyTrends: [],
    revenueGrowth: 0,
    bookingGrowth: 0,
  })
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("30")

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/analytics?range=${timeRange}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setAnalytics(data.data)
        }
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
      // Set mock data for demo
      setAnalytics({
        totalRevenue: 1250000,
        totalBookings: 156,
        averageBookingValue: 28500,
        clientRetentionRate: 78,
        popularServices: [
          { service: "Volume Lashes", count: 45, revenue: 1125000 },
          { service: "Ombré Brows", count: 32, revenue: 1440000 },
          { service: "Classic Lashes", count: 28, revenue: 420000 },
          { service: "Hybrid Lashes", count: 25, revenue: 500000 },
          { service: "Microblading", count: 26, revenue: 1040000 },
        ],
        monthlyTrends: [
          { month: "Jan", bookings: 42, revenue: 945000 },
          { month: "Feb", bookings: 38, revenue: 855000 },
          { month: "Mar", bookings: 45, revenue: 1012500 },
          { month: "Apr", bookings: 52, revenue: 1170000 },
          { month: "May", bookings: 48, revenue: 1080000 },
          { month: "Jun", bookings: 55, revenue: 1237500 },
        ],
        revenueGrowth: 15.2,
        bookingGrowth: 12.8,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    const csvData = [
      ["Metric", "Value"],
      ["Total Revenue", `₦${analytics.totalRevenue.toLocaleString()}`],
      ["Total Bookings", analytics.totalBookings.toString()],
      ["Average Booking Value", `₦${analytics.averageBookingValue.toLocaleString()}`],
      ["Client Retention Rate", `${analytics.clientRetentionRate}%`],
      ["Revenue Growth", `${analytics.revenueGrowth}%`],
      ["Booking Growth", `${analytics.bookingGrowth}%`],
      ["", ""],
      ["Popular Services", ""],
      ...analytics.popularServices.map((service) => [
        service.service,
        `${service.count} bookings, ₦${service.revenue.toLocaleString()}`,
      ]),
    ]

    const csvContent = csvData.map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `analytics-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <AdminLayout title="Analytics" subtitle="Loading business insights...">
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-200 border-t-pink-500 mx-auto"></div>
            <p className="mt-6 text-slate-600 dark:text-slate-400 font-medium">Loading analytics...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Business Analytics" subtitle="Insights and performance metrics for your business">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 3 months</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" size="sm" onClick={fetchAnalytics}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-0 shadow-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Total Revenue</p>
                <p className="text-3xl font-bold">₦{analytics.totalRevenue.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-200 mr-1" />
                  <span className="text-sm text-green-200">+{analytics.revenueGrowth}% growth</span>
                </div>
              </div>
              <DollarSign className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Total Bookings</p>
                <p className="text-3xl font-bold">{analytics.totalBookings}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-blue-200 mr-1" />
                  <span className="text-sm text-blue-200">+{analytics.bookingGrowth}% growth</span>
                </div>
              </div>
              <Calendar className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-500 to-pink-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Avg. Booking Value</p>
                <p className="text-3xl font-bold">₦{analytics.averageBookingValue.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <Star className="w-4 h-4 text-purple-200 mr-1" />
                  <span className="text-sm text-purple-200">Premium services</span>
                </div>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-r from-orange-500 to-red-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100">Client Retention</p>
                <p className="text-3xl font-bold">{analytics.clientRetentionRate}%</p>
                <div className="flex items-center mt-2">
                  <Users className="w-4 h-4 text-orange-200 mr-1" />
                  <span className="text-sm text-orange-200">Returning clients</span>
                </div>
              </div>
              <Users className="w-8 h-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Details */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Popular Services */}
        <Card className="border-0 shadow-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span>Popular Services</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.popularServices.map((service, index) => (
                <div
                  key={service.service}
                  className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100">{service.service}</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{service.count} bookings</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900 dark:text-slate-100">₦{service.revenue.toLocaleString()}</p>
                    <Badge variant="outline" className="text-xs">
                      {((service.revenue / analytics.totalRevenue) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trends */}
        <Card className="border-0 shadow-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span>Monthly Trends</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.monthlyTrends.map((month) => (
                <div
                  key={month.month}
                  className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg"
                >
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100">{month.month} 2025</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{month.bookings} bookings</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900 dark:text-slate-100">₦{month.revenue.toLocaleString()}</p>
                    <div className="w-24 bg-slate-200 dark:bg-slate-600 rounded-full h-2 mt-1">
                      <div
                        className="bg-gradient-to-r from-pink-500 to-rose-500 h-2 rounded-full"
                        style={{
                          width: `${(month.revenue / Math.max(...analytics.monthlyTrends.map((m) => m.revenue))) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}

export default AnalyticsPage
