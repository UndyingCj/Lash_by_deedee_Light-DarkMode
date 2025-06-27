export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="animate-pulse">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-pink-200 dark:bg-pink-800 rounded-full mx-auto mb-4"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto"></div>
            </div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-10 bg-pink-200 dark:bg-pink-800 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
