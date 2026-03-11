# SmartStay-India
🏨 AI-Powered Hotel Booking SaaS for India | React + Django + UPI Payments | WhatsApp Bot | Google Maps


# 🚀 MASTER PROMPT — SmartStay India Hotel Booking Platform
## Brilliant Full-Stack Website with Modern UI/UX (GitHub Ready)

---

## 🎯 PROJECT IDENTITY

**Project Name:** SmartStay India  
**Tagline:** "Book Smarter. Stay Better."  
**Target Market:** 🇮🇳 India (Tier 1, 2 & 3 cities + Pilgrimage towns)  
**Stack:** React.js (Vite) + Tailwind CSS + Django REST API + PostgreSQL

---

## 🎨 DESIGN PHILOSOPHY

Build a **stunning, modern SaaS-grade hotel booking website** that feels like a premium product. The design must:

- Feel like a **fusion of Booking.com + MakeMyTrip + Linear.app**
- Use **dark glassmorphism hero sections** with vibrant accent colors
- Be **fully responsive** (Mobile first — Indian users are mobile-heavy)
- Include **smooth Framer Motion animations** on all page transitions
- Use **gradient accents**: `#FF6B35` (saffron orange) → `#7B2FBE` (royal purple) — Indian-themed palette
- Support **Dark Mode + Light Mode toggle**
- Every component must feel **alive** — hover effects, micro-animations, loading skeletons

---

## 🧱 TECH STACK

### Frontend
```
React.js (Vite)
Tailwind CSS
Framer Motion (animations)
React Router DOM v6
Axios (API calls)
React Query (data fetching + caching)
React Hook Form + Zod (form validation)
Recharts (analytics)
Google Maps JS API (@react-google-maps/api)
Lucide React (icons)
React Hot Toast (notifications)
date-fns (date handling)
```

### Backend (Already Built — Connect via API)
```
Django REST Framework
JWT Authentication
PostgreSQL
Razorpay SDK
Twilio WhatsApp API
```

---

## 📁 GITHUB-READY FOLDER STRUCTURE

```
smartstay-india/
├── frontend/
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── assets/
│   │   │   └── logo.svg
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── Badge.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Skeleton.jsx
│   │   │   │   └── Spinner.jsx
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   └── Sidebar.jsx
│   │   │   ├── home/
│   │   │   │   ├── HeroSection.jsx
│   │   │   │   ├── SearchBar.jsx
│   │   │   │   ├── FeaturedHotels.jsx
│   │   │   │   ├── PopularCities.jsx
│   │   │   │   ├── TestimonialsSection.jsx
│   │   │   │   ├── WhyChooseUs.jsx
│   │   │   │   └── StatsSection.jsx
│   │   │   ├── hotel/
│   │   │   │   ├── HotelCard.jsx
│   │   │   │   ├── HotelDetail.jsx
│   │   │   │   ├── HotelMap.jsx
│   │   │   │   ├── RoomCard.jsx
│   │   │   │   ├── AmenitiesGrid.jsx
│   │   │   │   └── ReviewSection.jsx
│   │   │   ├── booking/
│   │   │   │   ├── BookingForm.jsx
│   │   │   │   ├── BookingCard.jsx
│   │   │   │   ├── BookingTimeline.jsx
│   │   │   │   └── PaymentModal.jsx
│   │   │   ├── dashboard/
│   │   │   │   ├── StatsCard.jsx
│   │   │   │   ├── RevenueChart.jsx
│   │   │   │   ├── BookingsTable.jsx
│   │   │   │   └── AIInsightCard.jsx
│   │   │   └── whatsapp/
│   │   │       └── WhatsAppButton.jsx
│   │   ├── pages/
│   │   │   ├── public/
│   │   │   │   ├── HomePage.jsx
│   │   │   │   ├── SearchPage.jsx
│   │   │   │   ├── HotelDetailPage.jsx
│   │   │   │   └── AboutPage.jsx
│   │   │   ├── auth/
│   │   │   │   ├── LoginPage.jsx
│   │   │   │   └── RegisterPage.jsx
│   │   │   ├── customer/
│   │   │   │   ├── CustomerDashboard.jsx
│   │   │   │   ├── MyBookingsPage.jsx
│   │   │   │   └── ProfilePage.jsx
│   │   │   ├── owner/
│   │   │   │   ├── OwnerDashboard.jsx
│   │   │   │   ├── ManageHotelPage.jsx
│   │   │   │   ├── ManageRoomsPage.jsx
│   │   │   │   └── OwnerBookingsPage.jsx
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.jsx
│   │   │       ├── AllHotelsPage.jsx
│   │   │       └── AnalyticsPage.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useHotels.js
│   │   │   ├── useBooking.js
│   │   │   └── useGeolocation.js
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── hotelService.js
│   │   │   ├── bookingService.js
│   │   │   ├── paymentService.js
│   │   │   └── aiService.js
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── utils/
│   │   │   ├── helpers.js
│   │   │   ├── constants.js
│   │   │   ├── haversine.js
│   │   │   └── formatCurrency.js
│   │   ├── routes/
│   │   │   └── ProtectedRoute.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── backend/          (Django — already built)
├── .gitignore
├── README.md
└── docker-compose.yml
```

