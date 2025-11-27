import { useTranslation } from "react-i18next"
import { Navigate } from "react-router-dom"

export function RootRouter() {
    const {i18n} = useTranslation("routes")
    const lang = i18n.language
    return <Navigate to={`/${lang}`} replace/>    
}