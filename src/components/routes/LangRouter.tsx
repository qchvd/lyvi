import { useParams, Navigate } from "react-router-dom"
import { supportedLngs } from "../../i18n"
import { Home, LazyPageNotFound } from "./LazyRoutes"
import { useTranslation } from "react-i18next"
import { useLayoutEffect, useState, Suspense } from "react"
import { Helmet } from "react-helmet-async"

const LANG_CODE_LENGTH = 2

/**
 * Main language router component
 * Uses key prop to force remount when language changes in URL
 */
export function LangRouter() {
  const { lang } = useParams<{ lang: string }>()
  return <LangRouterContent key={lang} />
}

/**
 * Content component that handles language validation, i18n synchronization, and SEO
 * Separated from LangRouter to enable forced remounting via key prop
 */
function LangRouterContent() {
  const { lang } = useParams()
  const { i18n } = useTranslation("routes")
  const { t: tHeader } = useTranslation("header")
  const { t: tMeta } = useTranslation("meta")
  const [currentI18nLang, setCurrentI18nLang] = useState(i18n.language)

  // Listen to i18n language changes and sync with local state
  // This ensures UI updates when language changes programmatically
  useLayoutEffect(() => {
    const handleLanguageChanged = (newLang: string) => {
      setCurrentI18nLang(newLang)
    }

    i18n.on('languageChanged', handleLanguageChanged)

    return () => {
      i18n.off('languageChanged', handleLanguageChanged)
    }
  }, [i18n])

  // Synchronize URL language parameter with i18n instance
  // Triggers language change if URL lang differs from current i18n language
  useLayoutEffect(() => {
    if (lang && supportedLngs.includes(lang)) {
      if (i18n.language !== lang) {
        i18n.changeLanguage(lang)
      }
      setCurrentI18nLang(lang)
    }
  }, [lang, i18n])

  // Remove trailing slashes from URLs (except root)
  if (location.pathname.endsWith('/') && location.pathname !== '/') {
    return <Navigate to={location.pathname.slice(0, -1)} replace />
  }

  if (!lang) return null

  // Validate language code length (must be 2 characters: fr, en, de)
  if (lang.length !== LANG_CODE_LENGTH) {
    return (
      <Suspense>
        <LazyPageNotFound />
      </Suspense>
    )
  }

  // Redirect unsupported languages to default English
  if (!supportedLngs.includes(lang)) {
    return <Navigate to="/en" replace />
  }

  // Wait for i18n to sync with URL language before rendering
  // Prevents flash of content in wrong language
  if (currentI18nLang !== lang) return null

  const pageTitle = `${tHeader("home")} - Lyvi`
  document.title = pageTitle

  return (
    <>
      <Helmet>
        <html lang={lang} />
        <meta name="description" content={tMeta('description')} />

        {/* Open Graph */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={tMeta('description')} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://lyvicare.com/${lang}`} />
        <meta property="og:image" content="https://lyvicare.com/og-image.jpg" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />

        {/* Hreflang */}
        <link rel="alternate" hrefLang="fr" href="https://lyvicare.com/fr" />
        <link rel="alternate" hrefLang="en" href="https://lyvicare.com/en" />
        <link rel="alternate" hrefLang="de" href="https://lyvicare.com/de" />
        <link rel="alternate" hrefLang="x-default" href="https://lyvicare.com/en" />
      </Helmet>

      <Home />
    </>
  )
}