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
Email verification codes are sent via Resend API. The `RESEND_API_KEY` secret is required. Currently using Resend's test domain (onboarding@resend.dev) - to use hello@wayfinder.cool, verify the wayfinder.cool domain in Resend.

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

## Swipes & Connections System

### Swipe Functionality
Users can swipe left (pass) or right (like) on events and attendees. Swipes are persisted to allow filtering of already-seen items.

### API Endpoints
- `POST /api/swipes` - Records a swipe action (userId, targetId, targetType, direction)
- `GET /api/swipes/:userId` - Gets all swipes for a user
- `GET /api/connections/:userId` - Gets all connections for a user
- `DELETE /api/connections/:userId/:connectedUserId` - Removes a connection

### Connections
- Swiping right on an attendee automatically creates a connection
- Connections are displayed in the "Connections" tab of the Attendees screen
- Connections can be removed or users can be reported/blocked

## Interactive Mini Map

### Venue Map Feature
The mini map provides an interactive venue exploration experience with floor-by-floor navigation.

### API Endpoints
- `GET /api/venue/locations` - Gets all venue locations
- `GET /api/venue/locations/:id` - Gets a specific venue location

### Features
- Tap to expand full-screen venue map
- Floor selector (L1, L2, L3, L5) to navigate between levels
- Interactive SVG map with clickable location markers
- Selected location shows name, floor, zone, and event count
- Visual legend for location markers

## Settings System

### Settings Page
Accessible via gear icon in user profile. Provides centralized app configuration.

### API Endpoints
- `GET /api/settings/:userId` - Gets user settings (returns defaults if none exist)
- `POST /api/settings` - Creates or updates user settings

### Features
- Theme selection (Sci-Fi, Basic White, Wild Flowers)
- Language selection (English, Spanish, French, German, Chinese, Japanese)
- Profile editing (name and role)
- Invisible mode toggle (premium feature only)

### Invisible Mode
- Available only for premium users
- When enabled, user is hidden from other attendees
- Stored as user setting in backend

## Chat System

### Messaging for Connected Users
Users who have mutually connected can chat with each other.

### API Endpoints
- `POST /api/chat/messages` - Sends a new message
- `GET /api/chat/messages/:userId1/:userId2` - Gets conversation between two users
- `POST /api/chat/read/:senderId/:receiverId` - Marks messages as read
- `GET /api/chat/unread/:userId` - Gets unread message count

### Features
- Real-time message display with 3-second polling
- Messages grouped by date
- Read receipts
- Accessible from Connections tab via message icon button