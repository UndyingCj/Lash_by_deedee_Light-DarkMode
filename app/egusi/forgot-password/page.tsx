"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setMessage("")

    try {
      const response = await fetch('/api/admin/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(data.message)
      } else {
        setError(data.error || "Failed to send reset email")
      }
    } catch (err) {
      setError("Network error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-pink-200 dark:border-pink-700 shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-pink-100 dark:bg-pink-900/50 rounded-full">
              <Mail className="w-8 h-8 text-pink-500" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Forgot Password
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-300">
            Enter your email to receive a password reset link
          </p>
        </CardHeader>
        <CardContent>
          {message ? (
            <div className="text-center">
              <div className="text-green-600 text-sm mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                {message}
              </div>
              <Link href="/egusi" className="text-pink-600 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300 flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1"
                  placeholder="admin@lashedbydeedee.com"
                  required
                />
              </div>

              {error && (
                <div className="text-red-500 text-sm text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-pink-500 hover:bg-pink-600 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>

              <div className="text-center">
                <Link href="/egusi" className="text-sm text-pink-600 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300 flex items-center justify-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}