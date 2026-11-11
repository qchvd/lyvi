import { useEffect } from "react"

// Adds the "keyboard-navigation" class to <html> when the visitor moves with the Tab key,
// and removes it as soon as they click or tap. Used by index.css to show the form field outline
// to keyboard users only (browsers show :focus-visible on text fields even after a click).
export function useKeyboardNavigationClass() {
  useEffect(() => {
    const root = document.documentElement

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab") root.classList.add("keyboard-navigation")
    }
    const handlePointerDown = () => root.classList.remove("keyboard-navigation")

    // Capture phase: runs before any focus change caused by the same key press or click
    document.addEventListener("keydown", handleKeyDown, true)
    document.addEventListener("pointerdown", handlePointerDown, true)

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true)
      document.removeEventListener("pointerdown", handlePointerDown, true)
      root.classList.remove("keyboard-navigation")
    }
  }, [])
}
