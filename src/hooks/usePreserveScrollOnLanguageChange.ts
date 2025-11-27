import { useEffect, useRef } from "react"

interface LenisInstance {
    scroll: number
    scrollTo: (target: number, options?: { immediate?: boolean; force?: boolean }) => void
    on: (event: string, callback: () => void) => void
    off: (event: string, callback: () => void) => void
}

// Extend Window interface to include Lenis instance
declare global {
    interface Window {
        lenis?: LenisInstance
    }
}

// Configuration: Multiple delay intervals for scroll restoration attempts
// Using staggered timeouts ensures position is restored even if DOM isn't ready immediately
const SCROLL_RESTORATION_DELAYS = [50, 100, 200, 300, 500] as const

/*
 * Global storage outside the hook to survive re-renders between language changes.
 * When the language changes, the component unmounts/remounts but this value persists.
 */
const globalScrollPosition = { value: 0 }


// Custom hook that preserves scroll position during language changes

export function usePreserveScrollOnLanguageChange() {
    const isFirstMount = useRef(true)

    useEffect(() => {
        const lenis = window.lenis

        // Early return if Lenis is not available
        if (!lenis) {
            console.warn("Lenis smooth scroll library not found on window object")
            return
        }

        // On mount: if not first mount (i.e., after language change), restore scroll position
        if (!isFirstMount.current && globalScrollPosition.value > 0) {
            const targetScroll = globalScrollPosition.value

            // Schedule multiple restoration attempts with increasing delays
            // This compensates for potential async rendering and content loading
            const timeouts = SCROLL_RESTORATION_DELAYS.map(delay =>
                setTimeout(() => {
                    if (lenis) {
                        lenis.scrollTo(targetScroll, { immediate: true, force: true })
                    }
                }, delay)
            )

            // Cleanup function: clear all pending timeouts if component unmounts
            return () => timeouts.forEach(clearTimeout)
        }

        // Mark that initial mount is complete
        isFirstMount.current = false

        // Continuously save scroll position as user scrolls
        const saveScrollPosition = () => {
            if (lenis) {
                globalScrollPosition.value = lenis.scroll
            }
        }

        // Register scroll event listener
        lenis.on("scroll", saveScrollPosition)

        // Cleanup: save one last time and remove listener before unmounting
        return () => {
            if (lenis) {
                globalScrollPosition.value = lenis.scroll
                lenis.off("scroll", saveScrollPosition)
            }
        }
    }, [])
}