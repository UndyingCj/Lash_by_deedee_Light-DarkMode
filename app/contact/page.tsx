import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Phone, Mail, Clock, Instagram, MessageCircle } from "lucide-react"
import Link from "next/link"

export default function ContactPage() {
  const contactInfo = [
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Location",
      details: ["Rumigbo, Port Harcourt", "Rivers State, Nigeria"],
      note: "Home studio - exact address provided upon booking",
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Phone & WhatsApp",
      details: ["Contact via WhatsApp"],
      note: "Available for WhatsApp messages",
      link: "https://wa.me/message/X5M2NOA553NGK1",
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email",
      details: ["hello@lashedbydeedee.com"],
      note: "For general inquiries and bookings",
      link: "mailto:hello@lashedbydeedee.com",
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Business Hours",
      details: ["Monday - Saturday: 9:00 AM - 6:00 PM", "Sunday: By appointment only"],
      note: "Emergency touch-ups available",
    },
  ]

  const socialLinks = [
    {
      icon: <Instagram className="w-6 h-6" />,
      name: "Instagram",
      handle: "@lashedbydeedee",
      color: "bg-pink-500",
      link: "https://instagram.com/lashedbydeedee",
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      name: "WhatsApp",
      handle: "Contact Us",
      color: "bg-green-500",
      link: "https://wa.me/message/X5M2NOA553NGK1",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-rose-50 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-pink-100 dark:bg-pink-900/50 rounded-full">
              <MessageCircle className="w-12 h-12 text-pink-500" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-pink-500 mb-6">Contact Us</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Ready to book your appointment or have questions? Get in touch with us today!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <Card className="border-pink-200 dark:border-pink-700 dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-800 dark:text-gray-100">Send us a Message</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-base font-medium text-gray-900 dark:text-gray-100">
                      First Name *
                    </Label>
                    <Input id="firstName" placeholder="Your first name" className="mt-2" />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-base font-medium text-gray-900 dark:text-gray-100">
                      Last Name *
                    </Label>
                    <Input id="lastName" placeholder="Your last name" className="mt-2" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-base font-medium text-gray-900 dark:text-gray-100">
                    Email Address *
                  </Label>
                  <Input id="email" type="email" placeholder="your.email@example.com" className="mt-2" />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-base font-medium text-gray-900 dark:text-gray-100">
                    Phone Number
                  </Label>
                  <Input id="phone" placeholder="+234 XXX XXX XXXX" className="mt-2" />
                </div>

                <div>
                  <Label htmlFor="subject" className="text-base font-medium text-gray-900 dark:text-gray-100">
                    Subject *
                  </Label>
                  <Input id="subject" placeholder="What's this about?" className="mt-2" />
                </div>

                <div>
                  <Label htmlFor="message" className="text-base font-medium text-gray-900 dark:text-gray-100">
                    Message *
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us about your inquiry, preferred services, or any questions you have..."
                    className="mt-2"
                    rows={5}
                  />
                </div>

                <Button className="w-full bg-pink-500 hover:bg-pink-600 text-white">Send Message</Button>

                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  We typically respond within 24 hours. For urgent inquiries, please WhatsApp us directly.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Contact Details */}
            <div className="grid gap-6">
              {contactInfo.map((info, index) => (
                <Card key={index} className="border-pink-200 dark:border-pink-700 dark:bg-gray-800">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-pink-100 dark:bg-pink-900/50 rounded-full text-pink-500 flex-shrink-0">
                        {info.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">{info.title}</h3>
                        {info.details.map((detail, detailIndex) => (
                          <p key={detailIndex} className="text-gray-600 dark:text-gray-300 mb-1">
                            {info.link ? (
                              <a
                                href={info.link}
                                target={info.link.startsWith("http") ? "_blank" : undefined}
                                rel={info.link.startsWith("http") ? "noopener noreferrer" : undefined}
                                className="hover:text-pink-500"
                              >
                                {detail}
                              </a>
                            ) : (
                              detail
                            )}
                          </p>
                        ))}
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{info.note}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Social Media */}
            <Card className="border-pink-200 dark:border-pink-700 dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800 dark:text-gray-100">Follow Us</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {socialLinks.map((social, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 ${social.color} rounded-full text-white`}>{social.icon}</div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-100">{social.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{social.handle}</p>
                      </div>
                    </div>
                    <a href={social.link} target="_blank" rel="noopener noreferrer">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-pink-300 dark:border-pink-700 text-pink-600 dark:text-pink-400"
                      >
                        Follow
                      </Button>
                    </a>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-pink-200 dark:border-pink-700 bg-pink-50 dark:bg-gray-800">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Ready to Book?</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Skip the contact form and book your appointment directly!
                </p>
                <Link href="/book">
                  <Button className="w-full bg-pink-500 hover:bg-pink-600 text-white">Book Appointment Now</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
