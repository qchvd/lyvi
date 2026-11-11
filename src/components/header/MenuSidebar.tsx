import { useEffect, useRef } from "react"
import { CTA } from "./CTA"
import { Navbar } from "./Navbar"

export function MenuSidebar({
    isSidebarOpen,
    setIsSidebarOpen,
    windowWidth
}: {
    isSidebarOpen: boolean
    setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>
    windowWidth: number
}) {
    const sideBarOpenRef = useRef(false)
    const sidebarRef = useRef<HTMLDivElement>(null)

    // Preserve sidebar state when resizing between mobile and desktop
    useEffect(() => {
        if (windowWidth >= 1024) {
            if (isSidebarOpen) {
                sideBarOpenRef.current = true
                setIsSidebarOpen(false)
            }
        } else {
            if (sideBarOpenRef.current) {
                setIsSidebarOpen(true)
                sideBarOpenRef.current = false
            }
        }
    }, [isSidebarOpen, setIsSidebarOpen])

    // On opening: focus goes to the first link of the menu. While open: Escape closes it and focus returns to the burger button
    useEffect(() => {
        if (!isSidebarOpen) return

        sidebarRef.current?.querySelector<HTMLElement>("a")?.focus()

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsSidebarOpen(false)
                document.getElementById("menu-burger")?.focus()
            }
        }

        document.addEventListener("keydown", handleKeyDown)
        return () => document.removeEventListener("keydown", handleKeyDown)
    }, [isSidebarOpen, setIsSidebarOpen])

    return (
            <div
                id="sidebar"
                ref={sidebarRef}
                inert={!isSidebarOpen ? true : undefined}
                className={`fixed top-[72px] inset-0 bg-[#627156] p-4 overflow-y-auto transform transition-transform duration-300 ease-in-out lg:hidden
                    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
            >
                <Navbar windowWidth={windowWidth} />
                <CTA className="mt-8" source="Sidebar"/>
            </div>
    )
}