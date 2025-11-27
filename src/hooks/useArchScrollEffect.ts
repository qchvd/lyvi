import { useState, useEffect, useRef } from "react"

// Animation phases configuration
const ANIMATION_CONFIG = {
  // Arch phase: border-radius goes from 50% to 10% (scrollProgress 0 → 0.5)
  ARCH_PHASE_END: 0.5,
  ARCH_START_RADIUS: 50, // in percentage
  ARCH_RADIUS_CHANGE: 40, // from 50% down to 10%

  // Flatten phase: border-radius goes from 50px to 0px (scrollProgress 0.5 → 1)
  FLATTEN_START_RADIUS: 50, // in pixels

  // Scroll trigger points
  QUARTER_SCREEN: 0.25,
  FIFTH_SCREEN: 0.2,
} as const


// Custom hook that creates an arch-to-flat scroll effect on an image

export const useArchScrollEffect = () => {
  // Progress value from 0 (not started) to 1 (fully scrolled)
  const [scrollProgress, setScrollProgress] = useState(0)
  const imageRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (!imageRef.current) return

      const imageElement = imageRef.current
      const imageRect = imageElement.getBoundingClientRect()
      const windowHeight = window.innerHeight

      // Calculate how far the image top is from the upper quarter of viewport
      const imageTopToQuarter = imageRect.top - (windowHeight * ANIMATION_CONFIG.QUARTER_SCREEN)

      // Distance over which the effect animates
      const animationDistance = windowHeight * ANIMATION_CONFIG.FIFTH_SCREEN

      // Calculate scroll progress (0 = animation starts, 1 = animation complete)
      let progress = 0
      if (imageTopToQuarter <= 0) {
        // Image has reached the trigger point, calculate how far through the animation we are
        progress = Math.min(1, Math.abs(imageTopToQuarter) / animationDistance)
      }

      setScrollProgress(progress)
    }

    // Setup scroll listener and calculate initial state
    window.addEventListener("scroll", handleScroll)
    handleScroll()

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  /**
   * Calculates the border-radius CSS value based on current scroll progress
   *
   * Phase 1 (0-50%): Arch shape - radius goes from 50% to 10% (percentage-based)
   * Phase 2 (50-100%): Flatten - radius goes from 50px to 0px (pixel-based)
   *
   * @returns CSS border-radius value string (e.g., "40% 40% 0 0" or "25px 25px 0 0")
   */
  const getBorderRadius = () => {
    if (scrollProgress < ANIMATION_CONFIG.ARCH_PHASE_END) {
      // Phase 1: Arch phase - use percentage for consistent curvature
      // Normalize progress to 0-1 range within this phase
      const phaseProgress = scrollProgress / ANIMATION_CONFIG.ARCH_PHASE_END
      const currentRadius = ANIMATION_CONFIG.ARCH_START_RADIUS - (phaseProgress * ANIMATION_CONFIG.ARCH_RADIUS_CHANGE)
      return `${currentRadius}% ${currentRadius}% 0 0`
    } else {
      // Phase 2: Flatten phase - use pixels for final smoothing
      // Normalize progress to 0-1 range within this phase (0.5 to 1.0 → 0 to 1)
      const phaseProgress = (scrollProgress - ANIMATION_CONFIG.ARCH_PHASE_END) / (1 - ANIMATION_CONFIG.ARCH_PHASE_END)
      const currentRadiusPixels = ANIMATION_CONFIG.FLATTEN_START_RADIUS * (1 - phaseProgress)
      return `${Math.max(0, currentRadiusPixels)}px ${Math.max(0, currentRadiusPixels)}px 0 0`
    }
  }

  return {
    imageRef,
    getBorderRadius,
  }
}
