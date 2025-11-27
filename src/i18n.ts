import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import Backend from "i18next-http-backend"
import frHome from "./locales/fr/home.json"
import frHeader from "./locales/fr/header.json"
import frFooter from "./locales/fr/footer.json"
import frCookies from "./locales/fr/cookies.json"
import frRoutes from "./locales/fr/routes.json"
import frAriaLabels from "./locales/fr/ariaLabels.json"
import frMeta from "./locales/fr/meta.json"
import frContact from "./locales/fr/contact.json"
import enHome from "./locales/en/home.json"
import enHeader from "./locales/en/header.json"
import enFooter from "./locales/en/footer.json"
import enCookies from "./locales/en/cookies.json"
import enRoutes from "./locales/en/routes.json"
import enAriaLabels from "./locales/en/ariaLabels.json"
import enMeta from "./locales/en/meta.json"
import enContact from "./locales/en/contact.json"
import deHome from "./locales/de/home.json"
import deHeader from "./locales/de/header.json"
import deFooter from "./locales/de/footer.json"
import deCookies from "./locales/de/cookies.json"
import deRoutes from "./locales/de/routes.json"
import deAriaLabels from "./locales/de/ariaLabels.json"
import deMeta from "./locales/de/meta.json"
import deContact from "./locales/de/contact.json"


const supportedLngs = ["fr", "de", "en"]
function getInitialLang() {
  if (typeof window === "undefined") {
    return "en"
  }

  const savedLang = localStorage.getItem("lang")
  const browserLang = navigator.language.slice(0, 2)
  return savedLang ? savedLang : supportedLngs.includes(browserLang) ? browserLang : "en"
}

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    supportedLngs,
    lng: getInitialLang(),
    fallbackLng: "en",
    debug: false,
    preload: ["fr", "de", "en"],
    load: "languageOnly",
    ns: [],
    resources: {
      fr: {
        home: frHome,
        header: frHeader,
        footer: frFooter,
        cookies: frCookies,
        routes: frRoutes,
        ariaLabels: frAriaLabels,
        meta: frMeta,
        contact: frContact
      },
      en: {
        home: enHome,
        header: enHeader,
        footer: enFooter,
        cookies: enCookies,
        routes: enRoutes,
        ariaLabels: enAriaLabels,
        meta: enMeta,
        contact: enContact
      },
      de: {
        home: deHome,
        header: deHeader,
        footer: deFooter,
        cookies: deCookies,
        routes: deRoutes,
        ariaLabels: deAriaLabels,
        meta: deMeta,
        contact: deContact
      },
    },
    partialBundledLanguages: true,
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json",
    },
    react: {
      useSuspense: true,
    },
  })

if (typeof window !== "undefined") {
  i18n.on("languageChanged", (lng) => {
    localStorage.setItem("lang", lng)
    document.documentElement.lang = lng
  })
}

export default i18n
export { supportedLngs }