import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { HelpCircle } from "lucide-react"

export default function FAQsPage() {
  const faqs = [
    {
      question: "How long do ombré brows last?",
      answer:
        "Ombré brows typically last 1-2 years depending on your skin type, lifestyle, and aftercare. Oily skin may fade faster, while dry skin tends to retain the pigment longer.",
    },
    {
      question: "Can I come with makeup on?",
      answer:
        "Please come with a clean face, especially around the brow and eye area. This ensures the best results and prevents any interference with the procedure.",
    },
    {
      question: "Do you offer training courses?",
      answer:
        "Yes! I offer comprehensive training courses for both brow and lash techniques. Check our Training page for more details on courses, pricing, and schedules.",
    },
    {
      question: "Can I reschedule my appointment?",
      answer:
        "Yes, you can reschedule with at least 24 hours notice. Same-day cancellations or no-shows may result in forfeiture of your deposit.",
    },
    {
      question: "What's your cancellation policy?",
      answer:
        "Cancellations with 24+ hours notice receive a full refund. Less than 24 hours notice results in 50% deposit retention. No-shows forfeit the full deposit.",
    },
    {
      question: "How long does the healing process take?",
      answer:
        "Initial healing takes 7-14 days, with complete healing in 4-6 weeks. During this time, you may experience scabbing, flaking, and color changes - this is normal!",
    },
    {
      question: "What should I avoid before my appointment?",
      answer:
        "Avoid alcohol, caffeine, blood thinners, and sun exposure 24 hours before. Don't tweeze or wax brows for 2 weeks prior. Avoid Botox for 2 weeks before brow procedures.",
    },
    {
      question: "Are lash extensions safe for my natural lashes?",
      answer:
        "When applied correctly by a trained professional, lash extensions are completely safe and won't damage your natural lashes. Proper aftercare is essential.",
    },
    {
      question: "How often do I need lash fills?",
      answer:
        "Lash fills are recommended every 2-3 weeks to maintain fullness as your natural lashes shed. This keeps your extensions looking fresh and full.",
    },
    {
      question: "What if I'm not happy with the results?",
      answer:
        "Your satisfaction is my priority. We offer a complimentary touch-up within 6-8 weeks if you're not completely satisfied with your service.",
    },
    {
      question: "Do you accept walk-ins?",
      answer:
        "I work by appointment only to ensure each client receives dedicated time and attention. Please book in advance through our booking system.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "I accept payments via Paystack, Flutterwave, bank transfer, and cash. A 50% deposit is required to secure your appointment.",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-rose-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-pink-100 rounded-full">
              <HelpCircle className="w-8 h-8 text-pink-500" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-pink-500 mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-600">
            Find answers to common questions about our services, policies, and procedures.
          </p>
        </div>

        <Card className="border-pink-200">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-800">Common Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left hover:text-pink-500">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-gray-600">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Still have questions section */}
        <Card className="mt-8 border-pink-200 bg-pink-50">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Still Have Questions?</h3>
            <p className="text-gray-600 mb-6">
              Can't find what you're looking for? I'm here to help! Reach out via WhatsApp or Instagram for personalized
              answers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#"
                className="inline-flex items-center justify-center px-6 py-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
              >
                WhatsApp Me
              </a>
              <a
                href="#"
                className="inline-flex items-center justify-center px-6 py-3 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors"
              >
                Instagram DM
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
