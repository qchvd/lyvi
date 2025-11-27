import { Helmet } from "react-helmet-async"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

export function PageNotFound() {
  const { t } = useTranslation("pageNotFound")

  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex" />
      </Helmet>
      <main className="bg-not-found h-screen">
        <div className="not-found-main-div w-full h-full">
          <div className="not-found-sub-div flex flex-col">
            <h1 className="main-title text-black font-extrabold">{t("title1")}</h1>
            <h2 className="sub-title text-black font-extrabold">{t("title2")}</h2>
            <Link to="/" className="not-found-button btn-golden">{t("button")}</Link>
          </div>
        </div>
      </main>
    </>
  )
}