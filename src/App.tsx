import { I18nextProvider } from "react-i18next"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import i18n from "./i18n"
import { RootRouter } from "./components/routes/RootRouter"
import { LangRouter } from "./components/routes/LangRouter"
import { SlugRouter } from "./components/routes/SlugRouter"
import { LazyPageNotFound } from "./components/routes/LazyRoutes"
import { useSmoothScroll } from "./hooks/useSmoothScroll"
import { useKeyboardNavigationClass } from "./hooks/useKeyboardNavigationClass"
import { SidebarProvider } from './contexts/SidebarContext'
import { Suspense } from "react"
import { CookieBanner } from "./components/CookieBanner"
import { ScrollToTop } from "./components/ScrollToTop"
import { MotionConfig } from "framer-motion"

function AppContent() {
  useSmoothScroll()
  useKeyboardNavigationClass()

  return (
    <I18nextProvider i18n={i18n}>
      {/* "Reduce motion" setting of the device: appear animations keep their fade but no longer slide */}
      <MotionConfig reducedMotion="user">
      <SidebarProvider>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<RootRouter />}></Route>
          <Route path="/:lang" element={<LangRouter />}></Route>
          <Route path="/:lang/:slug" element={<SlugRouter />}></Route>
          {/* Any deeper or unknown path (e.g. /fr/a/b): 404 */}
          <Route path="*" element={<Suspense><LazyPageNotFound /></Suspense>}></Route>
        </Routes>
        <CookieBanner />
      </SidebarProvider>
      </MotionConfig>
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