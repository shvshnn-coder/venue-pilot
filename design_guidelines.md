# AURA Event Navigator - Design Guidelines

## Design Approach
**Reference-Based**: Futuristic tech aesthetic inspired by sci-fi interfaces with cyberpunk elements. Think Blade Runner meets modern mobile apps - high-tech, sleek, and focused on data visualization with glowing accents.

## Core Design Principles
- **Mobile-First**: Strict 420px max width, optimized for phone screens
- **Futuristic Tech**: Blueprint grid patterns, glowing effects, and holographic-style UI elements
- **Dark Mode Only**: Deep space aesthetic with luminescent accents
- **Gesture-Driven**: Swipe interactions as primary navigation pattern for cards

## Typography
**Font Families**:
- Primary: Outfit (300, 400, 500, 700) - body text, UI elements
- Display: Rajdhani (500, 700) - headers, branding, emphasis

**Hierarchy**:
- App Title: 2xl, Rajdhani Bold, letter-spacing widest
- Section Headers: xl-2xl, Rajdhani Medium
- Card Titles: lg-xl, Outfit Medium
- Body Text: sm-base, Outfit Regular
- Labels/Meta: xs-sm, Outfit Light

## Layout System
**Spacing Units**: Tailwind scale - use 2, 4, 6, 8 for tight mobile spacing
- Card padding: p-4 to p-6
- Section gaps: space-y-4
- Container padding: p-4
- Component spacing: gap-2 to gap-4

**Structure**:
- Fixed height container (max-h-[900px])
- Three-tier layout: Header (fixed) → Content (scrollable) → Navigation (fixed)
- Content uses full available height with flex-col

## Component Library

### Cards
- Rounded corners (rounded-lg to rounded-xl)
- Border: 1px border-accent-teal with 20% opacity
- Background: deep-teal with transparency
- Glow effects on borders and interactive elements
- Stacked card pattern: scale and translate transforms for depth

### Navigation
- Bottom fixed navigation with 5 equal-width items
- Icon above label layout
- Backdrop blur effect (backdrop-blur-sm)
- Active state: accent-gold color with glow
- Inactive: text-secondary

### Interactive Elements
- Custom range sliders with glowing gold thumbs
- Swipe cards with gesture detection
- Smooth transitions (0.3s-0.4s cubic-bezier)
- Touch-friendly tap targets (minimum 44px)

### Visual Effects
- **Text Glow**: Double shadow for gold and teal accents
- **Border Glow**: Outer and inner box shadows with rgba transparency
- **Background Pattern**: Blueprint grid (2rem squares) with teal lines at 7% opacity
- **Depth**: Layered cards with blur and opacity reduction
- **Radial Gradient**: Subtle vignette effect from bottom center

## Color System (Pre-Defined)
Already specified in the HTML - use exact CSS variables:
- Charcoal, Deep Teal (backgrounds)
- Accent Teal (primary actions, borders)
- Accent Gold (highlights, active states)
- Text Primary/Secondary (content hierarchy)

## Screen-Specific Patterns

### Discover Screen
- Card stack with max 3 visible layers
- Top card: full interaction
- Cards 2-3: scaled down (95%, 90%) with vertical offset
- Swipe indicators on sides
- Filter tags as pill buttons above stack

### Calendar Screen
- Timeline view with date separators
- Event cards grouped by day
- Time-based visual indicators
- Compact card variant for list view

### Attendees Screen
- Similar swipe pattern as events
- Profile photo prominent with border-accent-gold
- Bio text with tag pills
- Connect/Pass actions

### Profile Screen
- Range sliders for preference tuning
- Labels with current values displayed
- Save button with glow effect
- Avatar circle with border glow

## Images
- **Profile Avatars**: Circular (rounded-full), 32px-40px diameter, gold border with glow
- **Event Cards**: No hero images - focus on typography and iconography
- **POI Icons**: Use SVG icons for venue types
- No large hero sections - app is utility-focused

## Animations
- **Screen Transitions**: Fade in with subtle translateY (10px)
- **Card Swipes**: Transform based on drag distance, rotation on swipe
- **Hover States**: Minimal - slight scale or glow intensity increase
- **Loading States**: Pulse effect on placeholders
- Keep animations under 0.5s duration

## Accessibility
- High contrast text (light on dark)
- Touch targets minimum 44px
- Focus states with visible outlines (accent-teal)
- Range sliders keyboard accessible
- Screen reader labels on icon-only buttons