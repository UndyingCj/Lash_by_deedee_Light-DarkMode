"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Camera, Eye, Brush, Sparkles, X } from "lucide-react"
import Image from "next/image"

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState("All")
  const [expandedImage, setExpandedImage] = useState<{
    src: string
    alt: string
    title?: string
  } | null>(null)

  const categories = [
    { name: "All", count: 24 },
    { name: "Ombré Brows", count: 8 },
    { name: "Classic Lashes", count: 6 },
    { name: "Volume Lashes", count: 5 },
    { name: "Microblading", count: 3 },
    { name: "Before & After", count: 2 },
  ]

  const galleryItems = [
    {
      id: 1,
      category: "Classic Lashes",
      title: "Natural Classic Look",
      icon: <Eye className="w-6 h-6" />,
      description: "Classic lash extensions provide a natural, everyday look with one extension per natural lash.",
    },
    {
      id: 2,
      category: "Volume Lashes",
      title: "Dramatic Volume Set",
      icon: <Sparkles className="w-6 h-6" />,
      description: "Volume lashes create a fuller, more dramatic effect with multiple extensions per natural lash.",
    },
    {
      id: 3,
      category: "Before & After",
      title: "Brow Transformation",
      icon: <Brush className="w-6 h-6" />,
      description: "Stunning brow transformation with perfect shape and definition.",
      beforeImage: "/images/brows-before.png",
      afterImage: "/images/brows-after.png",
    },
    {
      id: 4,
      category: "Before & After",
      title: "5 Weeks Lash Refill",
      icon: <Eye className="w-6 h-6" />,
      description: "Lash refill after 5 weeks, restoring fullness and extending the life of your lash set.",
      beforeImage: "/images/lash-refill-before.png",
      afterImage: "/images/lash-refill-after.png",
    },
    {
      id: 5,
      category: "Ombré Brows",
      title: "Bold Ombré Style",
      icon: <Brush className="w-6 h-6" />,
    },
    {
      id: 6,
      category: "Volume Lashes",
      title: "Mega Volume Creation",
      icon: <Sparkles className="w-6 h-6" />,
    },
    {
      id: 7,
      category: "Classic Lashes",
      title: "Everyday Elegance",
      icon: <Eye className="w-6 h-6" />,
    },
    {
      id: 8,
      category: "Microblading",
      title: "Hair Stroke Perfection",
      icon: <Brush className="w-6 h-6" />,
    },
    {
      id: 9,
      category: "Ombré Brows",
      title: "Soft Powder Brows",
      icon: <Brush className="w-6 h-6" />,
    },
    {
      id: 10,
      category: "Volume Lashes",
      title: "Russian Volume",
      icon: <Sparkles className="w-6 h-6" />,
    },
  ]

  const filteredItems =
    activeCategory === "All" ? galleryItems : galleryItems.filter((item) => item.category === activeCategory)

  const handleImageClick = (src: string, alt: string, title?: string) => {
    setExpandedImage({ src, alt, title })
    document.body.style.overflow = "hidden" // Prevent scrolling when modal is open
  }

  const closeExpandedImage = () => {
    setExpandedImage(null)
    document.body.style.overflow = "" // Re-enable scrolling
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-rose-50 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-pink-100 dark:bg-pink-900/50 rounded-full">
              <Camera className="w-12 h-12 text-pink-500" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-pink-500 mb-6">Gallery</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Explore our portfolio of beautiful transformations and see the artistry behind every service.
            <span className="block mt-2 text-sm text-pink-500 font-medium">Click on any image to enlarge</span>
          </p>
        </div>

        {/* Filter Categories */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category, index) => (
            <Badge
              key={index}
              variant={category.name === activeCategory ? "default" : "secondary"}
              className={`px-4 py-2 text-sm cursor-pointer transition-colors ${
                category.name === activeCategory
                  ? "bg-pink-500 text-white hover:bg-pink-600"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-pink-100 dark:hover:bg-pink-900/50"
              }`}
              onClick={() => setActiveCategory(category.name)}
            >
              {category.name} ({category.count})
            </Badge>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className="group overflow-hidden border-pink-200 dark:border-pink-700 dark:bg-gray-800 hover:shadow-lg transition-all duration-300"
            >
              <CardContent className="p-0">
                {item.beforeImage && item.afterImage ? (
                  <div className="relative">
                    {/* Before & After Images */}
                    <div className="grid grid-cols-2 gap-1">
                      <div
                        className="relative aspect-square cursor-pointer"
                        onClick={() => handleImageClick(item.beforeImage!, `${item.title} Before`, "Before")}
                      >
                        <Image
                          src={item.beforeImage || "/placeholder.svg"}
                          alt={`${item.title} Before`}
                          fill
                          className="object-cover hover:opacity-90 transition-opacity"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs py-1 text-center">
                          Before
                        </div>
                      </div>
                      <div
                        className="relative aspect-square cursor-pointer"
                        onClick={() => handleImageClick(item.afterImage!, `${item.title} After`, "After")}
                      >
                        <Image
                          src={item.afterImage || "/placeholder.svg"}
                          alt={`${item.title} After`}
                          fill
                          className="object-cover hover:opacity-90 transition-opacity"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs py-1 text-center">
                          After
                        </div>
                      </div>
                    </div>
                    <div className="p-4 text-center">
                      <h3 className="font-medium text-gray-800 dark:text-gray-100">{item.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.category}</p>
                      {item.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{item.description}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="aspect-square bg-gradient-to-br from-pink-100 to-rose-100 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center relative overflow-hidden">
                    {/* Placeholder Content */}
                    <div className="text-center">
                      <div className="w-20 h-20 mx-auto mb-4 bg-pink-200 dark:bg-pink-800 rounded-full flex items-center justify-center text-pink-500 group-hover:scale-110 transition-transform">
                        {item.icon}
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 font-medium">{item.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.category}</p>
                      {item.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 px-4">{item.description}</p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Coming Soon Notice */}
        <Card className="border-pink-200 dark:border-pink-700 bg-pink-50 dark:bg-gray-800">
          <CardContent className="p-8 text-center">
            <Camera className="w-16 h-16 mx-auto mb-4 text-pink-500" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">More Photos Coming Soon!</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              I'm constantly updating my portfolio with new transformations. Follow me on Instagram @lashedbydeedee for
              the latest before & after photos and behind-the-scenes content.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://www.instagram.com/lashedbydeedee?igsh=MWR3NzV6amtpZHdpbg=="
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors"
              >
                Follow on Instagram
              </a>
              <a
                href="#"
                className="inline-flex items-center justify-center px-6 py-3 border border-pink-300 dark:border-pink-700 text-pink-600 dark:text-pink-400 rounded-full hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors"
              >
                View Live Portfolio
              </a>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Image Lightbox Modal */}
      {expandedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={closeExpandedImage}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] bg-white dark:bg-gray-800 rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 z-10 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
              onClick={closeExpandedImage}
            >
              <X className="w-6 h-6" />
            </button>

            <div className="relative h-[80vh]">
              <Image
                src={expandedImage.src || "/placeholder.svg"}
                alt={expandedImage.alt}
                fill
                className="object-contain"
              />
            </div>

            <div className="p-4 text-center">
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100">
                {expandedImage.title && `${expandedImage.title} - `}
                {expandedImage.alt}
              </h3>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
