import { useEffect, useState } from "react"
import { useWindowWidth } from "./useWindowWidth"

export const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(false)
    const windowWidth = useWindowWidth()

    useEffect(() => {
        const canHover = window.matchMedia("(hover: hover)").matches

        setIsMobile(!canHover || windowWidth <= 768)
    }, [windowWidth])

    return isMobile
}