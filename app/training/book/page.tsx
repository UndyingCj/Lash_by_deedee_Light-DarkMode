"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSearchParams } from "next/navigation"
import { LuCreditCard, LuInfo, LuX, LuGraduationCap, LuPackage } from "react-icons/lu"

interface TrainingCourse {
  name: string
  price: string
  duration: string
  level: string
  materials: string
}

export default function TrainingBookingPage() {
  /* ---------- state ---------- */
  const searchParams = useSearchParams()
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    notes: "",
  })

  /* ---------- data ---------- */
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
      materials: "Materials are not included",
    },
    {
      name: "5 Days Upgrade Brow Course",
      price: "80,000",
      duration: "5 Days",
      level: "Intermediate",
      materials: "Materials are not included",
    },
  ]

  /* ---------- URL pre-selection (run once) ---------- */
  useEffect(() => {
    const c = searchParams.get("course")
    if (c && trainingCourses.find((t) => t.name === c)) setSelectedCourses([c])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ---------- helpers ---------- */
  const getTotal = () =>
    selectedCourses.reduce((sum, n) => {
      const course = trainingCourses.find((c) => c.name === n)
      return sum + (course ? Number(course.price.replace(/,/g, "")) : 0)
    }, 0)

  const minDate = new Date().toISOString().split("T")[0]

  const addCourse = (name: string) => !selectedCourses.includes(name) && setSelectedCourses((p) => [...p, name])

  const removeCourse = (name: string) => setSelectedCourses((p) => p.filter((x) => x !== name))

  const available = trainingCourses.filter((c) => !selectedCourses.includes(c.name))

  /* ---------- submit ---------- */
  const onSubmit = () => {
    if (!selectedCourses.length) return alert("Please select at least one course.")
    if (!selectedDate) return alert("Choose a start date.")
    if (!formData.name.trim()) return alert("Enter your name.")
    if (!formData.phone.trim()) return alert("Enter your phone number.")

    const breakdown = selectedCourses
      .map((n) => {
        const c = trainingCourses.find((x) => x.name === n)!
        return `• ${n} - ₦${c.price} (${c.duration}, ${c.level})`
      })
      .join("\n")

    const total = getTotal()
    const deposit = Math.floor(total / 2)

    const msg = `🎓 NEW TRAINING ENROLLMENT 🎓

👤 ${formData.name}
📞 ${formData.phone}${formData.email ? `\n✉️ ${formData.email}` : ""}

${breakdown}

📅 Preferred Start: ${new Date(selectedDate).toDateString()}
💰 Total: ₦${total.toLocaleString()}
🔒 Deposit (50%): ₦${deposit.toLocaleString()}

${formData.notes ? `📝 Notes:\n${formData.notes}\n` : ""}Please confirm my enrollment. Thanks!`

    window.open(`https://wa.me/2348165435528?text=${encodeURIComponent(msg)}`, "_blank")
  }

  /* ---------- UI ---------- */
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-rose-50 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* header */}
        <h1 className="text-4xl font-bold text-center text-pink-500 mb-10">Enroll in Training</h1>

        {/* left = form  */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* course picker */}
            <Card className="dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LuGraduationCap className="text-pink-500" /> Course Selection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {!!selectedCourses.length && (
                  <div className="flex flex-wrap gap-2">
                    {selectedCourses.map((n) => (
                      <span
                        key={n}
                        className="bg-pink-100 dark:bg-pink-900/20 text-pink-800 dark:text-pink-200 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                      >
                        {n}
                        <button onClick={() => removeCourse(n)}>
                          <LuX className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <Select onValueChange={addCourse}>
                  <SelectTrigger>
                    <SelectValue placeholder="Add a training course" />
                  </SelectTrigger>
                  <SelectContent>
                    {available.map((c) => (
                      <SelectItem key={c.name} value={c.name}>
                        {c.name} – ₦{c.price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* date & personal  */}
            <Card className="dark:bg-gray-800">
              <CardHeader>
                <CardTitle>Personal Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Preferred Start Date *</Label>
                  <Input
                    type="date"
                    min={minDate}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Full Name *</Label>
                    <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                  </div>
                  <div>
                    <Label>Phone Number *</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Email (optional)</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* right = summary */}
          <Card className="dark:bg-gray-800 sticky top-8">
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedCourses.map((n) => {
                const c = trainingCourses.find((x) => x.name === n)!
                return (
                  <div key={n} className="border-b pb-2">
                    <p className="font-medium">{n}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {c.duration} • {c.level}
                    </p>
                    <p className="text-sm flex items-center gap-1">
                      <LuPackage className="w-3 h-3" />
                      {c.materials}
                    </p>
                    <p className="font-bold text-pink-500">₦{c.price}</p>
                  </div>
                )
              })}

              {!!selectedCourses.length && (
                <>
                  <div className="border-t pt-4">
                    <p className="flex items-center gap-2 text-sm">
                      <LuCreditCard className="w-4 h-4" /> Deposit&nbsp;
                      <span className="font-bold">₦{Math.floor(getTotal() / 2).toLocaleString()}</span>
                    </p>
                    <p className="font-semibold">Total&nbsp;₦{getTotal().toLocaleString()}</p>
                  </div>
                  <Button className="w-full" onClick={onSubmit}>
                    Enroll via WhatsApp
                  </Button>
                </>
              )}

              {!selectedCourses.length && (
                <p className="text-center text-sm text-gray-500">Select at least one course to continue</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* policies */}
        <Card className="dark:bg-gray-800 mt-12">
          <CardContent className="p-6 flex gap-3">
            <LuInfo className="text-pink-500 w-6 h-6 flex-shrink-0" />
            <ul className="text-sm list-disc pl-4 space-y-1">
              <li>Classes run Monday-Friday at 10 AM.</li>
              <li>50% non-refundable deposit secures your spot.</li>
              <li>Payment plans available – full balance due in the first week.</li>
              <li>6-8 students per class for personalised attention.</li>
              <li>Courses marked "Studio materials only" provide materials during training but not for take-home.</li>
              <li>Courses marked "Materials are not included" require you to bring your own kit.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