---

## 🌟 PAGE-BY-PAGE BUILD SPECIFICATION

---

### 🏠 PAGE 1 — HOME PAGE (`HomePage.jsx`)

**Hero Section:**
- Full-screen dark gradient background with animated floating hotel imagery
- Large bold headline: **"Find Your Perfect Stay Across India"**
- Subtext: *"From Mumbai to Puri — Book smarter with AI-powered recommendations"*
- **Smart Search Bar** (inline card with glass effect):
  - City / Location input (with autocomplete)
  - Check-in date picker
  - Check-out date picker
  - Guests selector
  - "🔍 Search Hotels" CTA button (saffron gradient)
- Animated floating UPI badge: "✓ UPI Payments Supported"
- Background: subtle particle animation or floating hotel silhouettes

**Popular Indian Cities Section:**
- Horizontal scrollable cards with city images
- Cities: Mumbai, Delhi, Bangalore, Puri, Varanasi, Jaipur, Goa, Hyderabad, Bhubaneswar, Udaipur
- Each card: city image, name, hotel count badge
- Hover: scale up + glow effect

**Featured Hotels Section:**
- Grid of 6 hotel cards
- Each card includes:
  - Hotel image (gradient placeholder)
  - Name, City, Star rating (⭐)
  - Price per night (₹ formatted)
  - "Available" / "Limited" badge
  - Distance from city center
  - Amenities icons (WiFi, Pool, Gym)
  - "Book Now" button with hover animation

**Why Choose SmartStay India:**
- 4 feature cards with animated icons:
  - 🤖 AI-Powered Recommendations
  - 💳 UPI & Razorpay Payments
  - 📲 WhatsApp Booking Support
  - 🗺 Google Maps Integration

**Stats Counter Section (animated on scroll):**
- 500+ Hotels
- 10,000+ Bookings
- 25+ Cities
- 4.8★ Average Rating

**Testimonials:**
- 3 Indian customer reviews
- Star ratings + avatar initials

---

### 🔐 PAGE 2 — AUTH PAGES

**Login Page:**
- Split layout: Left = animated hotel illustration / Right = form
- Clean form with floating labels
- JWT token handling
- "Remember me" toggle
- Forgot password link
- Google OAuth option (placeholder)
- Role indicator shows after login

**Register Page:**
- Animated role selector at top:
  - 🧳 "I'm a Traveler" (Customer)
  - 🏨 "I'm a Hotel Owner"
- Role-specific form fields appear with slide animation
- Phone number field with +91 flag
- Password strength indicator
- Terms & Conditions checkbox

---

### 🔍 PAGE 3 — SEARCH PAGE (`SearchPage.jsx`)

**Layout:** Left sidebar filters + Right content (list/map toggle)

**Left Sidebar Filters:**
- Price range slider (₹500 — ₹20,000)
- Quick budget buttons: Under ₹999 / ₹1499 / ₹2999
- Distance radius: 10km / 20km / 50km / 100km
- Star rating filter checkboxes
- Amenities checkboxes (WiFi, Pool, AC, Parking, Gym, Restaurant)
- "Near Me" toggle using `navigator.geolocation`

**Top Bar:**
- "Hotels in [City]" heading
- Results count
- Sort dropdown: Price (Low-High) / Rating / Distance / Newest
- List view / Map view toggle buttons

**List View:**
- Hotel cards with horizontal layout (image left, info right)
- Loading skeleton animation while fetching
- Infinite scroll or pagination

**Map View:**
- Full Google Maps with hotel markers
- Custom marker icons (₹ price label on marker)
- Click marker → info popup with "View Details" button
- Radius circle overlay (changes with filter)
- Sync with list — hovering list card highlights map marker

---

### 🏨 PAGE 4 — HOTEL DETAIL PAGE (`HotelDetailPage.jsx`)

- **Image Gallery:** Full-width hero image + 4 thumbnail grid (lightbox on click)
- **Hotel Info Header:** Name, City, Stars, Rating badge, Review count
- **Quick Info Strip:** Price/night | Rooms available | Distance
- **Tabs:** Overview / Rooms / Reviews / Location
- **Amenities Grid:** Icons with labels in clean grid
- **Room Cards Section:**
  - Room type, bed icon, price, availability badge
  - "Book This Room" CTA
- **Google Map Embed:** Hotel location + nearby landmarks
- **Sticky Booking Widget (right sidebar):**
  - Date pickers
  - Guest count
  - Price summary (nights × price)
  - GST calculation
  - "Pay via UPI / Card" button
- **Reviews Section:** Star breakdown + individual reviews
- **WhatsApp Float Button:** "📲 Chat to Book" (fixed bottom right)

---

### 📊 PAGE 5 — CUSTOMER DASHBOARD

