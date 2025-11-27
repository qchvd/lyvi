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

    return (
            <div
                id="sidebar"
                inert={!isSidebarOpen ? true : undefined}
                role="menu"
                className={`fixed top-[72px] inset-0 bg-[#627156] p-4 overflow-y-auto transform transition-transform duration-300 ease-in-out lg:hidden
                    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
            >
                <Navbar windowWidth={windowWidth} />
                <CTA className="mt-8" source="Sidebar"/>
            </div>
    )
}