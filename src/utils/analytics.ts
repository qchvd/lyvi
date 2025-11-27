import ReactGA from "react-ga4"

declare global {
  interface Window {
    gtag?: (
      command: "consent" | "config" | "event" | "js",
      action: string,
      params?: Record<string, unknown>
    ) => void
  }
}

let isGAInitialized = false

export const initGA = () => {
  if (isGAInitialized) return

  // Initialize with GDPR-compliant default settings
  ReactGA.initialize(import.meta.env.VITE_GA_MEASUREMENT_ID, {
    gaOptions: {
      anonymize_ip: true
    }
  })

  // Set default consent mode
  if (window.gtag) {
    window.gtag("consent", "default", {
      "analytics_storage": "denied"
    })
  }

  isGAInitialized = true
}

// Lazy load GA after user interaction to improve initial page load
export const lazyInitGA = () => {
  if (isGAInitialized) return

  const loadGA = () => {
    initGA()

    // Remove listeners once loaded
    window.removeEventListener("scroll", loadGA)
    window.removeEventListener("mousemove", loadGA)
    window.removeEventListener("touchstart", loadGA)
    window.removeEventListener("click", loadGA)
  }

  // Load on first scroll, movement, touch or click
  window.addEventListener("scroll", loadGA, { once: true, passive: true })
  window.addEventListener("mousemove", loadGA, { once: true, passive: true })
  window.addEventListener("touchstart", loadGA, { once: true, passive: true })
  window.addEventListener("click", loadGA, { once: true, passive: true })

  // Fallback: load after 3 seconds if no interaction
  setTimeout(loadGA, 3000)
}

export const trackPageView = (path: string, lang: string, pageTitle: string) => {
  if (!isGAInitialized) return

  ReactGA.send({
    hitType: "pageview",
    page: path,
    title: pageTitle,
    page_language: lang,
  })
}

export const trackEvent = (category: string, action: string, label?: string) => {
  if (!isGAInitialized) return

  ReactGA.event({
    category: category,
    action: action,
    label: label
  })
}