import { useTranslation } from "react-i18next"
import { NavLink } from "react-router-dom"
import { useSidebar } from "../../contexts/SidebarContext"

interface NavbarProps {
    windowWidth?: number
}

export function Navbar({ windowWidth }: NavbarProps) {
    const { i18n, t } = useTranslation(["header", "routes"])
    const { setIsSidebarOpen } = useSidebar()
    // Care pages in the same order as the home title (post-op, lymphatic drainage = "treatments", post-partum), then about and contact
    const tabs = ["home", "postOp", "treatments", "postPartum", "about", "contact"]

    // Resets contact form and closes sidebar on navigation
    const handleNavClick = (key: string) => {
        if (key === "contact") {
            window.dispatchEvent(new CustomEvent("resetContact"))
        }
        setIsSidebarOpen(false)
    }

    const renderTabs = (className: string) => {
        return (
            <ul className={className}>
                {tabs.map((key) => {
                    const label = t(`header:${key}`)
                    const path = t(`routes:${key}`)
                    const fullPath = `/${i18n.language}${path}`

                    return (
                        <li key={key}>
                            <NavLink
                                to={fullPath}
                                end={key === "home"} // Prevents home from staying active on other routes
                                onClick={() => handleNavClick(key)}
                                className={({ isActive }) => `${isActive ? "active" : ""}`.trim()}
                            >
                                {label}
                            </NavLink>
                        </li>
                    )
                })}
            </ul>
        )
    }

    return (
        <nav>
            {windowWidth && windowWidth < 1024 &&
                renderTabs("flex flex-col max-w-fit gap-4 pl-5")
            }
            {windowWidth && windowWidth >= 1024 &&
                // Long labels: tighter spacing on small desktops, no line breaks
                renderTabs("gap-3 xl:gap-5 flex whitespace-nowrap")
            }
        </nav>
    )
}