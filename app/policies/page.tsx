import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Clock, CreditCard, AlertTriangle, RefreshCw, Users, Ban } from "lucide-react"

export default function PoliciesPage() {
  const policies = [
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Booking & Scheduling",
      content: [
        "All appointments must be booked in advance through our booking system",
        "A 50% non-refundable deposit is required to secure your appointment",
        "Appointments are confirmed once deposit is received",
        "We operate Monday to Saturday, with available slots at 9am, 11am, 2pm, and 4pm",
        "Each session takes approximately 2-3 hours - please schedule accordingly",
      ],
    },
    {
      icon: <Ban className="w-6 h-6" />,
      title: "Late Arrivals & Punctuality",
      content: [
        "Arrivals more than 1 hour late will result in automatic cancellation",
        "Late appointments will be rescheduled to any other available slot",
        "Your punctuality means a lot to us as late arrivals can disrupt the schedule",
        "Please arrive on time to ensure everyone has the best experience",
        "Lateness fee of ₦2,000 applies for arrivals more than 30 minutes late",
      ],
    },
    {
      icon: <RefreshCw className="w-6 h-6" />,
      title: "Cancellation & Rescheduling",
      content: [
        "24+ hours notice required for cancellations or rescheduling",
        "You can reschedule only ONCE with the original deposit",
        "Failure to attend after booking and rescheduling will forfeit your deposit",
        "After missing twice, you must make a brand new booking with new deposit",
        "Rescheduling is allowed once with the original deposit if notice is given in time",
      ],
    },
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: "Payment & Deposit Policy",
      content: [
        "50% non-refundable deposit required at booking",
        "Deposit secures your spot and is non-refundable in case of cancellations or no-shows",
        "Remaining balance due at appointment",
        "Accepted payments: Paystack, Flutterwave, Bank Transfer, Cash",
        "No refunds after service completion",
      ],
    },
    {
      icon: <AlertTriangle className="w-6 h-6" />,
      title: "No-Shows & Missed Appointments",
      content: [
        "No-shows will result in forfeited deposit",
        "Future bookings will require a new deposit",
        "If you do not show up or fail to notify us, the appointment will be cancelled",
        "The deposit will be forfeited for no-shows",
        "Please notify us as soon as possible if you cannot make your appointment",
      ],
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Health & Safety Requirements",
      content: [
        "Please arrive with a clean face (avoid wearing makeup to ensure best results)",
        "Inform us of any allergies or skin sensitivities",
        "Avoid alcohol and caffeine 24 hours before appointment",
        "Do not take blood thinners before treatment",
        "Pregnant/nursing clients: consultation required",
      ],
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Refills & Maintenance",
      content: [
        "Refills should be done within 2-3 weeks for best outcome",
        "At least 50% of lashes must remain for refill service",
        "2 weeks infills: 50% of full set price",
        "3 weeks infills: 70% of full set price",
        "Beyond 3 weeks may require a new full set",
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
          <h1 className="text-4xl md:text-5xl font-bold text-pink-500 mb-6">Appointment & Booking Policies</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Please review our policies to ensure a smooth and professional experience for all clients.
          </p>
        </div>

        {/* Key Policy Highlights */}
        <Card className="border-pink-200 dark:border-pink-700 bg-pink-50 dark:bg-gray-800 mb-12">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">
              Key Policy Highlights
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <Clock className="w-12 h-12 mx-auto mb-3 text-pink-500" />
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Session Time</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">2-3 hours per session</p>
              </div>
              <div className="text-center">
                <CreditCard className="w-12 h-12 mx-auto mb-3 text-pink-500" />
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Deposit</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">50% non-refundable</p>
              </div>
              <div className="text-center">
                <Ban className="w-12 h-12 mx-auto mb-3 text-pink-500" />
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Late Policy</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">1hr+ late = cancellation</p>
              </div>
              <div className="text-center">
                <RefreshCw className="w-12 h-12 mx-auto mb-3 text-pink-500" />
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Reschedule</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Only once allowed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Policies Grid */}
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
                <div className="bg-white dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Remember:</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <li>• You can only reschedule once with your original deposit</li>
                    <li>• Missing after rescheduling means you forfeit your deposit</li>
                    <li>• Being 1+ hours late results in automatic cancellation and rescheduling</li>
                    <li>• All deposits are non-refundable to secure your appointment slot</li>
                  </ul>
                </div>
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
