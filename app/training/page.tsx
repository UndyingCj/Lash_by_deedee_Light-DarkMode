import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GraduationCap, Clock, Users, Award, BookOpen, Star, CreditCard } from "lucide-react"

export default function TrainingPage() {
  const courses = [
    {
      title: "7 Days Lash Course",
      duration: "1 Week",
      level: "Beginner",
      price: "80,000",
      students: "6 max",
      description: "Comprehensive 7-day lash extension training covering all fundamental techniques.",
      includes: [
        "Classic lash application",
        "Isolation techniques",
        "Adhesive knowledge",
        "Safety protocols",
        "Client consultation",
        "Aftercare education",
        "Certificate of completion",
        "Basic materials included",
      ],
    },
    {
      title: "7 Days Brow Course",
      duration: "1 Week",
      level: "Beginner",
      price: "110,000",
      students: "8 max",
      description: "Complete 7-day brow training covering microblading, shading, and lamination techniques.",
      includes: [
        "Microblading techniques",
        "Shading methods",
        "Color theory",
        "Skin analysis",
        "Pattern creation",
        "Healing process",
        "Certificate of completion",
        "Basic materials included",
      ],
    },
    {
      title: "2 Weeks Lash Course",
      duration: "2 Weeks",
      level: "Beginner to Intermediate",
      price: "140,000",
      students: "6 max",
      description: "Extended 2-week lash course with advanced techniques and more practice time.",
      includes: [
        "Classic & volume techniques",
        "Advanced isolation",
        "Speed building",
        "Troubleshooting",
        "Business setup",
        "Marketing basics",
        "Certificate of completion",
        "Basic materials included",
      ],
    },
    {
      title: "2 Weeks Brow Course",
      duration: "2 Weeks",
      level: "Beginner to Intermediate",
      price: "220,000",
      students: "8 max",
      description: "Comprehensive 2-week brow training with all techniques and business guidance.",
      includes: [
        "All brow techniques",
        "Advanced color theory",
        "Correction methods",
        "Business setup",
        "Client management",
        "Marketing strategies",
        "Certificate of completion",
        "Basic materials included",
      ],
      popular: true,
    },
    {
      title: "2 Weeks Lash & Brows Combined",
      duration: "2 Weeks",
      level: "Beginner to Intermediate",
      price: "300,000",
      students: "6 max",
      description: "Complete beauty training covering both lash and brow techniques in one comprehensive course.",
      includes: [
        "All lash techniques",
        "All brow techniques",
        "Business setup guidance",
        "Marketing strategies",
        "Client consultation",
        "Aftercare protocols",
        "Certificate of completion",
        "Basic materials included",
      ],
      popular: true,
    },
    {
      title: "1 Month Lash & Brows",
      duration: "4 Weeks",
      level: "Beginner to Advanced",
      price: "450,000",
      students: "6 max",
      description: "The most comprehensive training program covering all techniques with extensive practice.",
      includes: [
        "All lash & brow techniques",
        "Advanced troubleshooting",
        "Business development",
        "Advanced marketing",
        "Mentorship included",
        "Ongoing support",
        "Certificate of completion",
        "Basic materials included",
      ],
    },
    {
      title: "Brow Lamination & Tint",
      duration: "2 Days",
      level: "Beginner",
      price: "40,000",
      students: "8 max",
      description: "Quick 2-day course focusing specifically on brow lamination and tinting techniques.",
      includes: [
        "Lamination techniques",
        "Tinting methods",
        "Product knowledge",
        "Client consultation",
        "Aftercare guidance",
        "Certificate of completion",
        "Basic materials included",
      ],
    },
    {
      title: "5 Days Upgrade Lash Course",
      duration: "5 Days",
      level: "Intermediate",
      price: "50,000",
      students: "6 max",
      description: "Advanced lash course for those looking to upgrade their existing skills.",
      includes: [
        "Advanced volume techniques",
        "Speed improvement",
        "Troubleshooting",
        "New trends",
        "Business tips",
        "Certificate of completion",
        "Basic materials included",
      ],
    },
    {
      title: "5 Days Upgrade Brow Course",
      duration: "5 Days",
      level: "Intermediate",
      price: "80,000",
      students: "8 max",
      description: "Advanced brow course for professionals looking to enhance their skills.",
      includes: [
        "Advanced techniques",
        "Correction methods",
        "Color matching",
        "New trends",
        "Business development",
        "Certificate of completion",
        "Basic materials included",
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
            Start your beauty career with professional training. Classes run Monday-Friday, 10:00 AM daily.
          </p>
        </div>

        {/* Training Schedule Info */}
        <Card className="border-pink-200 dark:border-pink-700 bg-pink-50 dark:bg-gray-800 mb-12">
          <CardContent className="p-6 text-center">
            <Clock className="w-12 h-12 mx-auto mb-4 text-pink-500" />
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Training Schedule</h3>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="bg-white dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Training Days</h4>
                <p className="text-gray-600 dark:text-gray-300">Monday - Friday</p>
              </div>
              <div className="bg-white dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Training Time</h4>
                <p className="text-gray-600 dark:text-gray-300">10:00 AM Daily</p>
              </div>
              <div className="bg-white dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Payment</h4>
                <p className="text-gray-600 dark:text-gray-300">Installments accepted</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Must complete within first week</p>
              </div>
            </div>
          </CardContent>
        </Card>

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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
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

        {/* Payment & Materials Info */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="border-pink-200 dark:border-pink-700 dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-xl text-gray-800 dark:text-gray-100 flex items-center space-x-2">
                <CreditCard className="w-6 h-6 text-pink-500" />
                <span>Payment Options</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-600 dark:text-gray-300">Payment can be made in installments</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-600 dark:text-gray-300">
                    Full payment must be completed within the first week of training
                  </span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-600 dark:text-gray-300">
                    Paystack, Flutterwave, and Bank Transfer accepted
                  </span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-600 dark:text-gray-300">Contact us to discuss payment plans</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-pink-200 dark:border-pink-700 dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-xl text-gray-800 dark:text-gray-100">Materials & Equipment</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-600 dark:text-gray-300">Basic materials included with all courses</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-600 dark:text-gray-300">
                    Additional materials provided by studio during training
                  </span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-600 dark:text-gray-300">Studio materials are not for take-home use</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-600 dark:text-gray-300">Starter kit provided upon course completion</span>
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
              Join our training program and learn from an experienced professional. Classes run Monday-Friday at 10:00
              AM. Limited spots available for each course.
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
