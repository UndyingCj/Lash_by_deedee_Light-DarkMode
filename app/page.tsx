import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Star, Heart, Sparkles } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-rose-50 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="flex items-center space-x-2 text-pink-500">
              <Sparkles className="w-8 h-8" />
              <Heart className="w-6 h-6" />
              <Sparkles className="w-8 h-8" />
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 dark:text-white mb-6">
            Welcome to <span className="text-pink-500">Lashed by Deedee</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 font-light">
            Where Beauty Meets Precision
          </p>

          {/* Hero Image Placeholder */}
          <div className="max-w-2xl mx-auto mb-8">
            <Card className="overflow-hidden shadow-lg border-pink-200 dark:border-pink-800 dark:bg-gray-800">
              <CardContent className="p-0">
                <div className="aspect-video bg-gradient-to-br from-pink-100 to-rose-100 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-4 bg-pink-200 dark:bg-pink-800 rounded-full flex items-center justify-center">
                      <Sparkles className="w-12 h-12 text-pink-500" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 font-medium">Beautiful Lash & Brow Work</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Showcase your best transformations here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Link href="/book">
            <Button
              size="lg"
              className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Book an Appointment
            </Button>
          </Link>
        </div>
      </section>

      {/* Quick About Section */}
      <section className="py-16 px-4 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-pink-500 mb-6">About Me</h2>
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-6">
                Hi, I'm Deedee! I specialize in high-precision lash and brow services in a cozy home studio in
                Rumuodara, Port Harcourt. With years of experience and an eye for detail, I ensure every client leaves
                confident and glowing.
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <span className="text-gray-600 dark:text-gray-400">Trusted by 200+ clients</span>
              </div>
            </div>
            <div className="flex justify-center">
              <Card className="overflow-hidden shadow-lg border-pink-200 dark:border-pink-800 dark:bg-gray-800">
                <CardContent className="p-0">
                  <div className="aspect-square bg-gradient-to-br from-pink-100 to-rose-100 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center w-80">
                    <div className="text-center">
                      <div className="w-32 h-32 mx-auto mb-4 bg-pink-200 dark:bg-pink-800 rounded-full flex items-center justify-center">
                        <Heart className="w-16 h-16 text-pink-500" />
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 font-medium">Your Photo Here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-pink-500 mb-12">Our Services</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Ombré Brows", price: "45,000", duration: "2.5 hours" },
              { name: "Classic Lashes", price: "15,000", duration: "2 hours" },
              { name: "Volume Lashes", price: "25,000", duration: "2.5 hours" },
            ].map((service, index) => (
              <Card
                key={index}
                className="hover:shadow-lg transition-shadow border-pink-200 dark:border-pink-700 dark:bg-gray-800"
              >
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-pink-100 dark:bg-pink-900/50 rounded-full flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-pink-500 dark:text-pink-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">{service.name}</h3>
                  <p className="text-2xl font-bold text-pink-500 dark:text-pink-400 mb-1">₦{service.price}</p>
                  <p className="text-gray-600 dark:text-gray-300">{service.duration}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/services">
              <Button
                variant="outline"
                className="border-pink-300 text-pink-600 hover:bg-pink-50 dark:border-pink-700 dark:text-pink-400 dark:hover:bg-pink-950"
              >
                View All Services
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
