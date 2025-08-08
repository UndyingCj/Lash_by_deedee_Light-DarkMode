# Lashed by Deedee - Coolify Deployment Guide

This guide will help you deploy the Lashed by Deedee application to Coolify.

## Prerequisites

1. **Coolify Instance**: A running Coolify installation
2. **Git Repository**: Your code should be in a Git repository (GitHub, GitLab, etc.)
3. **Supabase Database**: A configured Supabase project
4. **Paystack Account**: For payment processing
5. **Zoho Mail**: For email sending

## Step 1: Create New Service in Coolify

1. Log into your Coolify dashboard
2. Click "New Service" → "Application"
3. Select your Git provider and repository
4. Choose "Node.js" as the build pack
5. Set the branch to deploy (usually `main` or `master`)

## Step 2: Configure Build Settings

### Build Command (if needed):
```bash
npm run build
```

### Start Command:
```bash
npm start
```

### Port:
```
3000
```

## Step 3: Environment Variables

In Coolify, go to your service → **Environment Variables** and add:

### Required Variables:

```bash
# Admin Authentication
ADMIN_USERNAME=your-secure-admin-username
ADMIN_PASSWORD=your-secure-admin-password
JWT_SECRET=your-64-character-random-secret-key

# Database (Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-from-supabase
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-from-supabase

# Payment Processing (Paystack)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_your-live-public-key
PAYSTACK_SECRET_KEY=sk_live_your-live-secret-key

# Email Service (Zoho)
ZOHO_EMAIL_USER=your-business-email@yourdomain.com
ZOHO_EMAIL_PASSWORD=your-zoho-app-password

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NODE_ENV=production
```

### How to Generate Secure Values:

#### JWT_SECRET:
```bash
# Use this command to generate a secure JWT secret
openssl rand -base64 64
```

#### Admin Password:
Use a strong password generator or create a complex password with:
- At least 12 characters
- Mix of uppercase, lowercase, numbers, symbols

## Step 4: Domain Configuration

1. In Coolify, go to your service → **Domains**
2. Add your custom domain (e.g., `lashedbydeedee.com`)
3. Coolify will automatically handle SSL certificates via Let's Encrypt

## Step 5: Database Setup (Supabase)

### Required Tables:
The app expects these tables in Supabase:

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
```

### Row Level Security (RLS):
If you want to enable RLS, make sure your service role key has bypass permissions.

## Step 6: Paystack Configuration

1. **Live Mode**: Use `pk_live_` and `sk_live_` keys for production
2. **Webhook Setup**: 
   - Go to Paystack Dashboard → Settings → Webhooks
   - Add webhook URL: `https://your-domain.com/api/payments/webhook`
   - Select events: `charge.success`, `charge.failed`

## Step 7: Zoho Mail Configuration

1. **Create App Password**:
   - Go to Zoho Mail → Settings → Security
   - Generate an app-specific password
   - Use this password in `ZOHO_EMAIL_PASSWORD`

2. **SMTP Settings**: The app uses:
   - Host: `smtp.zoho.com`
   - Port: `587`
   - Security: STARTTLS

## Step 8: Deploy

1. In Coolify, click **Deploy** on your service
2. Monitor the build logs
3. Once deployed, test the application:
   - Main website: `https://your-domain.com`
   - Admin login: `https://your-domain.com/egusi`

## Step 9: Post-Deployment Testing

### Test Admin Access:
1. Go to `https://your-domain.com/egusi`
2. Login with your configured `ADMIN_USERNAME` and `ADMIN_PASSWORD`
3. Verify all admin pages load correctly

### Test Booking Flow:
1. Go to booking page: `https://your-domain.com/book`
2. Make a test booking (use small amount)
3. Complete payment with test card
4. Verify emails are sent
5. Check admin panel for new booking

### Test Email System:
- Customer should receive booking confirmation
- Admin should receive booking notification
- Check spam folders initially

## Troubleshooting

### Common Issues:

1. **Build Fails with "Missing env vars"**:
   - This is expected if you haven't set environment variables yet
   - The build should complete with warnings, not errors

2. **Admin Login Not Working**:
   - Check `ADMIN_USERNAME` and `ADMIN_PASSWORD` are set correctly
   - Verify `JWT_SECRET` is at least 32 characters

3. **Database Connection Issues**:
   - Verify Supabase URL and keys are correct
   - Check Supabase project is active
   - Ensure RLS policies allow service role access

4. **Email Not Sending**:
   - Verify Zoho credentials
   - Check if Zoho account has SMTP enabled
   - Look at application logs for email errors

5. **Payment Issues**:
   - Ensure you're using LIVE Paystack keys for production
   - Verify webhook URL is accessible from internet
   - Check Paystack dashboard for failed webhook attempts

## Monitoring

### Coolify Logs:
- Monitor application logs in Coolify dashboard
- Check for environment validation warnings
- Look for database connection errors

### Health Checks:
The app includes a health check endpoint: `/api/auth/verify`
Coolify can use this for monitoring.

## Security Checklist

- ✅ Strong admin credentials set
- ✅ JWT secret is 64+ characters
- ✅ Using HTTPS (Coolify handles this)
- ✅ Supabase RLS configured if needed
- ✅ Paystack webhook secured
- ✅ Email credentials protected

## Support

For deployment issues specific to this application:
1. Check Coolify logs first
2. Verify environment variables are set correctly
3. Test database connectivity
4. Check external service integrations (Paystack, Zoho)

## Updates

To update the application:
1. Push changes to your Git repository
2. Coolify will auto-deploy if auto-deploy is enabled
3. Or manually trigger deployment in Coolify dashboard