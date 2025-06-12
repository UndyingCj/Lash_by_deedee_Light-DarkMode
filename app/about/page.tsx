import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, Heart, Award, Users, Clock, MapPin } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function AboutPage() {
  const achievements = [
    {
      icon: <Users className="w-6 h-6" />,
      title: "200+ Happy Clients",
      description: "Trusted by clients across Port Harcourt",
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Certified Professional",
      description: "Trained in advanced lash & brow techniques",
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "3+ Years Experience",
      description: "Perfecting beauty with precision since 2021",
    },
    { icon: <MapPin className="w-6 h-6" />, title: "Home Studio", description: "Cozy, private space in Rumigbo" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-rose-50 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-pink-100 dark:bg-pink-900/50 rounded-full">
              <Heart className="w-12 h-12 text-pink-500" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-pink-500 mb-6">About Deedee</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Passionate beauty artist dedicated to enhancing your natural features with precision, care, and artistry.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Professional Photo */}
          <div className="order-2 lg:order-1">
            <Card className="overflow-hidden shadow-lg border-pink-200 dark:border-pink-700 dark:bg-gray-800">
              <CardContent className="p-0">
                <div className="aspect-square relative">
                  <Image
                    src="/images/deedee-portrait.png"
                    alt="Deedee - Professional Beauty Artist"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Story */}
          <div className="order-1 lg:order-2">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">My Story</h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
              <p>
                Hi, I'm Deedee! My journey into the beauty industry began with a simple passion: helping people feel
                confident and beautiful in their own skin.
              </p>
              <p>
                After years of perfecting my craft and training with industry professionals, I opened my home studio in
                Rumigbo, Port Harcourt. Here, I specialize in precision lash extensions and ombré brow techniques that
                enhance your natural beauty.
              </p>
              <p>
                Every client who walks through my door receives personalized attention and care. I believe beauty is an
                art form, and I'm honored to be part of your beauty journey.
              </p>
            </div>

            <div className="flex items-center space-x-4 mt-6">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < 4 ? "fill-current" : i === 4 ? "fill-current opacity-50" : ""}`}
                  />
                ))}
              </div>
              <span className="text-gray-600 dark:text-gray-400 font-medium">4.9 Rating • 200+ Reviews</span>
            </div>
          </div>
        </div>

        {/* Showcase Work - Ombré Brows Before & After */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-12">My Work</h2>
          <Card className="border-pink-200 dark:border-pink-700 dark:bg-gray-800 overflow-hidden">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-center text-pink-500 mb-8">Ombré Brows Transformation</h3>
              <div className="grid md:grid-cols-2 gap-8">
                {/* Before */}
                <div className="text-center">
                  <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Before</h4>
                  <Card className="overflow-hidden border-gray-200 dark:border-gray-700">
                    <CardContent className="p-0">
                      <div className="aspect-square relative">
                        <Image
                          src="/images/brows-before.png"
                          alt="Natural brows before treatment"
                          fill
                          className="object-cover"
                        />
                      </div>
                    </CardContent>
                  </Card>
                  <p className="text-gray-600 dark:text-gray-300 mt-3">Natural brows before treatment</p>
                </div>

                {/* After */}
                <div className="text-center">
                  <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">After</h4>
                  <Card className="overflow-hidden border-pink-200 dark:border-pink-700">
                    <CardContent className="p-0">
                      <div className="aspect-square relative">
                        <Image
                          src="/images/brows-after.png"
                          alt="Beautiful ombré brows with perfect gradient"
                          fill
                          className="object-cover"
                        />
                      </div>
                    </CardContent>
                  </Card>
                  <p className="text-gray-600 dark:text-gray-300 mt-3">Beautiful ombré brows with perfect gradient</p>
                </div>
              </div>

              <div className="text-center mt-8">
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  This stunning ombré brow transformation showcases the soft, powdered look that's darker at the tail
                  and lighter at the front - perfect for all skin types and lasting 1-2 years.
                </p>
                <Link href="/gallery">
                  <Button className="bg-pink-500 hover:bg-pink-600 text-white">View More Transformations</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Achievements */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-12">Why Choose Me</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {achievements.map((achievement, index) => (
              <Card
                key={index}
                className="text-center border-pink-200 dark:border-pink-700 dark:bg-gray-800 hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-pink-100 dark:bg-pink-900/50 rounded-full flex items-center justify-center text-pink-500">
                    {achievement.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">{achievement.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">{achievement.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Mission */}
        <section className="mb-16">
          <Card className="border-pink-200 dark:border-pink-700 bg-pink-50 dark:bg-gray-800">
            <CardContent className="p-8 text-center">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">My Mission</h2>
              <p className="text-xl text-gray-700 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
                To provide exceptional beauty services that enhance your natural features while ensuring a comfortable,
                professional experience. I'm committed to using the highest quality products and techniques to deliver
                results that exceed your expectations.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* CTA */}
        <section className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">Ready to Transform Your Look?</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Book your consultation today and let's create the perfect look for you.
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
