# Lashed by Deedee - Production Deployment Guide

## 🚀 Overview

This is a complete booking management system for beauty services built with Next.js 15, featuring secure authentication, payment processing, email notifications, and admin dashboard.

## ✨ Features

### Customer Features
- 🏠 Professional landing page with service showcase
- 📅 Real-time booking system with availability checking
- 💳 Secure payment processing via Paystack
- 📧 Automated email confirmations
- 📱 Mobile-responsive design
- 🌙 Dark/light mode support

### Admin Features  
- 🔐 Secure JWT-based authentication
- 📊 Dashboard with booking analytics
- 📋 Booking management (view, update, cancel)
- 🗓️ Calendar view with time slot blocking
- 👥 Client management
- ⚙️ Settings and configuration

### Technical Features
- 🛡️ Secure authentication with HTTP-only cookies
- 🗄️ Supabase database integration
- 💸 Paystack payment processing
- 📧 Production email system (Zoho SMTP)
- 🐳 Docker support for containerized deployment
- 📈 Health monitoring endpoints
- 🔍 Comprehensive logging

## 🛠️ Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS
- **UI Components:** Radix UI + shadcn/ui
- **Database:** Supabase (PostgreSQL)
- **Authentication:** JWT with HTTP-only cookies
- **Payments:** Paystack
- **Email:** Zoho Mail SMTP / Nodemailer
- **Deployment:** Docker, Coolify, Vercel

## 📋 Prerequisites

Before deploying, ensure you have:

1. **Node.js 18+** installed locally
2. **Supabase account** and project
3. **Paystack account** (Nigerian payment processor)  
4. **Zoho Mail account** with SMTP enabled
5. **Domain name** for production deployment

## ⚙️ Environment Variables

Create a `.env.local` file in the root directory with these variables:

### Required Variables

```bash
# 🔐 ADMIN AUTHENTICATION
ADMIN_USERNAME=your-secure-admin-username
ADMIN_PASSWORD=your-secure-admin-password  
JWT_SECRET=your-64-character-jwt-secret-key

# 🗄️ DATABASE (Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 💳 PAYMENTS (Paystack)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_your-live-public-key
PAYSTACK_SECRET_KEY=sk_live_your-live-secret-key

# 📧 EMAIL SERVICE (Zoho)
ZOHO_EMAIL_USER=admin@yourdomain.com
ZOHO_EMAIL_PASSWORD=your-zoho-app-password

# 🌐 SITE CONFIGURATION
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NODE_ENV=production
```

### How to Get These Values:

#### 🔑 JWT Secret
```bash
# Generate a secure 64-character secret
openssl rand -base64 64
```

