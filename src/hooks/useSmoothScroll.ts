import { useEffect } from "react"
import Lenis from "@studio-freight/lenis"

export const useSmoothScroll = () => {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1,
      wheelMultiplier: 0.6,
    })

    // Expose lenis globally so it can be controlled throughout the app
    ;(window as any).lenis = lenis

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
      delete (window as any).lenis
    }
  }, [])
}