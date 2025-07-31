import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function BookingSuccessLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center p-8">
          <Loader2 className="w-12 h-12 text-green-500 animate-spin mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Loading...</h2>
          <p className="text-gray-600 dark:text-gray-300 text-center">
            Please wait while we load your booking confirmation...
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
