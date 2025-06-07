import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GraduationCap, Clock, Users, Award, BookOpen, Star } from "lucide-react"

export default function TrainingPage() {
  const courses = [
    {
      title: "Microshading Masterclass",
      duration: "2 Days",
      level: "Beginner to Advanced",
      price: "150,000",
      students: "8 max",
      description:
        "Comprehensive training in microshading technique for all skin types, from basics to advanced methods.",
      includes: [
        "Theory and anatomy",
        "Color theory and mixing",
        "Machine techniques",
        "Live model practice",
        "Aftercare protocols",
        "Business setup guidance",
        "Certificate of completion",
        "Starter kit included",
      ],
      popular: true,
    },
    {
      title: "Classic Lash Extensions",
      duration: "1 Day",
      level: "Beginner",
      price: "80,000",
      students: "6 max",
      description:
        "Learn the fundamentals of classic lash extensions with hands-on practice and professional techniques.",
      includes: [
        "Lash anatomy and safety",
        "Isolation techniques",
        "Adhesive knowledge",
        "Application methods",
        "Styling and mapping",
        "Aftercare education",
        "Certificate of completion",
        "Practice kit included",
      ],
    },
    {
      title: "Volume Lash Technique",
      duration: "2 Days",
      level: "Intermediate",
      price: "120,000",
      students: "6 max",
      description: "Advanced volume lashing techniques including Russian volume and mega volume applications.",
      includes: [
        "Fan creation techniques",
        "Volume theory",
        "Advanced isolation",
        "Speed building",
        "Troubleshooting",
        "Client consultation",
        "Certificate of completion",
        "Professional kit included",
      ],
    },
    {
      title: "Brow Lamination Course",
      duration: "1 Day",
      level: "Beginner",
      price: "60,000",
      students: "8 max",
      description: "Master the art of brow lamination and tinting for fuller, more defined brows.",
      includes: [
        "Lamination techniques",
        "Product knowledge",
        "Tinting methods",
        "Client consultation",
        "Aftercare guidance",
        "Business tips",
        "Certificate of completion",
        "Tool kit included",
      ],
    },
  ]

  const benefits = [
    {
      icon: <GraduationCap className="w-6 h-6" />,
      title: "Expert Instruction",
      description: "Learn from a certified professional with 3+ years of experience",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Small Class Sizes",
      description: "Maximum 8 students per class for personalized attention",
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Hands-On Practice",
      description: "Practice on live models with guidance and feedback",
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Certification",
      description: "Receive official certification upon course completion",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-rose-50 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-pink-100 dark:bg-pink-900/50 rounded-full">
              <GraduationCap className="w-12 h-12 text-pink-500" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-pink-500 mb-6">Training Courses</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Start your beauty career with professional training from an experienced and certified instructor.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {benefits.map((benefit, index) => (
            <Card key={index} className="text-center border-pink-200 dark:border-pink-700 dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-pink-100 dark:bg-pink-900/50 rounded-full flex items-center justify-center text-pink-500">
                  {benefit.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">{benefit.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Courses */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {courses.map((course, index) => (
            <Card
              key={index}
              className={`border-pink-200 dark:border-pink-700 dark:bg-gray-800 relative ${course.popular ? "ring-2 ring-pink-500" : ""}`}
            >
              {course.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-pink-500 text-white px-4 py-1">Most Popular</Badge>
                </div>
              )}
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl text-gray-800 dark:text-gray-100 mb-2">{course.title}</CardTitle>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge
                        variant="secondary"
                        className="bg-pink-100 dark:bg-pink-900/50 text-pink-700 dark:text-pink-300"
                      >
                        <Clock className="w-3 h-3 mr-1" />
                        {course.duration}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      >
                        <Users className="w-3 h-3 mr-1" />
                        {course.students}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-pink-500">₦{course.price}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{course.level}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{course.description}</p>

                <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">What's Included:</h4>
                <ul className="space-y-2 mb-6">
                  {course.includes.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start space-x-2">
                      <Star className="w-4 h-4 text-pink-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-300 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>

                <Button className="w-full bg-pink-500 hover:bg-pink-600 text-white">Enroll Now</Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Training Info */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="border-pink-200 dark:border-pink-700 dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-xl text-gray-800 dark:text-gray-100">Training Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-600 dark:text-gray-300">Must be 18 years or older</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-600 dark:text-gray-300">
                    No prior experience necessary for beginner courses
                  </span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-600 dark:text-gray-300">Bring a notepad and pen for theory sessions</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-600 dark:text-gray-300">Comfortable clothing recommended</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-600 dark:text-gray-300">Full payment required to secure spot</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-pink-200 dark:border-pink-700 dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-xl text-gray-800 dark:text-gray-100">After Training Support</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-600 dark:text-gray-300">30 days of WhatsApp support</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-600 dark:text-gray-300">Business setup guidance</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-600 dark:text-gray-300">Supplier recommendations</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-600 dark:text-gray-300">Marketing tips and strategies</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-600 dark:text-gray-300">Alumni network access</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <Card className="border-pink-200 dark:border-pink-700 bg-pink-50 dark:bg-gray-800">
          <CardContent className="p-8 text-center">
            <GraduationCap className="w-16 h-16 mx-auto mb-4 text-pink-500" />
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              Ready to Start Your Beauty Career?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Join our training program and learn from an experienced professional. Limited spots available for each
              course.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3">
                View Course Schedule
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-pink-300 dark:border-pink-700 text-pink-600 dark:text-pink-400 px-8 py-3"
              >
                Contact for Details
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
