import { useTranslation } from "react-i18next"

// Hook to translate route slugs between languages
export function useTranslatedSlug() {
    const { i18n } = useTranslation("routes")

    // Helper function to normalize slugs by removing leading slash
    const normalizeSlug = (slug: string): string => {
        return slug.replace(/^\//, "")
    }

    // Finds the route key (e.g., "about", "home") that corresponds to a given slug in the current language
    const getRouteKeyFromSlug = (slug: string): string | undefined => {
        const currentLang = i18n.language
        const routes = i18n.getResourceBundle(currentLang, "routes")

        // Handle case where routes bundle doesn't exist
        if (!routes) return undefined

        const normalizedSlug = normalizeSlug(slug)

        // Find the key whose value matches the normalized slug
        return Object.keys(routes).find(
            (key) => normalizeSlug(routes[key]) === normalizedSlug
        )
    }

    // Translates a slug from the current language to a target language
    // Process:
    // 1. Find the route key for the current slug (e.g., "a-propos" → "about")
    // 2. Look up that key in the target language's routes
    // 3. Return the translated slug (e.g., "about" key → "/about" in English)
    const getTranslatedSlug = (slug: string, targetLang: string): string => {
        // Step 1: Find the route key for the current slug
        const key = getRouteKeyFromSlug(slug)
        if (!key) {
            console.warn(`No route key found for slug: ${slug}`)
            return `/${normalizeSlug(slug)}`
        }

        // Step 2: Get the target language's routes
        const targetRoutes = i18n.getResourceBundle(targetLang, "routes")
        if (!targetRoutes) {
            console.warn(`No routes found for target language: ${targetLang}`)
            return `/${normalizeSlug(slug)}`
        }

        // Step 3: Return the translated slug (already has leading slash from routes)
        return targetRoutes[key] || `/${normalizeSlug(slug)}`
    }

    return { getTranslatedSlug }
}
