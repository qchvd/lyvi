import { useTranslation } from "react-i18next"
import { useParams } from "react-router-dom"
import { supportedLngs } from "../../i18n"
import {
  Home,
  LazyPageNotFound,
  LazyAbout,
  LazyTreatments,
  LazyPostOp,
  LazyPostPartum,
  LazyContact
} from "./LazyRoutes"
import { useLayoutEffect, useState, Suspense, type ComponentType } from "react"
import { Helmet } from "react-helmet-async"
import { useTranslatedSlug } from "../../hooks/useTranslatedSlug"

type RouteKey = "home" | "about" | "treatments" | "postOp" | "postPartum" | "contact"

// Maps route keys to their corresponding page components
const routeMap: Record<RouteKey, ComponentType> = {
  home: Home,
  about: LazyAbout,
  treatments: LazyTreatments,
  postOp: LazyPostOp,
  postPartum: LazyPostPartum,
  contact: LazyContact
}

/**
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
  const [currentI18nLang, setCurrentI18nLang] = useState(i18n.language)

  // Listen to i18n language changes so the page re-renders once the URL language is active
  // (same as LangRouter: useTranslation alone doesn't re-render this component reliably)
  useLayoutEffect(() => {
    const handleLanguageChanged = (newLang: string) => setCurrentI18nLang(newLang)
    i18n.on("languageChanged", handleLanguageChanged)
    return () => {
      i18n.off("languageChanged", handleLanguageChanged)
    }
  }, [i18n])

  // Synchronize URL language parameter with i18n instance
  // Triggers language change if URL lang differs from current i18n language
  useLayoutEffect(() => {
    if (lang && supportedLngs.includes(lang) && i18n.language !== lang) {
      i18n.changeLanguage(lang)
    }
  }, [lang, i18n])

  // Early returns for invalid states
  if (!lang || !slug) return <LazyPageNotFound />

  // Unsupported language: 404
  if (!supportedLngs.includes(lang)) {
    return (
      <Suspense>
        <LazyPageNotFound />
      </Suspense>
    )
  }

  // Find which page key matches the current slug, in the URL language
  // (not the current i18n language, which can still be the previous one, e.g. from localStorage)
  // Example: slug "a-propos" in French → finds "about" key
  const routeKeys = Object.keys(i18n.getResourceBundle(lang, "routes"))
  const pageKey = routeKeys.find((key) => t(key, { lng: lang }).replace(/^\//, "") === slug)

  // Get the corresponding page component from the route map
  const PageComponent = pageKey ? routeMap[pageKey as RouteKey] : null

  // Title and description are always computed in the URL language (lng option),
  // so they can't come out in the previous language while i18n is switching
  const lng = { lng: lang }

  // Page title: page-specific when defined (e.g. "postPartumTitle"), otherwise "<menu label> - Lyvi"
  const pageTitle = !PageComponent
    ? `${tPageNotFound("title1", lng).slice(0, -1)} - Lyvi`
    : pageKey ? tMeta(`${pageKey}Title`, { ...lng, defaultValue: `${tHeader(pageKey, lng)} - Lyvi` }) : 'Lyvi'

  // Page-specific description when defined (e.g. "postPartumDescription"), otherwise the shared one
  const pageDescription = pageKey
    ? tMeta(`${pageKey}Description`, { ...lng, defaultValue: tMeta('description', lng) })
    : tMeta('description', lng)

  // Wait for i18n to switch to the URL language before rendering (same as LangRouter):
  // otherwise titles, texts and the prerendered HTML come out in the previous language
  if (currentI18nLang !== lang) return null

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

  // A page may exist in only some languages:
  // hreflang links are only declared for the languages where the page exists
  const existsIn = (targetLang: string) => i18n.getResourceBundle(targetLang, "routes")?.[pageKey as string] !== undefined
  const isInAllLanguages = supportedLngs.every(existsIn)

  return (
    <>
      <Helmet>
        <html lang={lang} />
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={`https://lyvicare.com${currentPath}`} />

        {/* Open Graph */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://lyvicare.com${currentPath}`} />
        <meta property="og:image" content="https://lyvicare.com/og-image.jpg" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />

        {/* Hreflang (omitted for single-language pages) */}
        {isInAllLanguages && <link rel="alternate" hrefLang="fr" href={`https://lyvicare.com/fr${slugFr}`} />}
        {isInAllLanguages && <link rel="alternate" hrefLang="en" href={`https://lyvicare.com/en${slugEn}`} />}
        {isInAllLanguages && <link rel="alternate" hrefLang="de" href={`https://lyvicare.com/de${slugDe}`} />}
        {isInAllLanguages && <link rel="alternate" hrefLang="x-default" href={`https://lyvicare.com/en${slugEn}`} />}
      </Helmet>

      <Suspense>
        <PageComponent />
      </Suspense>
    </>
  )
}