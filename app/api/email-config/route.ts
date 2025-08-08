import { NextResponse } from "next/server"

// Email configuration diagnostic endpoint
export async function GET() {
  try {
    const emailConfig = {
      NODE_ENV: process.env.NODE_ENV || 'development',
      emailUser: process.env.ZOHO_EMAIL_USER ? 'Set ✅' : 'Missing ❌',
      emailPassword: process.env.ZOHO_EMAIL_PASSWORD ? 'Set ✅' : 'Missing ❌',
      emailUserValue: process.env.ZOHO_EMAIL_USER ? process.env.ZOHO_EMAIL_USER.replace(/(.{3}).*(.{3})/, '$1***$2') : 'Not set',
      smtpConfig: {
        host: 'smtp.zoho.com',
        port: 587,
        secure: false,
        description: 'Using STARTTLS on port 587'
      },
      recommendations: []
    }

    // Add recommendations based on config
    const recommendations = []
    
    if (!process.env.ZOHO_EMAIL_USER) {
      recommendations.push("Set ZOHO_EMAIL_USER environment variable")
    }
    
    if (!process.env.ZOHO_EMAIL_PASSWORD) {
      recommendations.push("Set ZOHO_EMAIL_PASSWORD environment variable with app-specific password")
    }

    if (process.env.NODE_ENV === 'development') {
      recommendations.push("Emails will be logged to console in development mode")
    } else {
      recommendations.push("Emails will be sent via Zoho SMTP in production mode")
    }

    emailConfig.recommendations = recommendations

    return NextResponse.json({
      success: true,
      config: emailConfig,
      troubleshooting: {
        commonIssues: [
          "Zoho account doesn't have SMTP enabled",
          "Using regular password instead of app-specific password", 
          "Firewall blocking port 587",
          "Zoho account suspended or limited"
        ],
        solutions: [
          "Enable SMTP in Zoho Mail settings",
          "Generate app-specific password in Zoho Security settings",
          "Ensure port 587 is open for outbound connections",
          "Check Zoho account status"
        ]
      }
    })

  } catch (error) {
    console.error("❌ Email config check failed:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}