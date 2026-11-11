export default {
  routes: [
    "/fr",
    "/en",
    "/de",
    "/fr/a-propos",
    "/en/about",
    "/de/uber-mich",
    "/fr/drainage-lymphatique",
    "/en/lymphatic-drainage",
    "/de/lymphdrainage",
    "/fr/post-op",
    "/en/post-op",
    "/de/post-op",
    "/fr/post-partum",
    "/en/postpartum",
    "/de/rueckbildung",
    "/fr/contact",
    "/en/contact",
    "/de/kontakt",
    // 404 page of each language, served by Netlify with a 404 status for any unknown URL
    "/fr/404",
    "/en/404",
    "/de/404",
  ],
  outDir: "static-pages",     // Dossier de sortie
  serveDir: "dist",            // Votre build Vite
  buildCommand: "vite build",  // Commande de build
  flatOutput: false            // false = /about/index.html, true = about.html
};