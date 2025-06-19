import { LuInfo } from "react-icons/lu"

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <LuInfo size={60} className="animate-spin text-blue-500" />
      <p className="mt-4 text-gray-500">Loading book...</p>
    </div>
  )
}
