import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Clock, CreditCard, AlertTriangle, RefreshCw, Users } from "lucide-react"

export default function PoliciesPage() {
  const policies = [
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Booking & Scheduling",
      content: [
        "All appointments must be booked in advance through our booking system",
        "A 50% deposit is required to secure your appointment",
        "Appointments are confirmed once deposit is received",
        "We operate Monday to Saturday, 9 AM to 6 PM",
        "Sunday appointments available by special request",
      ],
    },
    {
      icon: <RefreshCw className="w-6 h-6" />,
      title: "Cancellation & Rescheduling",
      content: [
        "24+ hours notice: Full refund of deposit",
        "12-24 hours notice: 50% deposit retention",
        "Less than 12 hours notice: Full deposit forfeiture",
        "No-shows: Full deposit forfeiture",
        "Rescheduling allowed up to 24 hours before appointment",
      ],
    },
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: "Payment Policy",
      content: [
        "50% deposit required at booking",
        "Remaining balance due at appointment",
        "Accepted payments: Paystack, Flutterwave, Bank Transfer, Cash",
        "No refunds after service completion",
        "Touch-up sessions must be paid in full",
      ],
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Health & Safety",
      content: [
        "Please arrive with a clean face (no makeup around treatment area)",
        "Inform us of any allergies or skin sensitivities",
        "Avoid alcohol and caffeine 24 hours before appointment",
        "Do not take blood thinners before treatment",
        "Pregnant/nursing clients: consultation required",
      ],
    },
    {
      icon: <AlertTriangle className="w-6 h-6" />,
      title: "Aftercare Requirements",
      content: [
        "Follow all provided aftercare instructions",
        "Avoid water on treated area for 24-48 hours",
        "No makeup on treated area during healing",
        "Avoid sun exposure and tanning for 2 weeks",
        "Do not pick or scratch treated area",
      ],
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Client Responsibilities",
      content: [
        "Arrive on time for your appointment",
        "Disclose all relevant medical information",
        "Follow pre-care and aftercare instructions",
        "Communicate any concerns immediately",
        "Respect studio policies and other clients",
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-rose-50 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-pink-100 dark:bg-pink-900/50 rounded-full">
              <Shield className="w-12 h-12 text-pink-500" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-pink-500 mb-6">Policies</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Please review our policies to ensure a smooth and professional experience for all clients.
          </p>
        </div>

        {/* Policies Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {policies.map((policy, index) => (
            <Card key={index} className="border-pink-200 dark:border-pink-700 dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3 text-xl text-gray-800 dark:text-gray-100">
                  <div className="p-2 bg-pink-100 dark:bg-pink-900/50 rounded-full text-pink-500">{policy.icon}</div>
                  <span>{policy.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {policy.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-600 dark:text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Important Notice */}
        <Card className="border-pink-200 dark:border-pink-700 bg-pink-50 dark:bg-gray-800 mb-8">
          <CardContent className="p-8">
            <div className="flex items-start space-x-4">
              <AlertTriangle className="w-8 h-8 text-pink-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">Important Notice</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  By booking an appointment, you acknowledge that you have read, understood, and agree to abide by all
                  policies listed above. These policies are in place to ensure the safety, satisfaction, and
                  professional experience of all clients.
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  If you have any questions about our policies, please don't hesitate to contact us before booking your
                  appointment.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact for Questions */}
        <Card className="border-pink-200 dark:border-pink-700 dark:bg-gray-800">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Questions About Our Policies?</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              We're here to help clarify any questions you may have about our policies or procedures.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#"
                className="inline-flex items-center justify-center px-6 py-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
              >
                WhatsApp Us
              </a>
              <a
                href="#"
                className="inline-flex items-center justify-center px-6 py-3 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors"
              >
                Send Message
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
