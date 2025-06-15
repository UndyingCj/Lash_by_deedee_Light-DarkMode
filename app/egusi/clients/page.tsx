"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Users,
  Search,
  Filter,
  MoreHorizontal,
  Phone,
  Mail,
  Calendar,
  Star,
  Download,
  RefreshCw,
  Eye,
} from "lucide-react"
import { AdminLayout } from "@/components/admin/admin-layout"

interface Client {
  id: number
  name: string
  email: string
  phone: string
  totalBookings: number
  totalSpent: number
  lastVisit: string
  averageRating: number
  preferredServices: string[]
  status: "active" | "inactive" | "vip"
}

const ClientsPage = () => {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/clients")
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setClients(data.data)
        }
      }
    } catch (error) {
      console.error("Error fetching clients:", error)
      // Mock data for demo
      setClients([
        {
          id: 1,
          name: "Sarah Johnson",
          email: "sarah.johnson@email.com",
          phone: "+234 801 234 5678",
          totalBookings: 8,
          totalSpent: 200000,
          lastVisit: "2025-06-10",
          averageRating: 5.0,
          preferredServices: ["Volume Lashes", "Lash Refill"],
          status: "vip",
        },
        {
          id: 2,
          name: "Maria Garcia",
          email: "maria.garcia@email.com",
          phone: "+234 802 345 6789",
          totalBookings: 5,
          totalSpent: 125000,
          lastVisit: "2025-06-08",
          averageRating: 4.8,
          preferredServices: ["Ombré Brows", "Microblading"],
          status: "active",
        },
        {
          id: 3,
          name: "Jennifer Williams",
          email: "jennifer.w@email.com",
          phone: "+234 803 456 7890",
          totalBookings: 12,
          totalSpent: 340000,
          lastVisit: "2025-06-12",
          averageRating: 5.0,
          preferredServices: ["Volume Lashes", "Classic Lashes", "Hybrid Lashes"],
          status: "vip",
        },
        {
          id: 4,
          name: "Lisa Brown",
          email: "lisa.brown@email.com",
          phone: "+234 804 567 8901",
          totalBookings: 3,
          totalSpent: 75000,
          lastVisit: "2025-05-28",
          averageRating: 4.5,
          preferredServices: ["Classic Lashes"],
          status: "active",
        },
        {
          id: 5,
          name: "Amanda Davis",
          email: "amanda.davis@email.com",
          phone: "+234 805 678 9012",
          totalBookings: 1,
          totalSpent: 25000,
          lastVisit: "2025-04-15",
          averageRating: 4.0,
          preferredServices: ["Brow Lamination"],
          status: "inactive",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    const csvData = [
      ["Name", "Email", "Phone", "Total Bookings", "Total Spent", "Last Visit", "Status"],
      ...filteredClients.map((client) => [
        client.name,
        client.email,
        client.phone,
        client.totalBookings.toString(),
        client.totalSpent.toString(),
        client.lastVisit,
        client.status,
      ]),
    ]

    const csvContent = csvData.map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `clients-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "vip":
        return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800"
      case "active":
        return "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
      case "inactive":
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800"
    }
  }

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.includes(searchQuery)
    const matchesStatus = statusFilter === "all" || client.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalClients = clients.length
  const vipClients = clients.filter((c) => c.status === "vip").length
  const activeClients = clients.filter((c) => c.status === "active").length
  const totalRevenue = clients.reduce((sum, client) => sum + client.totalSpent, 0)

  if (loading) {
    return (
      <AdminLayout title="Client Management" subtitle="Loading client data...">
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-200 border-t-pink-500 mx-auto"></div>
            <p className="mt-6 text-slate-600 dark:text-slate-400 font-medium">Loading clients...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Client Management" subtitle="Manage your client relationships and history">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Total Clients</p>
                <p className="text-3xl font-bold">{totalClients}</p>
              </div>
              <Users className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-500 to-pink-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">VIP Clients</p>
                <p className="text-3xl font-bold">{vipClients}</p>
              </div>
              <Star className="w-8 h-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Active Clients</p>
                <p className="text-3xl font-bold">{activeClients}</p>
              </div>
              <Users className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-r from-orange-500 to-red-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100">Total Revenue</p>
                <p className="text-3xl font-bold">₦{totalRevenue.toLocaleString()}</p>
              </div>
              <Star className="w-8 h-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Status: {statusFilter === "all" ? "All" : statusFilter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setStatusFilter("all")}>All Status</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("vip")}>VIP</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("active")}>Active</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("inactive")}>Inactive</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={fetchClients}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Clients List */}
      <Card className="border-0 shadow-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
            All Clients ({filteredClients.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredClients.length === 0 ? (
            <div className="text-center py-16">
              <Users className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">No clients found</h3>
              <p className="text-slate-500 dark:text-slate-400">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Client data will appear here when available"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200/50 dark:divide-slate-700/50">
              {filteredClients.map((client) => (
                <div
                  key={client.id}
                  className="flex flex-col lg:flex-row lg:items-center justify-between p-6 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors group gap-4"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold">
                        {client.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                        {client.name}
                      </h4>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-sm text-slate-500 dark:text-slate-500 mt-1">
                        <span className="flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          {client.email}
                        </span>
                        <span className="hidden sm:block">•</span>
                        <span className="flex items-center">
                          <Phone className="w-4 h-4 mr-1" />
                          {client.phone}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {client.preferredServices.slice(0, 2).map((service) => (
                          <Badge key={service} variant="outline" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                        {client.preferredServices.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{client.preferredServices.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between lg:justify-end space-x-6">
                    <div className="text-center">
                      <p className="text-sm text-slate-500 dark:text-slate-400">Bookings</p>
                      <p className="font-bold text-slate-900 dark:text-slate-100">{client.totalBookings}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-slate-500 dark:text-slate-400">Spent</p>
                      <p className="font-bold text-slate-900 dark:text-slate-100">
                        ₦{client.totalSpent.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-slate-500 dark:text-slate-400">Rating</p>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                        <span className="font-bold text-slate-900 dark:text-slate-100">{client.averageRating}</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-slate-500 dark:text-slate-400">Status</p>
                      <Badge className={`${getStatusColor(client.status)} border font-medium`}>{client.status}</Badge>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Calendar className="mr-2 h-4 w-4" />
                          Book Appointment
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" />
                          Send Message
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  )
}

export default ClientsPage
