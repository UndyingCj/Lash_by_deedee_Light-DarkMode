# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands
- **Development server**: `npm run dev` (Next.js development server)
- **Production build**: `npm run build` 
- **Linting**: `npm run lint`
- **Production start**: `npm start`

### Package Management
- This project uses `pnpm` (evidenced by `pnpm-lock.yaml`)
- Install dependencies: `pnpm install`

## Architecture Overview

### Tech Stack
- **Frontend**: Next.js 15.2.4 with React 19, TypeScript
- **Styling**: Tailwind CSS with dark mode support (`next-themes`)
- **UI Components**: Radix UI primitives with shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **Payments**: Paystack integration
- **Email**: Simple logging system (replaces previous Resend/Zoho implementations)

### Project Structure

#### App Router Architecture
- Uses Next.js 13+ app router structure
- Main routes: `/`, `/about`, `/book`, `/services`, `/gallery`, `/reviews`, `/faqs`, `/contact`, `/policies`, `/training`
- Admin panel at `/egusi/*` routes (dashboard, bookings, calendar, clients, analytics, settings)

#### Key Directories
- `app/` - Next.js app router pages and API routes
- `components/` - Reusable React components
- `lib/` - Utility functions and integrations
- `hooks/` - Custom React hooks
- `public/images/` - Static image assets
- `scripts/` - Database and system maintenance scripts

### Database Integration

#### Supabase Setup
- Client-side: `lib/supabase.ts` - uses public anon key
- Server-side: `lib/supabase-admin.ts` - uses service role key for admin operations
- Main tables: `bookings`, `blocked_dates`, `blocked_time_slots`

#### Core Database Operations
- Booking management (create, read, update)
- Date/time slot blocking
- Payment status tracking
- Dashboard statistics

### Payment System

#### Paystack Integration (`lib/paystack.ts`)
- Initialize payments with metadata
- Verify payment status
- Webhook handling at `/api/payments/webhook`
- Currency: Nigerian Naira (NGN)

### Email System

#### Current Implementation (`lib/email.ts`)
- **Simple logging system** - emails are logged to console
- No external email service dependencies
- Three email types: customer confirmation, admin notification, booking reminders
- All emails return success for development/testing

### Admin Panel

#### Access & Structure
- Admin routes under `/egusi/*` 
- Separate layout with custom styling
- Key admin features:
  - Dashboard with booking stats
  - Booking management
  - Calendar view with blocking capabilities
  - Client management
  - Analytics
  - Settings

### Component Architecture

#### UI Components (`components/ui/`)
- shadcn/ui implementation with Radix UI primitives
- Consistent design system with CSS variables
- Dark mode support throughout

#### Specialized Components
- `paystack-payment.tsx` - Payment integration component
- `admin/` - Admin-specific components
- `theme-provider.tsx` & `theme-toggle.tsx` - Dark/light mode

### Configuration Notes

#### Environment Variables
- Extensive environment configuration in `next.config.mjs`
- Supabase, Paystack, and email service credentials
- Build optimizations: ESLint and TypeScript errors ignored during build

#### Styling
- Tailwind with CSS variables for theming
- Custom color palette defined in `tailwind.config.ts`
- Global styles in `app/globals.css`

### Development Notes

#### Type Safety
- TypeScript with strict configuration
- Custom interfaces in `lib/supabase.ts` for database schemas
- Form validation with Zod

#### Scripts Directory
- Contains numerous database maintenance and testing scripts
- Use for database schema fixes, testing integrations, and system checks

#### Unique Naming
- Admin panel uses "egusi" as route prefix (creative naming choice)
- Payment references use "LBD_" prefix

### Known Patterns

1. **Database operations**: Use admin client for server-side operations, regular client for client-side
2. **Error handling**: Comprehensive console logging throughout
3. **Payment flow**: Initialize → verify → update booking status
4. **Admin access**: No authentication shown in reviewed files - verify security implementation
5. **Email fallback**: Current system logs emails instead of sending - ready for production email service integration