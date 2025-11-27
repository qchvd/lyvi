import { useEffect, useRef } from "react"
import { useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"

type RouteKey = "home" | "about" | "treatments" | "benefits" | "contact" | "faq"

// All valid route keys for mapping slugs to normalized paths
const ROUTE_KEYS: RouteKey[] = ['home', 'about', 'treatments', 'benefits', 'contact', 'faq']

/**
 * Component that handles scroll behavior on navigation
 *
 * Behavior:
 * - On actual route change (e.g., /about → /contact): Scrolls to top
 * - On language change only (e.g., /en/about → /fr/a-propos): Preserves scroll position and emits 'languagechange' event
 *
 * Note: Uses Lenis smooth scroll library if available, falls back to standard behavior
 */
export function ScrollToTop() {
  const location = useLocation()
  const { t } = useTranslation("routes")
  const prevPathRef = useRef<string | null>(null)

  useEffect(() => {
    // Extract slug from pathname (e.g., /fr/about → /about)
    const pathParts = location.pathname.split('/').filter(Boolean)
    const slug = pathParts[1] ? `/${pathParts[1]}` : ''

    // Normalize slug to route key by matching against translations
    // Example: slug "/a-propos" in French → normalizedPath "about"
    let normalizedPath: string = slug

    for (const key of ROUTE_KEYS) {
      if (t(key) === slug) {
        normalizedPath = key
        break
      }
    }

    const isFirstNavigation = prevPathRef.current === null
    const isRouteChange = prevPathRef.current !== normalizedPath
    const isLanguageChangeOnly = prevPathRef.current === normalizedPath

    // Handle route change: scroll to top
    if (!isFirstNavigation && isRouteChange) {
      const lenis = (window as any).lenis
      if (lenis) {
        lenis.scrollTo(0, { immediate: true })
      }
    }
    // Handle language change: emit event for other components to respond
    else if (!isFirstNavigation && isLanguageChangeOnly) {
      window.dispatchEvent(new CustomEvent('languagechange'))
    }

    prevPathRef.current = normalizedPath
  }, [location.pathname, t])

  return null
}