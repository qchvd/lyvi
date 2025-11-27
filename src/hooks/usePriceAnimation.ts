import { useEffect, useState } from "react"

// Custom hook that animates price changes smoothly over a duration.

export function usePriceAnimation(
    selectedSessions: number,
    priceMap: Record<number, number>
) {
    const [displayedPrice, setDisplayedPrice] = useState(priceMap[selectedSessions])

    useEffect(() => {
        const targetPrice = priceMap[selectedSessions]
        const startPrice = displayedPrice
        const difference = targetPrice - startPrice
        const duration = 500 // Total animation duration in ms
        const steps = 30 // Number of animation steps
        const stepValue = difference / steps
        const stepDuration = duration / steps

        let currentStep = 0

        const interval = setInterval(() => {
            currentStep++
            if (currentStep >= steps) {
                setDisplayedPrice(targetPrice)
                clearInterval(interval)
            } else {
                setDisplayedPrice(Math.round(startPrice + stepValue * currentStep))
            }
        }, stepDuration)

        return () => clearInterval(interval)
    }, [selectedSessions, priceMap, displayedPrice])

    return displayedPrice
}
