"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, AlertCircle, CheckCircle } from "lucide-react"

interface AddBookingModalProps {
  isOpen: boolean
  onClose: () => void
  onBookingAdded: () => void
}

export function AddBookingModal({ isOpen, onClose, onBookingAdded }: AddBookingModalProps) {
  const [formData, setFormData] = useState({
    clientName: "",
    phone: "",
    email: "",
    service: "",
    date: "",
    time: "",
    amount: "",
    notes: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const services = [
    { name: "Classic Lashes", price: 15000 },
    { name: "Hybrid Lashes", price: 20000 },
    { name: "Volume Lashes", price: 25000 },
    { name: "Mega Volume Lashes", price: 30000 },
    { name: "Microblading", price: 40000 },
    { name: "Ombré Brows", price: 45000 },
    { name: "Combo Brows", price: 50000 },
    { name: "Microshading", price: 55000 },
    { name: "Brow Lamination", price: 15000 },
    { name: "Brow Lamination & Tint", price: 25000 },
    { name: "Lash Refill (2 weeks)", price: 12000 },
    { name: "Lash Refill (3 weeks)", price: 15000 },
  ]

  const timeSlots = ["9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM"]

  const handleServiceChange = (service: string) => {
    const selectedService = services.find((s) => s.name === service)
    setFormData({
      ...formData,
      service,
      amount: selectedService ? selectedService.price.toString() : "",
    })
    setError("")
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
    setError("")
  }

  const validateForm = () => {
    if (!formData.clientName.trim()) {
      setError("Client name is required")
      return false
    }
    if (!formData.phone.trim()) {
      setError("Phone number is required")
      return false
    }
    if (!formData.email.trim()) {
      setError("Email address is required")
      return false
    }
    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address")
      return false
    }
    if (!formData.service) {
      setError("Please select a service")
      return false
    }
    if (!formData.date) {
      setError("Please select a date")
      return false
    }
    if (!formData.time) {
      setError("Please select a time")
      return false
    }
    if (!formData.amount || Number.parseFloat(formData.amount) <= 0) {
      setError("Please enter a valid amount")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      console.log("Submitting booking data:", formData)

      const response = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()
      console.log("API Response:", result)

      if (result.success) {
        setSuccess("Booking created successfully!")
        onBookingAdded()

        // Reset form
        setFormData({
          clientName: "",
          phone: "",
          email: "",
          service: "",
          date: "",
          time: "",
          amount: "",
          notes: "",
        })

        // Close modal after a short delay
        setTimeout(() => {
          onClose()
          setSuccess("")
        }, 1500)
      } else {
        setError(result.error || "Failed to create booking")
        console.error("Booking creation failed:", result)
      }
    } catch (error) {
      console.error("Error creating booking:", error)
      setError("Network error. Please check your connection and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      clientName: "",
      phone: "",
      email: "",
      service: "",
      date: "",
      time: "",
      amount: "",
      notes: "",
    })
    setError("")
    setSuccess("")
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Add New Booking</CardTitle>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-green-700 text-sm">{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientName">Client Name *</Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) => handleInputChange("clientName", e.target.value)}
                  placeholder="Enter client's full name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="08012345678"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="client@example.com"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="service">Service *</Label>
                <Select value={formData.service} onValueChange={handleServiceChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.name} value={service.name}>
                        {service.name} - ₦{service.price.toLocaleString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="amount">Amount (₦) *</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => handleInputChange("amount", e.target.value)}
                  placeholder="15000"
                  min="0"
                  step="1000"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>
              <div>
                <Label htmlFor="time">Time *</Label>
                <Select value={formData.time} onValueChange={(time) => handleInputChange("time", time)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Any special notes or requirements..."
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-pink-500 hover:bg-pink-600">
                {isLoading ? "Creating..." : "Create Booking"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
