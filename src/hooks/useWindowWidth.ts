import { useEffect, useState } from "react"

// Hook to track window width and update on resize
// Returns the current viewport width in pixels (excluding scrollbar)
export function useWindowWidth() {
    // Using clientWidth instead of innerWidth to exclude scrollbar width
    const [windowWidth, setWindowWidth] = useState(document.documentElement.clientWidth)

    useEffect(() => {
        // Update width on resize events
        const handleResize = () => setWindowWidth(document.documentElement.clientWidth)

        // Register resize listener
        window.addEventListener("resize", handleResize)

        // Cleanup: remove listener on unmount
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    return windowWidth
}