**My Bookings:**
- Booking cards with status timeline:
  `Pending → Confirmed → Completed`
- Color-coded badges: Yellow (Pending) / Green (Confirmed) / Red (Cancelled)
- "Pay Now" button for pending payments
- "Cancel Booking" with confirmation modal
- "Download Invoice" (PDF) button

**AI Recommendations Section:**
- "🧠 Recommended for You" carousel
- Based on past bookings

**Profile Section:**
- Edit name, phone
- Booking history stats

---

### 🏨 PAGE 6 — HOTEL OWNER DASHBOARD

**Layout:** Sidebar navigation + main content area

**Sidebar Links:**
- 📊 Overview
- 🏨 My Hotel
- 🛏 Rooms
- 📋 Bookings
- 💰 Revenue
- 🧠 AI Insights

**Overview Cards (animated count-up):**
- Total Revenue (₹)
- Active Bookings
- Available Rooms
- Occupancy Rate (%)

**Revenue Chart:**
- Line chart — last 6 months
- Monthly booking bar chart

**AI Insights Card:**
```
🧠 AI Price Suggestion
Current Price: ₹2,000
Suggested Price: ₹2,450
Reason: Weekend + Festival demand HIGH
Expected Occupancy: 87%
```

**Bookings Table:**
- Booking ID, Customer, Dates, Amount, Status, Action
- Status update dropdown per row

---

### 🔐 PAGE 7 — ADMIN DASHBOARD

**Super admin overview:**
- Platform-wide stats cards
- Revenue by city (India map visualization)
- Monthly revenue line chart
- Top 10 hotels by bookings table
- User growth chart
- Cancellation rate pie chart
- Export buttons (CSV / PDF)

---

## 💳 PAYMENT FLOW UI

When "Pay Now" is clicked:

1. Loading spinner with "Creating secure order..."
2. Payment modal opens with:
   - Booking summary
   - Amount with GST breakdown
   - UPI QR code
   - "Pay via Razorpay" button
3. On success → Green success animation + redirect to My Bookings
4. Auto WhatsApp confirmation message sent

---

## 📲 WHATSAPP FLOATING BUTTON

Fixed position (bottom right, all pages):
```jsx
// Appears on all pages
// Links to WhatsApp Business with pre-filled message
https://wa.me/91XXXXXXXXXX?text=Hi%20SmartStay%2C%20I%20need%20help%20with%20hotel%20booking
```

---

## 🎨 TAILWIND DESIGN TOKENS

```js
// tailwind.config.js
colors: {
  primary: '#FF6B35',      // Saffron Orange
  secondary: '#7B2FBE',    // Royal Purple
  accent: '#00D9B1',       // Teal
  dark: '#0F0F1A',         // Deep navy dark
  card: '#1A1A2E',         // Card dark
  surface: '#16213E',      // Surface dark
}
```

---

## ⚙️ ENVIRONMENT VARIABLES (.env.example)

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
VITE_RAZORPAY_KEY_ID=your_razorpay_key
VITE_WHATSAPP_NUMBER=91XXXXXXXXXX
```

---

## 📄 README.md STRUCTURE (GitHub Ready)

Generate a professional README.md with:

```markdown
# SmartStay India 🏨
> AI-Powered Hotel Booking Platform for India

## 🌟 Features
## 🚀 Tech Stack
## 📸 Screenshots (placeholders)
## ⚙️ Installation
## 🔐 Environment Variables
## 📡 API Documentation
## 🗺 Architecture Diagram
## 🤝 Contributing
## 📄 License (MIT)
```

---

## 📦 COMPLETE OUTPUT REQUIRED

Generate the following in full:

1. All React pages listed above — complete, functional code
2. All reusable components — with Tailwind + Framer Motion
3. Axios service layer — all API calls
4. AuthContext — JWT logic, role routing
5. ThemeContext — Dark/Light mode
6. Protected Route wrapper
7. Google Maps component — markers, radius, info windows
8. Razorpay payment modal component
9. WhatsApp floating button
10. Booking form with date picker + price calculator
11. Recharts dashboard components
12. AI Insight card component
13. Loading skeletons for all data-heavy components
14. tailwind.config.js with custom theme
15. .env.example file
16. Professional README.md
17. .gitignore (React + Django)
18. Setup + run instructions

---

## 🔒 CODE QUALITY STANDARDS

- Clean, commented, modular code
- No hardcoded API keys anywhere
- All API calls through service layer only
- Error boundaries on all pages
- Loading + error + empty states on all lists
- Mobile-first responsive design
- WCAG accessibility basics (aria labels, contrast)
- ESLint + Prettier ready structure
- Production build ready (`npm run build`)

---

## 🚀 DEPLOYMENT READY

Include notes for:

- **Frontend** → Vercel (1-click deploy)
- **Backend** → Railway or Render
- **Database** → Supabase PostgreSQL
- **Domain** → Custom domain setup guide

---

Make this feel like a **₹10 Lakh freelance project** — not a college submission. Every pixel counts. Every interaction matters.
