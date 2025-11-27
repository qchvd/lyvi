import { createContext, useContext, useState } from "react"
import type { Dispatch, ReactNode, SetStateAction } from "react"

interface SidebarContextType {
    isSidebarOpen: boolean
    setIsSidebarOpen: Dispatch<SetStateAction<boolean>>
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)


// Custom hook to access sidebar state

export const useSidebar = () => {
    const context = useContext(SidebarContext)
    if (!context) {
        throw new Error("useSidebar must be used within SidebarProvider")
    }
    return context
}


// Provider component for sidebar state management
// Wraps the application to provide sidebar open/close state globally

export function SidebarProvider({ children }: { children: ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    return (
        <SidebarContext.Provider value={{ isSidebarOpen, setIsSidebarOpen }}>
            {children}
        </SidebarContext.Provider>
    )
}