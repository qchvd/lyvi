import { useParams } from "react-router-dom"
import { supportedLngs } from "../../i18n"
import { Home, LazyPageNotFound } from "./LazyRoutes"
import { useTranslation } from "react-i18next"
import { useLayoutEffect, useState, Suspense } from "react"
import { Helmet } from "react-helmet-async"
import { CONTACT_INFO } from "../../constants/contactInfo"
import { DOCTOLIB_URL, INSTAGRAM_URL } from "../../constants/urls"

// Local business structured data (schema.org), declared on the home page only: one entry per practice.
// Must stay consistent with the Google Business Profile listings (name, address, phone).
const practiceSchema = {
  "@context": "https://schema.org",
  "@graph": [
    { street: CONTACT_INFO.address.street, city: CONTACT_INFO.address.city, district: "Lyon 1", id: "lyon1" },
    { street: CONTACT_INFO.addressLyon5.street, city: CONTACT_INFO.addressLyon5.city, district: "Saint-Cyr-au-Mont-d'Or", id: "saintcyr" },
  ].map(({ street, city, district, id }) => {
    const [postalCode, locality] = city.split(" ")
    return {
      "@type": "Physiotherapist",
      "@id": `https://lyvicare.com/#${id}`,
      name: `Lyvi – Anaïs Eynard, kinésithérapeute ${district}`,
      url: "https://lyvicare.com/fr",
      image: "https://lyvicare.com/og-image.jpg",
      telephone: CONTACT_INFO.phone,
      email: CONTACT_INFO.email,
      address: {
        "@type": "PostalAddress",
        streetAddress: street,
        postalCode,
        addressLocality: locality,
        addressCountry: "FR",
      },
      sameAs: [DOCTOLIB_URL, INSTAGRAM_URL],
    }
  }),
}


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

  if (!lang) return null

  // Unsupported language (e.g. /it): 404, no redirect
  if (!supportedLngs.includes(lang)) {
    return (
      <Suspense>
        <LazyPageNotFound />
      </Suspense>
    )
  }

  // Wait for i18n to sync with URL language before rendering
  // Prevents flash of content in wrong language
  if (currentI18nLang !== lang) return null

  // Home-specific title/description when defined for the language, otherwise the shared defaults
  const pageTitle = tMeta("homeTitle", { defaultValue: `${tHeader("home")} - Lyvi` })
  const pageDescription = tMeta("homeDescription", { defaultValue: tMeta("description") })
  document.title = pageTitle

  return (
    <>
      <Helmet>
        <html lang={lang} />
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={`https://lyvicare.com/${lang}`} />

        {/* Open Graph */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
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

        {/* Practices (local business) */}
        <script type="application/ld+json">{JSON.stringify(practiceSchema)}</script>
      </Helmet>

      <Home />
    </>
  )
}