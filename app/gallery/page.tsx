import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Camera, Eye, Brush, Sparkles } from "lucide-react"

export default function GalleryPage() {
  const categories = [
    { name: "All", count: 24, active: true },
    { name: "Ombré Brows", count: 8 },
    { name: "Classic Lashes", count: 6 },
    { name: "Volume Lashes", count: 5 },
    { name: "Microblading", count: 3 },
    { name: "Before & After", count: 2 },
  ]

  const galleryItems = [
    { category: "Ombré Brows", title: "Natural Ombré Transformation", icon: <Brush className="w-6 h-6" /> },
    { category: "Volume Lashes", title: "Dramatic Volume Set", icon: <Sparkles className="w-6 h-6" /> },
    { category: "Classic Lashes", title: "Natural Classic Look", icon: <Eye className="w-6 h-6" /> },
    { category: "Ombré Brows", title: "Bold Ombré Style", icon: <Brush className="w-6 h-6" /> },
    { category: "Volume Lashes", title: "Mega Volume Creation", icon: <Sparkles className="w-6 h-6" /> },
    { category: "Classic Lashes", title: "Everyday Elegance", icon: <Eye className="w-6 h-6" /> },
    { category: "Microblading", title: "Hair Stroke Perfection", icon: <Brush className="w-6 h-6" /> },
    { category: "Ombré Brows", title: "Soft Powder Brows", icon: <Brush className="w-6 h-6" /> },
    { category: "Volume Lashes", title: "Russian Volume", icon: <Sparkles className="w-6 h-6" /> },
  ]

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
          </p>
        </div>

        {/* Filter Categories */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category, index) => (
            <Badge
              key={index}
              variant={category.active ? "default" : "secondary"}
              className={`px-4 py-2 text-sm cursor-pointer transition-colors ${
                category.active
                  ? "bg-pink-500 text-white hover:bg-pink-600"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-pink-100 dark:hover:bg-pink-900/50"
              }`}
            >
              {category.name} ({category.count})
            </Badge>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {galleryItems.map((item, index) => (
            <Card
              key={index}
              className="group overflow-hidden border-pink-200 dark:border-pink-700 dark:bg-gray-800 hover:shadow-lg transition-all duration-300"
            >
              <CardContent className="p-0">
                <div className="aspect-square bg-gradient-to-br from-pink-100 to-rose-100 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center relative overflow-hidden">
                  {/* Placeholder Content */}
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 bg-pink-200 dark:bg-pink-800 rounded-full flex items-center justify-center text-pink-500 group-hover:scale-110 transition-transform">
                      {item.icon}
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 font-medium">{item.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.category}</p>
                  </div>

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                        <Eye className="w-6 h-6 text-gray-800" />
                      </div>
                    </div>
                  </div>
                </div>
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
                href="#"
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
    </div>
  )
}
