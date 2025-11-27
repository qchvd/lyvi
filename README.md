# Lyvi

A modern, multilingual healthcare professional website built with React and TypeScript, featuring comprehensive SEO optimization and accessibility-first design.

## Key Features

- **Fully Multilingual (FR/DE/EN)** - Complete internationalization with:
Automatic language detection based on browser settings
Language switcher in the header
Translated URL slugs for better local SEO
Persistent language preference in localStorage
- **Fully Responsive** - Mobile-first design with fluid typography and container queries
- **Spam-Proof Contact Form** - Protected by Netlify Forms with honeypot technique
- **WCAG Accessible** - Semantic HTML, ARIA labels, keyboard navigation, and screen reader support
- **Performance Optimized** - Code splitting, lazy loading, and optimized bundle size
- **Smooth Animations** - Framer Motion with custom typewriter effects and scroll animations
- **SEO Ready** - Dynamic meta tags, Open Graph, structured data, and localized sitemaps

## Tech Stack

### Core
- **React 19**
- **TypeScript**
- **Vite**
- **React Router v7**

### Styling
- **Tailwind CSS v4**
- **Framer Motion** - Production-ready animation library
- **Custom Fluid Typography** - Container query-based responsive design

### Internationalization
- **i18next** - Complete i18n solution

### Forms & Validation
- **Formik** - Form state management
- **Yup** - Schema-based form validation
- **Netlify Forms** - Serverless form handling with spam protection

### SEO & Analytics
- **react-helmet-async** - Dynamic meta tag management
- **Google Analytics 4**
- **react-cookie-consent** - GDPR-compliant cookie consent

### Additional Features
- **@studio-freight/lenis** - Smooth scroll experience
- **Prerendering** - Static HTML generation for SEO

## Prerequisites

- Node.js >= 18.x
- npm or yarn

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/lyvi.git
   cd lyvi
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:
   ```env
   VITE_GA_MEASUREMENT_ID=your_google_analytics_id
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

## Build

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run optimize-images` - Optimize images with Sharp
- `npm run prerender` - Generate static HTML pages

## Project Structure

```
lymphacare/
├── public/                  # Static assets and public files
│   ├── locales/             # Global translation files
│   │   ├── fr/
│   │   ├── de/
│   │   └── en/
│   ├── images/
│   ├── fonts/
│   ├── lyviFavicon.svg
│   ├── og-image.jpg         # Open Graph image
│   ├── robots.txt           # SEO robots file
│   ├── sitemap.xml
│   └── contact.html         # Netlify form handler
├── src/
│   ├── assets/
│   │   ├── images/
│   │   └── logos/
│   ├── components/
│   │   ├── footer/          # Footer specific components
│   │   ├── header/          # Header specific components
│   │   ├── home/            # Home page specific components
│   │   ├── pages/           # Page-level components
│   │   ├── routes/          # Routing components
│   │   ├── treatments/      # Treatments page specific components
│   │   ├── CookieBanner.tsx
│   │   └── ScrollToTop.tsx
│   ├── constants/           # Application constants
│   │   ├── contactInfo.tsx
│   │   └── urls.ts
│   ├── contexts/            # React contexts
│   │   └── SidebarContext.tsx
│   ├── hooks/               # Custom React hooks
│   ├── locales/             # Home page translations for better bundle performance
│   │   ├── fr/
│   │   ├── de/
│   │   └── en/
│   ├── types/               # TypeScript type definitions
│   │   ├── form.ts
│   │   ├── svg.d.ts
│   │   └── window.d.ts
│   ├── utils/               # Utility functions
│   │   └── analytics.ts
│   ├── App.tsx              # Main App component
│   ├── main.tsx             # Application entry point
│   ├── i18n.ts              # i18next configuration
│   ├── index.css            # Global styles & Tailwind
│   └── vite-env.d.ts        # Vite type definitions
├── scripts/                 # Build & optimization scripts
│   ├── copy-static-files.cjs
│   └── resize-images.js
├── eslint.config.js         # ESLint configuration
├── index.html               # HTML entry point
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
├── tsconfig.app.json        # TypeScript app-specific config
├── tsconfig.node.json       # TypeScript node-specific config
├── netlify.toml             # Netlify deployment config
├── prerender.config.js      # Prerendering configuration
├── package.json             # Dependencies and scripts
└── README.md                # Project documentation
```

## License

© 2025 All rights reserved.

---