import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, DollarSign, Sparkles, Eye, Brush } from "lucide-react"
import Link from "next/link"

export default function ServicesPage() {
  const services = {
    brows: [
      {
        name: "Microblading",
        price: "40,000",
        duration: "2.5 hours",
        description:
          "Hair-like strokes that create natural-looking brows. Ideal for those who want a more defined brow shape.",
        icon: <Eye className="w-6 h-6" />,
      },
      {
        name: "Ombré Brows",
        price: "45,000",
        duration: "2.5 hours",
        description:
          "A soft, powdered brow look that's darker at the tail and lighter at the front. Perfect for all skin types and lasts 1-2 years.",
        icon: <Brush className="w-6 h-6" />,
      },
      {
        name: "Combo Brows",
        price: "50,000",
        duration: "3 hours",
        description: "Combination of microblading and shading for the most natural and full-looking brows.",
        icon: <Sparkles className="w-6 h-6" />,
      },
      {
        name: "Microshading",
        price: "55,000",
        duration: "2.5 hours",
        description:
          "Perfect for all skin types. A soft, powdered brow look created with machine technique. Lasts 1-2 years.",
        icon: <Brush className="w-6 h-6" />,
      },
      {
        name: "Brow Lamination",
        price: "15,000",
        duration: "1 hour",
        description:
          "Straightens and lifts brow hairs for a fuller, more defined look. Perfect for unruly or sparse brows.",
        icon: <Eye className="w-6 h-6" />,
      },
      {
        name: "Brow Lamination & Tint",
        price: "25,000",
        duration: "1.5 hours",
        description: "Combination of brow lamination with tinting for enhanced color and definition.",
        icon: <Sparkles className="w-6 h-6" />,
      },
    ],
    lashes: [
      {
        name: "Classic Set",
        price: "15,000",
        duration: "2 hours",
        description: "One extension per natural lash for a natural, mascara-like effect. Perfect for everyday wear.",
        icon: <Eye className="w-6 h-6" />,
      },
      {
        name: "Hybrid Set",
        price: "20,000",
        duration: "2.5 hours",
        description: "Mix of classic and volume techniques for textured, natural-looking fullness.",
        icon: <Brush className="w-6 h-6" />,
      },
      {
        name: "Volume Set",
        price: "25,000",
        duration: "2.5 hours",
        description: "Multiple lightweight extensions per natural lash for dramatic, full lashes.",
        icon: <Sparkles className="w-6 h-6" />,
      },
      {
        name: "Mega Volume Set",
        price: "30,000",
        duration: "3 hours",
        description: "Maximum volume and drama with ultra-fine extensions for the boldest look.",
        icon: <Sparkles className="w-6 h-6" />,
      },
    ],
    addons: [
      {
        name: "Wispy Effect",
        price: "3,000",
        duration: "30 mins",
        description: "Add wispy, fluttery effect to any lash set for extra texture.",
        icon: <Eye className="w-6 h-6" />,
      },
      {
        name: "Full Effect",
        price: "2,000",
        duration: "20 mins",
        description: "Enhance fullness across the entire lash line.",
        icon: <Sparkles className="w-6 h-6" />,
      },
      {
        name: "Bottom Lashes",
        price: "6,000",
        duration: "45 mins",
        description: "Extensions for bottom lashes to complete your look.",
        icon: <Eye className="w-6 h-6" />,
      },
      {
        name: "Lash Removal",
        price: "4,000",
        duration: "30 mins",
        description: "Safe and gentle removal of existing lash extensions.",
        icon: <Brush className="w-6 h-6" />,
      },
    ],
    touchups: [
      {
        name: "Brow Touch-Up (2-4 months) - Done by Deedee",
        price: "25,000",
        duration: "1.5 hours",
        description: "Refresh and perfect your brows within 2-4 months if originally done by Lashed by Deedee.",
        icon: <Brush className="w-6 h-6" />,
      },
      {
        name: "Brow Touch-Up (2-4 months) - Not done by Deedee",
        price: "30,000",
        duration: "2 hours",
        description: "Touch-up service for brows not originally done by Lashed by Deedee (2-4 months).",
        icon: <Brush className="w-6 h-6" />,
      },
      {
        name: "Brow Touch-Up (5-9 months) - Done by Deedee",
        price: "30,000",
        duration: "2 hours",
        description: "Refresh and perfect your brows within 5-9 months if originally done by Lashed by Deedee.",
        icon: <Brush className="w-6 h-6" />,
      },
      {
        name: "Brow Touch-Up (5-9 months) - Not done by Deedee",
        price: "35,000",
        duration: "2.5 hours",
        description: "Touch-up service for brows not originally done by Lashed by Deedee (5-9 months).",
        icon: <Brush className="w-6 h-6" />,
      },
    ],
  }

  const ServiceCard = ({ service }: { service: any }) => (
    <Card className="hover:shadow-lg transition-shadow border-pink-200 dark:border-pink-700 dark:bg-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-pink-100 dark:bg-pink-900/50 rounded-full text-pink-500 dark:text-pink-400">
              {service.icon}
            </div>
            <CardTitle className="text-xl text-gray-800 dark:text-gray-100">{service.name}</CardTitle>
          </div>
          <Badge variant="secondary" className="bg-pink-100 dark:bg-pink-900/50 text-pink-700 dark:text-pink-300">
            ₦{service.price}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 dark:text-gray-300 mb-4">{service.description}</p>
        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{service.duration}</span>
          </div>
          <div className="flex items-center space-x-1">
            <DollarSign className="w-4 h-4" />
            <span>50% deposit required</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-rose-50 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-pink-500 mb-4">Our Services</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Professional lash and brow services designed to enhance your natural beauty with precision and care.
          </p>
        </div>

        {/* Brows Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8 text-center">Brow Services</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.brows.map((service, index) => (
              <ServiceCard key={index} service={service} />
            ))}
          </div>
        </section>

        {/* Lashes Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8 text-center">Lash Services</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.lashes.map((service, index) => (
              <ServiceCard key={index} service={service} />
            ))}
          </div>
        </section>

        {/* Add-ons Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8 text-center">Add-ons & Extras</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.addons.map((service, index) => (
              <ServiceCard key={index} service={service} />
            ))}
          </div>
        </section>

        {/* Touch-ups Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8 text-center">
            Touch-ups & Maintenance
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {services.touchups.map((service, index) => (
              <ServiceCard key={index} service={service} />
            ))}
          </div>
        </section>

        {/* Infill Pricing Info */}
        <section className="mb-16">
          <Card className="border-pink-200 dark:border-pink-700 bg-pink-50 dark:bg-gray-800">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Lash Infill Pricing</h3>
              <div className="grid md:grid-cols-2 gap-6 text-left">
                <div className="bg-white dark:bg-gray-700 p-6 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">2 Weeks Infills</h4>
                  <p className="text-gray-600 dark:text-gray-300 mb-2">50% of the full set price</p>
                  <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                    <li>• Classic: ₦7,500</li>
                    <li>• Hybrid: ₦10,000</li>
                    <li>• Volume: ₦12,500</li>
                    <li>• Mega Volume: ₦15,000</li>
                  </ul>
                </div>
                <div className="bg-white dark:bg-gray-700 p-6 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">3 Weeks Infills</h4>
                  <p className="text-gray-600 dark:text-gray-300 mb-2">70% of the full set price</p>
                  <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                    <li>• Classic: ₦10,500</li>
                    <li>• Hybrid: ₦14,000</li>
                    <li>• Volume: ₦17,500</li>
                    <li>• Mega Volume: ₦21,000</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg border border-pink-200 dark:border-pink-700">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Ready to Book?</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Select your service and secure your appointment with a 50% deposit. Payment accepted via Paystack,
            Flutterwave, or bank transfer.
          </p>
          <Link href="/book">
            <Button size="lg" className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-full">
              Book Your Appointment
            </Button>
          </Link>
        </section>
      </div>
    </div>
  )
}
