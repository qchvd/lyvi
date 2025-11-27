import { useTranslation } from "react-i18next"
import { Navigate, useParams } from "react-router-dom"
import { supportedLngs } from "../../i18n"
import {
  Home,
  LazyPageNotFound,
  LazyAbout,
  LazyTreatments,
  LazyContact,
  LazyFAQ
} from "./LazyRoutes"
import { useLayoutEffect, Suspense, type ComponentType, useMemo } from "react"
import { Helmet } from "react-helmet-async"
import { useTranslatedSlug } from "../../hooks/useTranslatedSlug"

type RouteKey = "home" | "about" | "treatments" | "contact" | "faq"

// Maps route keys to their corresponding page components
const routeMap: Record<RouteKey, ComponentType> = {
  home: Home,
  about: LazyAbout,
  treatments: LazyTreatments,
  contact: LazyContact,
  faq: LazyFAQ
}

/**
 * Router component that handles dynamic slugs (localized URLs)
 * Matches URL slugs to page components and manages i18n synchronization
 * Example: /fr/a-propos → About page, /en/about → About page
 */
export function SlugRouter() {
  const { lang, slug } = useParams()
  const { i18n, t } = useTranslation("routes")
  const { t: tHeader } = useTranslation("header")
  const { t: tPageNotFound } = useTranslation("pageNotFound")
  const { t: tMeta } = useTranslation("meta")
  const { getTranslatedSlug } = useTranslatedSlug()
  // Synchronize URL language parameter with i18n instance
  // Triggers language change if URL lang differs from current i18n language
  useLayoutEffect(() => {
    if (lang && supportedLngs.includes(lang) && i18n.language !== lang) {
      i18n.changeLanguage(lang)
    }
  }, [lang, i18n])

  // Early returns for invalid states
  if (!lang) return <Navigate to="/en" replace />
  if (!slug) return <LazyPageNotFound />

  // Redirect unsupported languages to 404
  if (!supportedLngs.includes(lang)) {
    return (
      <Suspense>
        <LazyPageNotFound />
      </Suspense>
    )
  }

  // Find which page key matches the current slug
  // Example: slug "a-propos" in French → finds "about" key
  const routeKeys = Object.keys(i18n.getResourceBundle(lang, "routes"))
  const pageKey = routeKeys.find((key) => t(key).replace(/^\//, "") === slug)

  // Get the corresponding page component from the route map
  const PageComponent = pageKey ? routeMap[pageKey as RouteKey] : null

  // Calculate page title (memoized to avoid recalculation)
  const pageTitle = useMemo(() => {
    if (!PageComponent) {
      return `${tPageNotFound("title1").slice(0, -1)} - Lyvi`
    }
    return pageKey ? `${tHeader(pageKey)} - Lyvi` : 'Lyvi'
  }, [PageComponent, pageKey, tHeader, tPageNotFound])

  // Set document title
  document.title = pageTitle

  // Show 404 if no matching component found
  if (!PageComponent) {
    return (
      <Suspense>
        <LazyPageNotFound />
      </Suspense>
    )
  }

  // Generate current path and translated slugs for hreflang
  const currentPath = `/${lang}/${slug}`
  const slugFr = getTranslatedSlug(slug, 'fr')
  const slugEn = getTranslatedSlug(slug, 'en')
  const slugDe = getTranslatedSlug(slug, 'de')

  return (
    <>
      <Helmet>
        <html lang={lang} />
        <meta name="description" content={tMeta('description')} />

        {/* Open Graph */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={tMeta('description')} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://lyvicare.com${currentPath}`} />
        <meta property="og:image" content="https://lyvicare.com/og-image.jpg" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />

        {/* Hreflang */}
        <link rel="alternate" hrefLang="fr" href={`https://lyvicare.com/fr${slugFr}`} />
        <link rel="alternate" hrefLang="en" href={`https://lyvicare.com/en${slugEn}`} />
        <link rel="alternate" hrefLang="de" href={`https://lyvicare.com/de${slugDe}`} />
        <link rel="alternate" hrefLang="x-default" href={`https://lyvicare.com/en${slugEn}`} />
      </Helmet>

      <Suspense>
        <PageComponent />
      </Suspense>
    </>
  )
}