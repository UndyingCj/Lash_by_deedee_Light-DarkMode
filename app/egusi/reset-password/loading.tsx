import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function ResetPasswordLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-pink-200 dark:border-pink-700 shadow-xl">
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-pink-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">Loading reset password form...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
