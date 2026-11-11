import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { useParams, Link } from "react-router-dom"
import { ChevronDown } from "lucide-react"
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
    const activeLang = currentLang && supportedLngs.includes(currentLang) ? currentLang : supportedLngs[0]
    const otherLangs = supportedLngs.filter((lang) => lang !== activeLang)

    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const buttonRef = useRef<HTMLButtonElement>(null)

    // Close the dropdown on outside click or Escape
    useEffect(() => {
        if (!isOpen) return

        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsOpen(false)
                // Focus returns to the button that opened the list
                buttonRef.current?.focus()
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        document.addEventListener("keydown", handleKeyDown)

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
            document.removeEventListener("keydown", handleKeyDown)
        }
    }, [isOpen])

    return (
        <div className="relative" ref={containerRef}>
            {/* Simple show/hide list of links (no "menu" role, which would promise arrow-key navigation).
                The visible code ("FR") starts the accessible name, so voice control ("click FR") finds the button */}
            <button
                ref={buttonRef}
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="flex items-center gap-1 font-black cursor-pointer"
                aria-expanded={isOpen}
                aria-controls="language-list"
            >
                {activeLang.toUpperCase()}
                <span className="sr-only">, {t("languageSelector")}</span>
                <ChevronDown
                    className={`size-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`.trim()}
                    aria-hidden="true"
                />
            </button>

            {isOpen && (
                <ul
                    id="language-list"
                    className="absolute right-0 top-full mt-2 flex flex-col items-center gap-2 bg-[#627156] border border-[#FAF2E8] rounded-md p-2 min-w-12 z-10"
                    aria-label={t("languageSelector")}
                >
                    {otherLangs.map((lang) => {
                        const translatedSlug = slug ? getTranslatedSlug(slug, lang) : ""
                        const fullPath = `/${lang}${translatedSlug}`

                        return (
                            <li key={lang} className="w-full text-center">
                                <Link
                                    to={fullPath}
                                    className="cursor-pointer block"
                                    lang={lang}
                                    hrefLang={lang}
                                    onClick={() => setIsOpen(false)}
                                >
                                    {lang.toUpperCase()}
                                    <span className="sr-only"> – {langLabels[lang]}</span>
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            )}
        </div>
    )
}
