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

export function Header() {
    const { isSidebarOpen, setIsSidebarOpen } = useSidebar()
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)
    const windowWidth = useWindowWidth()
    const { t } = useTranslation("ariaLabels")

    return (
        <header className="fixed z-60 top-0 left-0 w-full px-4 h-18 flex justify-between bg-[#627156] items-center border-b border-[#FAF2E8]">
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