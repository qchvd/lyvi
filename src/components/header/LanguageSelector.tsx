import { useTranslation } from "react-i18next"
import { useParams, Link } from "react-router-dom"
import { useTranslatedSlug } from "../../hooks/useTranslatedSlug"
import { supportedLngs } from "../../i18n"

const langLabels: Record<string, string> = {
    fr: "Français",
    de: "Deutsch",
    en: "English"
}

export function LanguageSelector() {
    const { t } = useTranslation("ariaLabels")
    const { lang: currentLang, slug } = useParams()
    const { getTranslatedSlug } = useTranslatedSlug()
    const activeLang = currentLang && supportedLngs.includes(currentLang) ? currentLang : null
    
    return (
        <ul className="flex gap-2" aria-label={t("languageSelector")}>
            {supportedLngs.map((lang) => {
                const translatedSlug = slug ? getTranslatedSlug(slug, lang) : ""
                const fullPath = `/${lang}${translatedSlug}`

                return (
                    <li key={lang}>
                        <Link
                            to={fullPath}
                            className={`cursor-pointer ${activeLang === lang ? "font-black" : ""}`.trim()}
                            lang={lang}
                            aria-label={langLabels[lang]}
                        >
                            {lang.toUpperCase()}
                        </Link>
                    </li>
                )
            })}
        </ul>
    )
}