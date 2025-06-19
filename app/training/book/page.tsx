"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSearchParams } from "next/navigation"
import { LuCalendar, LuClock, LuCreditCard, LuMessageSquare, LuInfo, LuX, LuGraduationCap } from "react-icons/lu"

interface TrainingCourse {
  name: string
  price: string
  duration: string
  level: string
  materials: string
}

export default function TrainingBookingPage() {
  const searchParams = useSearchParams()

  // Form state
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    notes: "",
  })

  const trainingCourses: TrainingCourse[] = [
    {
      name: "7 Days Lash Course",
      price: "140,000",
      duration: "1 Week",
      level: "Beginner",
      materials: "WITH basic materials",
    },
    {
      name: "7 Days Brow Course",
      price: "175,000",
      duration: "1 Week",
      level: "Beginner",
      materials: "WITH basic materials",
    },
    {
      name: "2 Weeks Lash Course",
      price: "180,000",
      duration: "2 Weeks",
      level: "Beginner to Intermediate",
      materials: "Basic materials included",
    },
    {
      name: "2 Weeks Brow Course",
      price: "280,000",
      duration: "2 Weeks",
      level: "Beginner to Intermediate",
      materials: "Basic materials included",
    },
    {
      name: "2 Weeks Lash & Brows Combined",
      price: "300,000",
      duration: "2 Weeks",
      level: "Beginner to Intermediate",
      materials: "WITH basic materials",
    },
    {
      name: "1 Month Lash & Brows",
      price: "450,000",
      duration: "4 Weeks",
      level: "Beginner to Advanced",
      materials: "WITH basic materials",
    },
    {
      name: "Brow Lamination & Tint",
      price: "40,000",
      duration: "2 Days",
      level: "Beginner",
      materials: "Studio materials only",
    },
    {
      name: "5 Days Upgrade Lash Course",
      price: "50,000",
      duration: "5 Days",
      level: "Intermediate",
      materials: "Studio materials only",
    },
    {
      name: "5 Days Upgrade Brow Course",
      price: "80,000",
      duration: "5 Days",
      level: "Intermediate",
      materials: "Studio materials only",
    },
  ]

  // Load pre-selected course from URL params
  useEffect(() => {
    const preSelectedCourse = searchParams.get("course")
    if (preSelectedCourse && trainingCourses.find((c) => c.name === preSelectedCourse)) {
      setSelectedCourses([preSelectedCourse])
    }
  }, [])

  const getTotalPrice = (): number => {
    try {
      let totalPrice = 0
      selectedCourses.forEach((courseName) => {
        const course = trainingCourses.find((c) => c.name === courseName)
        if (course) {
          totalPrice += Number.parseInt(course.price.replace(/,/g, ""), 10)
        }
      })
      return totalPrice
    } catch {
      return 0
    }
  }

  const getDepositAmount = (): number => {
    try {
      return Math.floor(getTotalPrice() / 2)
    } catch {
      return 0
    }
  }

  const getMinDate = (): string => {
    try {
      return new Date().toISOString().split("T")[0]
    } catch {
      return ""
    }
  }

  const handleCourseAdd = (courseName: string) => {
    if (!selectedCourses.includes(courseName)) {
      setSelectedCourses((prev) => [...prev, courseName])
    }
  }

  const handleCourseRemove = (courseName: string) => {
    setSelectedCourses((prev) => prev.filter((name) => name !== courseName))
  }

  const getAvailableCourses = () => {
    return trainingCourses.filter((course) => !selectedCourses.includes(course.name))
  }

  const validateForm = (): boolean => {
    try {
      if (selectedCourses.length === 0) {
        alert("Please select at least one training course")
        return false
      }
      if (!selectedDate) {
        alert("Please select your preferred start date")
        return false
      }
      if (!formData.name.trim()) {
        alert("Please enter your full name")
        return false
      }
      if (!formData.phone.trim()) {
        alert("Please enter your phone number")
        return false
      }

      console.log("✅ Form validation passed - proceeding with WhatsApp booking")
      return true
    } catch (error) {
      console.error("Validation error:", error)
      alert("Please check your booking details and try again.")
      return false
    }
  }

  const handleWhatsAppBooking = () => {
    if (!validateForm()) return

    const depositAmount = getDepositAmount()
    const totalPrice = getTotalPrice()

    // Create detailed course breakdown
    const courseDetails = selectedCourses
      .map((courseName) => {
        const course = trainingCourses.find((c) => c.name === courseName)
        return `• ${courseName} - ₦${course?.price} (${course?.duration}, ${course?.level})`
      })
      .join("\n")

    const message = `🎓 NEW TRAINING ENROLLMENT REQUEST 🎓

👤 STUDENT DETAILS:
Name: ${formData.name}
Phone: ${formData.phone}${formData.email ? `\nEmail: ${formData.email}` : ""}

📚 TRAINING COURSES REQUESTED:
${courseDetails}

📅 TRAINING DETAILS:
Preferred Start Date: ${new Date(selectedDate + "T12:00:00Z").toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })}
Training Schedule: Monday-Friday, 10:00 AM daily

💰 PRICING:
Total Training Cost: ₦${totalPrice.toLocaleString()}
Required Deposit (50%): ₦${depositAmount.toLocaleString()}
Balance Due: ₦${(totalPrice - depositAmount).toLocaleString()}

📋 PAYMENT OPTIONS:
• Installments accepted (must complete within first week)
• Paystack, Flutterwave, and Bank Transfer accepted${formData.notes ? `\n\n📝 SPECIAL NOTES:\n${formData.notes}` : ""}

Please confirm enrollment and send payment instructions for the deposit. Thank you! 💕`

    // Use the correct WhatsApp number format
    const whatsappUrl = `https://wa.me/2348165435528?text=${encodeURIComponent(message)}`

    console.log("Opening WhatsApp with message:", message)
    console.log("WhatsApp URL:", whatsappUrl)

    // Open in new window/tab
    const newWindow = window.open(whatsappUrl, "_blank")

    // Fallback if popup blocked
    if (!newWindow) {
      window.location.href = whatsappUrl
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-rose-50 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-pink-500 mb-4">Enroll in Training</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Select your training courses and secure your spot with a 50% deposit.
          </p>
        </div>

        {/* Training Policies */}
        <Card className="border-pink-200 dark:border-pink-700 bg-pink-50 dark:bg-gray-800 mb-8">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <LuInfo className="w-6 h-6 text-pink-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
                  Important Training Policies
                </h3>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li>
                    • <strong>Schedule:</strong> Classes run Monday-Friday at 10:00 AM daily.
                  </li>
                  <li>
                    • <strong>Deposit:</strong> 50% non-refundable deposit required to secure your spot.
                  </li>
                  <li>
                    • <strong>Payment:</strong> Full payment must be completed within the first week of training.
                  </li>
                  <li>
                    • <strong>Class Size:</strong> Limited spots available (6-8 students max per class).
                  </li>
                  <li>
                    • <strong>Materials:</strong> Varies by course - check individual course details.
                  </li>
                  <li>
                    • <strong>Certification:</strong> Official certificate provided upon successful completion.
                  </li>
                  <li>
                    • <strong>Support:</strong> 30 days WhatsApp support + 6 months mentorship included.
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Enrollment Form */}
          <div className="lg:col-span-2">
            <Card className="border-pink-200 dark:border-pink-700 dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-800 dark:text-gray-100 flex items-center space-x-2">
                  <LuGraduationCap className="w-6 h-6 text-pink-500" />
                  <span>Enrollment Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Course Selection */}
                <div>
                  <Label className="text-base font-medium text-gray-900 dark:text-gray-100">
                    Select Training Course(s) *
                  </Label>

                  {/* Selected Courses Display */}
                  {selectedCourses.length > 0 && (
                    <div className="mt-2 mb-3">
                      <div className="flex flex-wrap gap-2">
                        {selectedCourses.map((courseName) => {
                          const course = trainingCourses.find((c) => c.name === courseName)
                          return (
                            <div
                              key={courseName}
                              className="flex items-center space-x-2 bg-pink-100 dark:bg-pink-900/20 text-pink-800 dark:text-pink-200 px-3 py-1 rounded-full text-sm"
                            >
                              <span>
                                {courseName} - ₦{course?.price}
                              </span>
                              <button
                                onClick={() => handleCourseRemove(courseName)}
                                className="hover:bg-pink-200 dark:hover:bg-pink-800 rounded-full p-1"
                              >
                                <LuX className="w-3 h-3" />
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Course Dropdown */}
                  <Select onValueChange={handleCourseAdd}>
                    <SelectTrigger className="mt-2">
                      <SelectValue
                        placeholder={
                          selectedCourses.length === 0 ? "Choose your first course" : "Add another course (optional)"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableCourses().map((course) => (
                        <SelectItem key={course.name} value={course.name}>
                          {course.name} - ₦{course.price} ({course.duration})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Preferred Start Date */}
                <div>
                  <Label className="text-base font-medium text-gray-900 dark:text-gray-100">
                    Preferred Start Date *
                  </Label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="mt-2"
                    min={getMinDate()}
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Training runs Monday-Friday, 10:00 AM daily. We'll confirm availability and schedule.
                  </p>
                </div>

                {/* Personal Information */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-base font-medium text-gray-900 dark:text-gray-100">Full Name *</Label>
                    <Input
                      placeholder="Your full name"
                      className="mt-2"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label className="text-base font-medium text-gray-900 dark:text-gray-100">Phone Number *</Label>
                    <Input
                      placeholder="+234 XXX XXX XXXX"
                      className="mt-2"
                      value={formData.phone}
                      onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium text-gray-900 dark:text-gray-100">Email Address</Label>
                  <Input
                    type="email"
                    placeholder="your.email@example.com"
                    className="mt-2"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  />
                </div>

                <div>
                  <Label className="text-base font-medium text-gray-900 dark:text-gray-100">Special Notes</Label>
                  <Textarea
                    placeholder="Any questions, special requests, or previous experience you'd like to mention"
                    className="mt-2"
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enrollment Summary */}
          <div>
            <Card className="border-pink-200 dark:border-pink-700 dark:bg-gray-800 sticky top-8">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800 dark:text-gray-100">Enrollment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedCourses.length > 0 && (
                  <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg border dark:border-pink-800">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-100">Selected Courses</h4>
                    <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-300">
                      {selectedCourses.map((courseName) => {
                        const course = trainingCourses.find((c) => c.name === courseName)
                        return (
                          <li key={courseName}>
                            {courseName} - ₦{course?.price}
                            <div className="text-xs text-gray-500">
                              {course?.duration} • {course?.level}
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                    <p className="text-lg font-bold text-pink-500 dark:text-pink-400 mt-3">
                      Total Cost: ₦{getTotalPrice().toLocaleString()}
                    </p>
                  </div>
                )}

                {selectedDate && (
                  <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                    <LuCalendar className="w-4 h-4" />
                    <span>
                      Start:{" "}
                      {new Date(selectedDate + "T12:00:00Z").toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                )}

                <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                  <LuClock className="w-4 h-4" />
                  <span>Monday-Friday, 10:00 AM</span>
                </div>

                <div className="border-t dark:border-gray-700 pt-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300 mb-2">
                    <LuCreditCard className="w-4 h-4" />
                    <span>50% deposit required (non-refundable)</span>
                  </div>
                  {selectedCourses.length > 0 && (
                    <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
                      Deposit: ₦{getDepositAmount().toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Enrollment Button */}
                <div className="space-y-3">
                  <Button
                    className="w-full bg-pink-500 hover:bg-pink-600 text-white"
                    disabled={
                      selectedCourses.length === 0 || !selectedDate || !formData.name || !formData.phone || isProcessing
                    }
                    onClick={handleWhatsAppBooking}
                  >
                    {isProcessing ? "Processing..." : "Enroll via WhatsApp"}
                  </Button>
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  <p>Contact us via WhatsApp to confirm enrollment</p>
                  <p>and arrange payment details</p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Card */}
            <Card className="border-pink-200 dark:border-pink-700 dark:bg-gray-800 mt-6">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 text-pink-500 dark:text-pink-400 mb-2">
                  <LuMessageSquare className="w-5 h-5" />
                  <span className="font-medium">Need Help?</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  Have questions about training? Contact us directly.
                </p>
                <a href="https://wa.me/message/X5M2NOA553NGK1" target="_blank" rel="noopener noreferrer">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-pink-300 dark:border-pink-700 text-pink-600 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/20"
                  >
                    WhatsApp Us
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
