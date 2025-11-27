import { useTranslation } from "react-i18next"

export function MenuBurger({ isSidebarOpen, toggleSidebar }: { isSidebarOpen: boolean; toggleSidebar: () => void }) {
    const { t } = useTranslation("ariaLabels")

    return (
        <button
            aria-expanded={isSidebarOpen}
            aria-controls="sidebar"
            aria-label={isSidebarOpen ? t("closeMenu") : t("openMenu")}
            onClick={toggleSidebar}
            className="cursor-pointer lg:hidden"
        >
            <span className={`block w-5 h-0.5 bg-[#FAF2E8] mb-[5px] transition-transform duration-300 origin-left 
                ${isSidebarOpen ? "rotate-[45deg]" : ""}`}>
            </span>
            <span className={`block w-5 h-0.5 bg-[#FAF2E8] mb-[5px] transition-transform duration-300 ease-in-out transform origin-left 
                ${isSidebarOpen ? "scale-x-0" : "scale-x-100"}`}>
            </span>
            <span className={`block w-5 h-0.5 bg-[#FAF2E8] transition-transform duration-300 origin-left 
                ${isSidebarOpen ? "rotate-[-45deg]" : ""}`}>
            </span>
        </button>
    )
}