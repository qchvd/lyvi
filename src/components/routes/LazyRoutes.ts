import { lazy } from "react"

// Home is imported normally (not lazy) for immediate loading
export { Home } from "../pages/Home"

// Other pages are lazy-loaded for better performance
export const LazyAbout = lazy(() => import("../pages/About").then(module => ({ default: module.About })))
export const LazyTreatments = lazy(() => import("../pages/Treatments").then(module => ({ default: module.Treatments })))
export const LazyContact = lazy(() => import("../pages/Contact").then(module => ({ default: module.Contact })))
export const LazyFAQ = lazy(() => import("../pages/FAQ").then(module => ({ default: module.FAQ })))
export const LazyPageNotFound = lazy(() => import("../pages/PageNotFound").then(module => ({ default: module.PageNotFound })))
export const LazyConfirmationMessageSent = lazy(() => import("../pages/ConfirmationMessageSent").then(module => ({ default: module.ConfirmationMessageSent })))