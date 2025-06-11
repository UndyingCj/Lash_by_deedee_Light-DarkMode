import Link from "next/link"
import { Heart, Instagram, MessageCircle, Mail } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-black text-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Heart className="w-6 h-6 text-pink-500" />
              <h3 className="text-xl font-bold">Lashed by Deedee</h3>
            </div>
            <p className="text-gray-400 mb-4">
              Where Beauty Meets Precision. Professional lash and brow services in Port Harcourt.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://instagram.com/lashedbydeedee"
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-500 hover:text-pink-400"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://wa.me/2348000000000"
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-500 hover:text-pink-400"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <a href="mailto:hello@lashedbydeedee.com" className="text-pink-500 hover:text-pink-400">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/services" className="hover:text-white">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/book" className="hover:text-white">
                  Book Now
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-white">
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="/training" className="hover:text-white">
                  Training
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Rumuodara, Port Harcourt</li>
              <li>
                <a
                  href="https://wa.me/2348000000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white"
                >
                  WhatsApp: +234 XXX XXX XXXX
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com/lashedbydeedee"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white"
                >
                  Instagram: @lashedbydeedee
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 dark:border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Lashed by Deedee. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
