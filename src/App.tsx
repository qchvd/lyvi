import { I18nextProvider } from "react-i18next"
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom"
import i18n from "./i18n"
import { RootRouter } from "./components/routes/RootRouter"
import { LangRouter } from "./components/routes/LangRouter"
import { SlugRouter } from "./components/routes/SlugRouter"
import { useSmoothScroll } from "./hooks/useSmoothScroll"
import { SidebarProvider } from './contexts/SidebarContext'
import { useEffect } from "react"
import { lazyInitGA, trackPageView } from "./utils/analytics"
import { CookieBanner } from "./components/CookieBanner"
import { ScrollToTop } from "./components/ScrollToTop"

function AppContent() {
  const location = useLocation()
  useSmoothScroll()

  useEffect(() => {
    lazyInitGA()
  }, [])

  // Disable right-click context menu
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent): void => {
      e.preventDefault()
    }

    document.addEventListener('contextmenu', handleContextMenu)

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [])

  // Track page view changes for analytics
  useEffect(() => {
    const pathParts = location.pathname.split('/').filter(Boolean)
    const lang = pathParts[0]
    const pageTitle = document.title

    trackPageView(location.pathname, lang, pageTitle)
  }, [location])

  return (
    <I18nextProvider i18n={i18n}>
      <SidebarProvider>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<RootRouter />}></Route>
          <Route path="/:lang" element={<LangRouter />}></Route>
          <Route path="/:lang/:slug" element={<SlugRouter />}></Route>
        </Routes>
        <CookieBanner />
      </SidebarProvider>
    </I18nextProvider>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App