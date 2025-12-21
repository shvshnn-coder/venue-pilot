# Grid Way Event Navigator

## Overview

Grid Way is a mobile-first event discovery and networking application designed for conferences and venues. The app features a futuristic, sci-fi inspired dark theme with swipe-based card interactions for discovering events and connecting with attendees. Users can browse events, manage their calendar, network with other attendees, and customize their preferences through an intuitive gesture-driven interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with custom configuration for development and production
- **Styling**: Tailwind CSS with custom design tokens for futuristic theme
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **State Management**: React Query for server state, React useState for local state
- **Path Aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Structure**: RESTful endpoints prefixed with `/api`
- **Development**: Hot module replacement via Vite middleware
- **Production**: esbuild bundled server with static file serving

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` for shared type definitions
- **Validation**: Zod schemas generated from Drizzle schemas via drizzle-zod
- **Storage Interface**: Abstract `IStorage` interface with in-memory implementation (ready for database migration)

### Design System
- **Theme**: Dark mode only with cyberpunk/sci-fi aesthetic
- **Mobile Constraint**: Strict 420px max width, optimized for phone screens
- **Typography**: Outfit (body) and Rajdhani (display) font families
- **Color Palette**: Charcoal background, teal and gold accent colors
- **Interactions**: Swipe gestures as primary navigation for card-based content

### Application Structure
- **Screens**: Home, Discover, Calendar, Attendees, Profile
- **Navigation**: Fixed bottom navigation with five tabs
- **Card System**: Stacked swipeable cards for events and attendees
- **Layout**: Three-tier (header, scrollable content, navigation)

## External Dependencies

### Database
- **PostgreSQL**: Primary database configured via `DATABASE_URL` environment variable
- **Drizzle Kit**: Database migrations stored in `./migrations` directory

### UI Libraries
- **Radix UI**: Complete set of accessible primitives (dialog, popover, tabs, etc.)
- **Lucide React**: Icon library
- **Embla Carousel**: Carousel functionality
- **React Day Picker**: Calendar component

### Development Tools
- **Replit Plugins**: Runtime error overlay, cartographer, and dev banner for Replit environment
- **TypeScript**: Strict mode with bundler module resolution

### Fonts
- **Google Fonts**: Outfit (300, 400, 500, 700) and Rajdhani (500, 700) loaded via CDN

## Authentication System

### Phone/Email Verification Login
Users can sign up and log in using their phone number or email address. A 6-digit verification code is sent to confirm their identity.

### API Endpoints
- `POST /api/auth/send-code` - Sends verification code to email or phone
- `POST /api/auth/verify-code` - Verifies the code and creates/retrieves user
- `PATCH /api/auth/user/:id` - Updates user profile (name, avatar)

### Email Verification
Email verification codes are sent via Resend API. The `RESEND_API_KEY` secret is required.

### SMS Verification
SMS verification is configured via Twilio. The following secrets are required:
- `TWILIO_ACCOUNT_SID` - Your Twilio Account SID
- `TWILIO_AUTH_TOKEN` - Your Twilio Auth Token
- `TWILIO_PHONE_NUMBER` - Your Twilio phone number (format: +1XXXXXXXXXX)

If Twilio is not configured, verification codes will be logged to the server console as a fallback.

### Current Implementation
- Verification codes expire after 10 minutes
- Users are created on first successful verification
- Profile data (name, avatar) is collected after verification
- All user data currently stored in-memory (MemStorage)

## Report & Block System

### Email Integration
Reports are sent to `hello@wayfinder.cool` via Resend API. The `RESEND_API_KEY` secret must be configured for email delivery to work.

### Current Implementation
- Reports and blocks are stored in-memory (MemStorage)
- Report reasons: Harassment, Inappropriate content, Spam/scam, Fake profile, Offensive behavior, Privacy violation, Other
- Users can report AND block simultaneously
- Block status can be checked and removed
- Email notifications sent via Resend when reports are submitted