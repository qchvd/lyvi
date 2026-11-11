import { LanguageSelector } from "./LanguageSelector"
import { MenuBurger } from "./MenuBurger"
import { MenuSidebar } from "./MenuSidebar"
import { Navbar } from "./Navbar"
import { CTA } from "./CTA"
import { useWindowWidth } from "../../hooks/useWindowWidth"
import { useSidebar } from "../../contexts/SidebarContext"
import { useTranslation } from "react-i18next"
import Logo from "../../assets/logos/lyviLogo.svg?react"
import { Link } from "react-router-dom"
import type { MouseEvent } from "react"

// Moves focus to the page content without changing the URL (a "#main-content" hash would be taken for a navigation)
function skipToContent(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault()
    const main = document.getElementById("main-content")
    if (!main) return
    main.setAttribute("tabindex", "-1")
    main.focus()
}

export function Header() {
    const { isSidebarOpen, setIsSidebarOpen } = useSidebar()
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)
    const windowWidth = useWindowWidth()
    const { t } = useTranslation("ariaLabels")

    return (
        <header className="fixed z-60 top-0 left-0 w-full px-4 h-18 flex justify-between bg-[#627156] items-center border-b border-[#FAF2E8]">
            {/* First stop for keyboard users: jumps over the menu, only visible on keyboard focus */}
            <a href="#main-content" className="skip-link" onClick={skipToContent}>
                {t("skipToContent")}
            </a>
            <Link to="/" aria-label={t("home")}>
                <Logo className="h-13 transition-transform duration-300 hover:scale-105" />
            </Link>
            <div className="flex items-center gap-8">
                <LanguageSelector />
                <div className="flex items-center">
                    <MenuBurger isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
                    <MenuSidebar
                        isSidebarOpen={isSidebarOpen}
                        setIsSidebarOpen={setIsSidebarOpen}
                        windowWidth={windowWidth}
                    />
                    {windowWidth >= 1024 && <Navbar windowWidth={windowWidth} />}
                </div>
                <CTA className="hidden lg:flex" source="Header" />
            </div>
        </header>
    )
}