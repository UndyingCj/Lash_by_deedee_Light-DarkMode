import { NextResponse } from "next/server"

// Simple health check endpoint for Coolify monitoring
export async function GET() {
  try {
    // Basic health checks
    const checks = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0'
    }

    // Check if critical environment variables exist (without exposing values)
    const criticalEnvs = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY',
      'ADMIN_USERNAME',
      'JWT_SECRET'
    ]

    const envStatus = criticalEnvs.reduce((acc, envVar) => {
      acc[envVar] = process.env[envVar] ? 'set' : 'missing'
      return acc
    }, {} as Record<string, string>)

    return NextResponse.json({
      ...checks,
      environment_variables: envStatus
    }, { status: 200 })

  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    }, { status: 500 })
  }
}