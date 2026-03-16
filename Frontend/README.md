# BoldTap - NFC Digital Business Card Website

A modern, premium NFC digital business card website built with Next.js, TypeScript, Tailwind CSS, and Framer Motion.

## Features

- 🎨 **Modern Premium Design** - Clean, minimalist design with strong typography and high whitespace
- 📱 **Fully Responsive** - Mobile-first design that works seamlessly on all devices
- ✨ **Smooth Animations** - Framer Motion powered animations and scroll effects
- 🔐 **Authentication System** - Login and registration pages with glassmorphism effects
- 👤 **User Dashboard** - Complete dashboard with profile editing and live preview
- 🛍️ **Product Showcase** - Beautiful product cards with pricing information
- ❓ **FAQ Section** - Interactive accordion-style FAQ section
- 🎯 **SEO Optimized** - Built with Next.js for optimal SEO performance

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:

```bash
npm install
```

2. Run the development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── dashboard/      # User dashboard page
│   ├── login/         # Login page
│   ├── register/      # Registration page
│   ├── globals.css    # Global styles
│   ├── layout.tsx     # Root layout
│   └── page.tsx       # Home page
├── components/
│   ├── Navigation.tsx # Navigation component
│   ├── Hero.tsx       # Hero section
│   ├── Features.tsx   # Features section
│   ├── Products.tsx   # Products & pricing
│   ├── FAQ.tsx        # FAQ section
│   └── Footer.tsx     # Footer component
└── package.json       # Dependencies
```

## Key Components

### Navigation
Sticky navigation bar with smooth scroll behavior and mobile menu.

### Hero Section
Large headline with animated card mockup and call-to-action buttons.

### Features
Grid layout showcasing key features with scroll-triggered animations.

### Products & Pricing
Product cards with hover animations and pricing information.

### Authentication
Modern login and registration pages with glassmorphism effects.

### Dashboard
Complete user dashboard with:
- Profile management
- Information editing
- Live card preview
- Analytics placeholder
- Settings

## Design Principles

- **Typography**: Large, bold headlines with clear hierarchy
- **Colors**: White background, black primary text, minimal color usage
- **Spacing**: High whitespace for premium feel
- **Animations**: Subtle, smooth animations that enhance UX
- **Responsiveness**: Mobile-first approach

## Build for Production

```bash
npm run build
npm start
```

## License

This project is private and proprietary.
