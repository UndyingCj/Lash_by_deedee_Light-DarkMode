// Environment variable validation
// Ensures all required environment variables are present

interface RequiredEnvVars {
  // Database & Supabase
  NEXT_PUBLIC_SUPABASE_URL: string
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string
  SUPABASE_SERVICE_ROLE_KEY: string
  
  // Authentication
  ADMIN_USERNAME: string
  ADMIN_PASSWORD: string
  JWT_SECRET: string
  
  // Payment (Paystack)
  NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: string
  PAYSTACK_SECRET_KEY: string
  
  // Email (Zoho)
  ZOHO_EMAIL_USER: string
  ZOHO_EMAIL_PASSWORD: string
  
  // Site URL
  NEXT_PUBLIC_SITE_URL: string
}

// Optional environment variables with defaults
interface OptionalEnvVars {
  NODE_ENV: string
  ZOHO_CLIENT_ID?: string
  ZOHO_CLIENT_SECRET?: string
  ZOHO_REFRESH_TOKEN?: string
}

export function validateEnvironment(): { success: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Required environment variables
  const requiredVars: (keyof RequiredEnvVars)[] = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'ADMIN_USERNAME',
    'ADMIN_PASSWORD',
    'JWT_SECRET',
    'NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY',
    'PAYSTACK_SECRET_KEY',
    'ZOHO_EMAIL_USER',
    'ZOHO_EMAIL_PASSWORD',
    'NEXT_PUBLIC_SITE_URL'
  ]
  
  // Check each required variable
  for (const varName of requiredVars) {
    const value = process.env[varName]
    if (!value || value.trim() === '') {
      errors.push(`Missing required environment variable: ${varName}`)
    }
  }
  
  // Additional validation checks
  
  // JWT Secret should be at least 32 characters for security
  const jwtSecret = process.env.JWT_SECRET
  if (jwtSecret && jwtSecret.length < 32) {
    errors.push('JWT_SECRET must be at least 32 characters long for security')
  }
  
  // Validate URL formats
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (supabaseUrl && !supabaseUrl.startsWith('https://')) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL must start with https://')
  }
  
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (siteUrl && !siteUrl.startsWith('http')) {
    errors.push('NEXT_PUBLIC_SITE_URL must start with http:// or https://')
  }
  
  // Validate email format
  const zohoEmail = process.env.ZOHO_EMAIL_USER
  if (zohoEmail && !zohoEmail.includes('@')) {
    errors.push('ZOHO_EMAIL_USER must be a valid email address')
  }
  
  return {
    success: errors.length === 0,
    errors
  }
}

// Log environment validation results
export function logEnvironmentStatus(): void {
  const validation = validateEnvironment()
  
  if (validation.success) {
    console.log('✅ All required environment variables are set')
  } else {
    console.error('❌ Environment validation failed:')
    validation.errors.forEach(error => console.error(`  - ${error}`))
    
    // Only throw error in actual production deployment, not during build
    // Coolify sets NODE_ENV=production during runtime, not build
    if (process.env.NODE_ENV === 'production' && 
        (process.env.VERCEL === '1' || 
         process.env.RAILWAY_ENVIRONMENT === 'production' || 
         process.env.COOLIFY_DEPLOYMENT === 'true' ||
         process.env.DOCKER_CONTAINER === 'true')) {
      throw new Error('Missing required environment variables in production')
    }
    
    console.warn('⚠️ Running with missing environment variables (development mode)')
  }
}

// Get validated environment variables with proper types
export function getValidatedEnv(): RequiredEnvVars & OptionalEnvVars {
  const validation = validateEnvironment()
  
  if (!validation.success) {
    throw new Error(`Environment validation failed: ${validation.errors.join(', ')}`)
  }
  
  return {
    // Required vars
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    ADMIN_USERNAME: process.env.ADMIN_USERNAME!,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD!,
    JWT_SECRET: process.env.JWT_SECRET!,
    NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
    PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY!,
    ZOHO_EMAIL_USER: process.env.ZOHO_EMAIL_USER!,
    ZOHO_EMAIL_PASSWORD: process.env.ZOHO_EMAIL_PASSWORD!,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL!,
    
    // Optional vars with defaults
    NODE_ENV: process.env.NODE_ENV || 'development',
    ZOHO_CLIENT_ID: process.env.ZOHO_CLIENT_ID,
    ZOHO_CLIENT_SECRET: process.env.ZOHO_CLIENT_SECRET,
    ZOHO_REFRESH_TOKEN: process.env.ZOHO_REFRESH_TOKEN,
  }
}