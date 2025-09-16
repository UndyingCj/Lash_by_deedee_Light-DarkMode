# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is "Lashed by Deedee" - a professional lash and brow services booking website built with Next.js. The application is a v0.dev generated project that handles customer bookings, payments via Paystack, and includes an admin dashboard for managing appointments.

## Development Commands
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## Technology Stack
- **Framework**: Next.js 15.2.4 with React 19
- **Styling**: Tailwind CSS with dark mode support via next-themes
- **UI Components**: Radix UI primitives with custom components in `/components/ui/`
- **Database**: Supabase (PostgreSQL) with direct client usage
- **Payment Processing**: Paystack integration
- **Email**: Zoho Mail API (Resend was removed)
- **Form Handling**: React Hook Form with Zod validation
- **Icons**: Lucide React

## Key Architecture Patterns

### Database Layer
- Supabase client configurations in `/lib/supabase.ts` and `/lib/supabase-admin.ts`
- Database operations use both client-side and admin (service role) clients
- Main tables: `bookings`, `blocked_dates`, `blocked_time_slots`
- All booking operations include comprehensive error handling and logging

### Payment Flow
- Paystack integration in `/lib/paystack.ts` and `/components/paystack-payment.tsx`
- Payment initialization stores pending bookings before processing
- Payment verification updates booking status and sends confirmation emails
- All monetary amounts converted to kobo (multiply by 100) for Paystack API

### Admin System
- Admin routes under `/app/egusi/` (custom admin path)
- Admin components in `/components/admin/`
- Features: booking management, calendar view, analytics, client management
- Comprehensive dashboard with real-time statistics

### API Routes Structure
- `/api/admin/` - Administrative endpoints (bookings, analytics, calendar, etc.)
- `/api/payments/` - Payment processing (initialize, verify, webhook)
- Server-side operations use Supabase service role key for elevated permissions

### Email System
- Email templates in `/components/emails/`
- Zoho Mail API integration in `/lib/email.ts`
- Booking confirmations and notifications sent automatically

## Environment Variables Required
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
PAYSTACK_SECRET_KEY
NEXT_PUBLIC_SITE_URL
ZOHO_EMAIL_USER
ZOHO_EMAIL_PASSWORD
ZOHO_CLIENT_ID
ZOHO_CLIENT_SECRET
ZOHO_REFRESH_TOKEN
```

## Development Notes
- The project uses TypeScript with build error ignoring enabled in next.config.mjs
- ESLint is configured but ignored during builds
- Comprehensive logging throughout for debugging payment and booking flows
- Dark mode support implemented throughout with proper theme switching
- Mobile-responsive design with Tailwind CSS
- All times and dates handled in local timezone with proper formatting