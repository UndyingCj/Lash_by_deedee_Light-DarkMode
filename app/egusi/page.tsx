"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, Eye, EyeOff, Mail, ArrowLeft, Loader2 } from "lucide-react"

interface AdminUser {
  id: string
  username: string
  email: string
}

export default function AdminLoginPage() {
  const [step, setStep] = useState<"login" | "2fa" | "forgot-password">("login")
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  })
  const [twoFactorCode, setTwoFactorCode] = useState("")
  const [forgotEmail, setForgotEmail] = useState("")
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setMessage("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Login failed")
        return
      }

      if (data.requiresTwoFactor) {
        setCurrentUser(data.user)
        setStep("2fa")
        setMessage(data.message)
      } else {
        // Redirect to dashboard
        window.location.href = "/egusi/dashboard"
      }
    } catch (err) {
      setError("Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleTwoFactor = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser?.id,
          code: twoFactorCode,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "2FA verification failed")
        return
      }

      // Redirect to dashboard
      window.location.href = "/egusi/dashboard"
    } catch (err) {
      setError("Verification failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setMessage("")

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage(data.message)
        setTimeout(() => setStep("login"), 3000)
      } else {
        setError(data.message || "Failed to send reset email")
      }
    } catch (err) {
      setError("Failed to send reset email. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const renderLoginForm = () => (
    <form onSubmit={handleLogin} className="space-y-4">
      <div>
        <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
          Email Address
        </Label>
        <Input
          id="email"
          type="email"
          value={credentials.email}
          onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
          className="mt-1"
          placeholder="lashedbydeedeee@gmail.com"
          required
        />
      </div>

      <div>
        <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">
          Password
        </Label>
        <div className="relative mt-1">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={credentials.password}
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            className="pr-10"
            required
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
          </button>
        </div>
      </div>

      <Button type="submit" className="w-full bg-pink-500 hover:bg-pink-600 text-white" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign In"
        )}
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={() => {
            setStep("forgot-password")
            setForgotEmail(credentials.email)
          }}
          className="text-sm text-pink-500 hover:text-pink-600"
        >
          Forgot your password?
        </button>
      </div>
    </form>
  )

  const renderTwoFactorForm = () => (
    <form onSubmit={handleTwoFactor} className="space-y-4">
      <div className="text-center mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-300">A 6-digit code has been sent to your email</p>
      </div>

      <div>
        <Label htmlFor="code" className="text-gray-700 dark:text-gray-300">
          6-Digit Code
        </Label>
        <Input
          id="code"
          type="text"
          value={twoFactorCode}
          onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          className="mt-1 text-center text-lg tracking-widest"
          placeholder="000000"
          maxLength={6}
          required
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-pink-500 hover:bg-pink-600 text-white"
        disabled={isLoading || twoFactorCode.length !== 6}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Verifying...
          </>
        ) : (
          "Verify Code"
        )}
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={() => setStep("login")}
          className="text-sm text-gray-500 hover:text-gray-600 flex items-center justify-center"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to login
        </button>
      </div>
    </form>
  )

  const renderForgotPasswordForm = () => (
    <form onSubmit={handleForgotPassword} className="space-y-4">
      <div className="text-center mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Enter your email address and we'll send you a reset link
        </p>
      </div>

      <div>
        <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
          Email Address
        </Label>
        <Input
          id="email"
          type="email"
          value={forgotEmail}
          onChange={(e) => setForgotEmail(e.target.value)}
          className="mt-1"
          placeholder="lashedbydeedeee@gmail.com"
          required
        />
      </div>

      <Button type="submit" className="w-full bg-pink-500 hover:bg-pink-600 text-white" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Mail className="w-4 h-4 mr-2" />
            Send Reset Link
          </>
        )}
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={() => setStep("login")}
          className="text-sm text-gray-500 hover:text-gray-600 flex items-center justify-center"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to login
        </button>
      </div>
    </form>
  )

  const getTitle = () => {
    switch (step) {
      case "2fa":
        return "Two-Factor Authentication"
      case "forgot-password":
        return "Reset Password"
      default:
        return "Admin Panel"
    }
  }

  const getSubtitle = () => {
    switch (step) {
      case "2fa":
        return "Enter the code sent to your email"
      case "forgot-password":
        return "We'll send you a reset link"
      default:
        return "Lashed by Deedee Management"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-pink-200 dark:border-pink-700 shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-pink-100 dark:bg-pink-900/50 rounded-full">
              <Shield className="w-8 h-8 text-pink-500" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">{getTitle()}</CardTitle>
          <p className="text-gray-600 dark:text-gray-300">{getSubtitle()}</p>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg text-sm">
              {message}
            </div>
          )}

          {step === "login" && renderLoginForm()}
          {step === "2fa" && renderTwoFactorForm()}
          {step === "forgot-password" && renderForgotPasswordForm()}
        </CardContent>
      </Card>
    </div>
  )
}