#### 🗄️ Supabase Setup
1. Go to [supabase.com](https://supabase.com) → Create new project
2. Go to Settings → API → Copy the URLs and keys
3. **Important:** Enable Row Level Security (RLS) on tables

#### 💳 Paystack Setup  
1. Sign up at [paystack.com](https://paystack.com)
2. Go to Settings → API Keys & Webhooks
3. **Production:** Use `pk_live_` and `sk_live_` keys
4. **Testing:** Use `pk_test_` and `sk_test_` keys

#### 📧 Zoho Mail Setup
1. Sign up for Zoho Mail business account
2. Go to Settings → Security → App Passwords
3. Generate app-specific password (don't use regular password)
4. Enable SMTP access in mail settings

## 🗄️ Database Schema

Run these SQL commands in your Supabase SQL editor:

```sql
-- Bookings table
CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  client_name VARCHAR NOT NULL,
  client_email VARCHAR NOT NULL,
  client_phone VARCHAR,
  phone VARCHAR,
  email VARCHAR,
  service_name VARCHAR NOT NULL,
  service VARCHAR,
  booking_date DATE NOT NULL,
  booking_time VARCHAR NOT NULL,
  total_amount INTEGER NOT NULL,
  amount INTEGER,
  deposit_amount INTEGER,
  payment_status VARCHAR DEFAULT 'pending',
  payment_reference VARCHAR,
  special_notes TEXT,
  notes TEXT,
  status VARCHAR DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Blocked dates table
CREATE TABLE blocked_dates (
  id SERIAL PRIMARY KEY,
  blocked_date DATE NOT NULL UNIQUE,
  reason VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Blocked time slots table  
CREATE TABLE blocked_time_slots (
  id SERIAL PRIMARY KEY,
  blocked_date DATE NOT NULL,
  blocked_time VARCHAR NOT NULL,
  reason VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(blocked_date, blocked_time)
);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;  
ALTER TABLE blocked_time_slots ENABLE ROW LEVEL SECURITY;

-- Create policies (allow service role to bypass RLS)
CREATE POLICY "Enable all access for service role" ON bookings 
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Enable all access for service role" ON blocked_dates
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Enable all access for service role" ON blocked_time_slots  
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
```

## 💳 Paystack Webhook Configuration

1. Go to Paystack Dashboard → Settings → Webhooks
2. Add webhook URL: `https://yourdomain.com/api/payments/webhook`  
3. Select events: `charge.success` and `charge.failed`
4. Save and activate webhook

## 🚀 Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in your actual values in .env.local

# Run development server
npm run dev

# Open browser
open http://localhost:3000
```

### Testing Locally:

1. **Main site:** http://localhost:3000
2. **Admin login:** http://localhost:3000/egusi  
3. **Health check:** http://localhost:3000/api/health
4. **Email config check:** http://localhost:3000/api/email-config
5. **Test emails:** http://localhost:3000/api/test-email?email=your@email.com

## 🐳 Production Deployment

### Option 1: Coolify (Recommended)

1. **Create Application:**
   - Go to Coolify dashboard → New Resource → Application
   - Select "Public Repository" → Enter GitHub URL
   - Build pack will auto-detect as Node.js

2. **Set Environment Variables:**
   - Copy all variables from `.env.example`
   - Fill with production values in Coolify dashboard

3. **Add Domain:**
   - Go to Domains section
   - Add your custom domain
   - SSL is handled automatically

4. **Deploy:**
   - Click Deploy button
   - Monitor build logs
   - Test deployment

### Option 2: Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Add custom domain in Vercel dashboard
```

### Option 3: Docker

```bash
# Build image
docker build -t lashed-by-deedee .

# Run container  
docker run -p 3000:3000 --env-file .env.local lashed-by-deedee
```

## 🔍 API Documentation

### Public APIs

#### Booking APIs
- `POST /api/payments/initialize` - Initialize payment
- `POST /api/payments/verify` - Verify payment  
- `POST /api/payments/webhook` - Paystack webhook (internal)

#### System APIs
- `GET /api/health` - System health check
- `GET /api/email-config` - Email configuration status

### Admin APIs (Authentication Required)

#### Authentication  
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout
- `GET /api/auth/verify` - Verify JWT token

#### Booking Management
- `GET /api/admin/bookings` - Get all bookings
- `GET /api/admin/bookings?status=confirmed` - Filter by status
- `GET /api/admin/bookings?date=2025-01-15` - Filter by date

#### Calendar Management  
- `GET /api/admin/calendar` - Get calendar data
- `POST /api/admin/calendar` - Block date/time  
- `DELETE /api/admin/calendar` - Unblock date/time

#### Analytics
- `GET /api/admin/analytics` - Get analytics data
- `GET /api/admin/analytics?range=30` - Get data for last N days

#### Admin Settings
- `GET /api/admin/settings` - Get settings
- `PUT /api/admin/settings` - Update settings

### API Response Format

```json
{
  "success": true,
  "message": "Operation completed successfully", 
  "data": { /* response data */ }
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error message",
  "message": "Human readable message"
}
```

## 📧 Email System

The app sends automated emails for:

### Customer Emails
- ✅ Booking confirmation after payment
- 📅 Appointment reminders (24h before)  
- ❌ Cancellation notifications

### Admin Emails  
- 🚨 New booking notifications
- 📊 Daily/weekly summaries
- ⚠️ System alerts

### Email Configuration Testing

```bash
# Test email system
curl "https://yourdomain.com/api/test-email?email=test@example.com"

# Check email configuration  
curl "https://yourdomain.com/api/email-config"
```

## 🛡️ Security Features

### Authentication
- 🔐 JWT tokens stored in HTTP-only cookies
- 🔒 Password hashing with SHA-256  
- 🛡️ CSRF protection via SameSite cookies
- ⏰ Token expiration (24 hours)

### API Protection
- 🔑 All admin routes require authentication
- 🚫 Rate limiting on sensitive endpoints
- 🔍 Request validation and sanitization
- 📝 Comprehensive audit logging

### Data Protection  
- 🗄️ Database Row Level Security (RLS)
- 🔐 Environment variable validation
- 🚀 Secure webhook signature verification
- 🛡️ Input validation with Zod schemas

## 📊 Monitoring & Health Checks

### Health Endpoints
- `GET /api/health` - Overall system health
- `GET /api/email-config` - Email system status  
- `GET /api/auth/verify` - Authentication status

### Logging
- 📝 Comprehensive console logging
- 🔍 Error tracking and debugging
- 📊 Payment processing logs
- 📧 Email delivery status logs

### Metrics to Monitor
- 💰 Payment success/failure rates
- 📧 Email delivery rates  
- 🔐 Authentication failures
- 📅 Booking conversion rates

## 🐛 Troubleshooting

### Common Issues

#### Emails Not Sending
```bash
# Check email configuration
curl "https://yourdomain.com/api/email-config"

# Test email sending  
curl "https://yourdomain.com/api/test-email?email=your@email.com"

# Check logs for email errors
```

**Solutions:**
- Verify Zoho app password is correct
- Ensure SMTP is enabled in Zoho account  
- Check firewall allows port 587 outbound
- Verify domain DNS records

#### Admin Login Issues
**Solutions:**
- Check `ADMIN_USERNAME` and `ADMIN_PASSWORD` env vars
- Verify `JWT_SECRET` is at least 32 characters
- Clear browser cookies and try again
- Check server logs for authentication errors

#### Payment Processing Issues  
**Solutions:**
- Verify Paystack keys are correct (live vs test)
- Check webhook URL is accessible from internet
- Verify webhook signature verification  
- Check Paystack dashboard for failed attempts

#### Database Connection Issues
**Solutions:**  
- Verify Supabase URL and keys
- Check Supabase project is active
- Ensure RLS policies allow service role access
- Check database connection limits

### Debug Mode

Set `NODE_ENV=development` to enable:
- 📧 Email logging instead of sending
- 🔍 Detailed error messages  
- 📝 Verbose console logging
- 🚫 Relaxed security checks

## 📞 Support

For technical issues:

1. **Check logs** in your deployment platform
2. **Test health endpoints** for system status  
3. **Verify environment variables** are set correctly
4. **Check external service status** (Supabase, Paystack, Zoho)

## 📜 License

This project is private and proprietary. All rights reserved.

## 🎉 Deployment Checklist

- [ ] All environment variables set
- [ ] Database tables created
- [ ] Paystack webhook configured  
- [ ] Domain and SSL configured
- [ ] Admin login working
- [ ] Test booking flow completed
- [ ] Emails sending successfully  
- [ ] Health checks passing

**You're ready for production! 🚀**