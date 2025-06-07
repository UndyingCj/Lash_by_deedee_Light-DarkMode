import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, Quote, ThumbsUp, MessageSquare } from "lucide-react"

export default function ReviewsPage() {
  const reviews = [
    {
      name: "Sarah Johnson",
      service: "Ombré Brows",
      rating: 5,
      date: "2 weeks ago",
      review:
        "Absolutely amazing experience! Deedee is so professional and talented. My brows look perfect and exactly what I wanted. The healing process was smooth and she guided me through every step.",
      verified: true,
    },
    {
      name: "Grace Okafor",
      service: "Volume Lashes",
      rating: 5,
      date: "1 month ago",
      review:
        "Best lash artist in Port Harcourt! My lashes look so natural yet dramatic. Deedee's attention to detail is incredible. I've been getting compliments everywhere I go!",
      verified: true,
    },
    {
      name: "Jennifer Eze",
      service: "Classic Lashes",
      rating: 5,
      date: "3 weeks ago",
      review:
        "I was nervous about getting lash extensions for the first time, but Deedee made me feel so comfortable. The results are beautiful and they've lasted so well. Definitely coming back!",
      verified: true,
    },
    {
      name: "Blessing Okoro",
      service: "Microblading",
      rating: 5,
      date: "1 month ago",
      review:
        "Deedee transformed my sparse brows into beautiful, natural-looking ones. The process was virtually painless and the results exceeded my expectations. Highly recommend!",
      verified: true,
    },
    {
      name: "Chioma Adebayo",
      service: "Combo Brows",
      rating: 5,
      date: "2 months ago",
      review:
        "The best investment I've made for my beauty routine! My brows look perfect every morning. Deedee is an artist and her studio is so clean and welcoming.",
      verified: true,
    },
    {
      name: "Funmi Lagos",
      service: "Volume Lashes",
      rating: 5,
      date: "6 weeks ago",
      review:
        "I've tried other lash artists before but none compare to Deedee's work. The lashes are perfectly placed and look so full and beautiful. Customer service is top-notch too!",
      verified: true,
    },
  ]

  const stats = [
    { number: "200+", label: "Happy Clients" },
    { number: "5.0", label: "Average Rating" },
    { number: "98%", label: "Satisfaction Rate" },
    { number: "150+", label: "5-Star Reviews" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-rose-50 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-pink-100 dark:bg-pink-900/50 rounded-full">
              <Star className="w-12 h-12 text-pink-500" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-pink-500 mb-6">Client Reviews</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            See what our amazing clients have to say about their experience with Lashed by Deedee.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center border-pink-200 dark:border-pink-700 dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-pink-500 mb-2">{stat.number}</div>
                <div className="text-gray-600 dark:text-gray-300 text-sm">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Reviews Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {reviews.map((review, index) => (
            <Card key={index} className="border-pink-200 dark:border-pink-700 dark:bg-gray-800">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg text-gray-800 dark:text-gray-100 flex items-center space-x-2">
                      <span>{review.name}</span>
                      {review.verified && (
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <ThumbsUp className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {review.service} • {review.date}
                    </p>
                  </div>
                  <div className="flex text-yellow-400">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Quote className="w-8 h-8 text-pink-200 dark:text-pink-800 absolute -top-2 -left-2" />
                  <p className="text-gray-700 dark:text-gray-300 pl-6 italic">"{review.review}"</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Leave a Review */}
          <Card className="border-pink-200 dark:border-pink-700 bg-pink-50 dark:bg-gray-800">
            <CardContent className="p-8 text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-pink-500" />
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Share Your Experience</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Had a great experience? We'd love to hear about it! Your feedback helps us improve and helps other
                clients choose us.
              </p>
              <Button className="w-full bg-pink-500 hover:bg-pink-600 text-white">Leave a Review</Button>
            </CardContent>
          </Card>

          {/* Book Now */}
          <Card className="border-pink-200 dark:border-pink-700 dark:bg-gray-800">
            <CardContent className="p-8 text-center">
              <Star className="w-12 h-12 mx-auto mb-4 text-pink-500" />
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Ready to Join Them?</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Experience the same amazing service that our clients rave about. Book your appointment today and see why
                we have 200+ happy clients!
              </p>
              <Button className="w-full bg-pink-500 hover:bg-pink-600 text-white">Book Your Appointment</Button>
            </CardContent>
          </Card>
        </div>

        {/* Social Proof */}
        <Card className="mt-8 border-pink-200 dark:border-pink-700 dark:bg-gray-800">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Find More Reviews</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Check out more reviews and see our latest work on our social media platforms.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#"
                className="inline-flex items-center justify-center px-6 py-3 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors"
              >
                Instagram Reviews
              </a>
              <a
                href="#"
                className="inline-flex items-center justify-center px-6 py-3 border border-pink-300 dark:border-pink-700 text-pink-600 dark:text-pink-400 rounded-full hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors"
              >
                Google Reviews
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
