import "lenis/dist/lenis.css";
import "./globals.css";
import { BoutiqueProvider } from "@/components/BoutiqueProvider";
import ScrollToTop from "@/components/ScrollToTop";
import SitePreloader from "@/components/SitePreloader";
import SmoothScroll from "@/components/SmoothScroll";
import { absoluteUrl, siteUrl } from "@/lib/site-url";

const title = "Codex RP : Serveur RP FiveM français réaliste (GTA 5)";
const description =
  "Serveur RP FiveM francophone réaliste. Tout ce qui est possible dans la vraie vie est possible ici. Accès libre, rejoins Los Angeles.";
const socialProfiles = [
  "https://discord.gg/HwUqfteUHz",
  "https://www.tiktok.com/@codexrpofficiel",
  "https://www.youtube.com/@CodexRPOfficiel",
];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: `${siteUrl}/`,
      name: "Codex RP",
      alternateName: "Codex Roleplay",
      description,
      inLanguage: "fr-FR",
      publisher: { "@id": `${siteUrl}/#organization` },
    },
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Codex RP",
      url: `${siteUrl}/`,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/img/favicon_codex.webp"),
        width: 512,
        height: 512,
      },
      sameAs: socialProfiles,
    },
  ],
};

export const metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "Codex RP",
  title,
  description,
  keywords: [
    "Codex RP",
    "serveur FiveM français",
    "serveur GTA RP",
    "roleplay GTA V",
    "FiveM RP",
  ],
  authors: [{ name: "Codex RP", url: "/" }],
  creator: "Codex RP",
  publisher: "Codex RP",
  category: "gaming",
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/img/favicon_codex.webp",
    apple: "/img/favicon_codex.webp",
  },
  manifest: "/manifest.webmanifest",
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" dir="ltr" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{document.documentElement.dataset.cxFirstLoad=localStorage.getItem("codex-preloader-complete")?"false":"true"}catch(e){document.documentElement.dataset.cxFirstLoad="true"}})();`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
        />
        <link
          rel="preload"
          href="/fonts/primary.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/tertiary.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/secondary.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className="__variable_675c71 __variable_991125 __variable_c1dfd3"
        suppressHydrationWarning
      >
        <div id="modal-root" />
        <BoutiqueProvider>
          <SitePreloader />
          <SmoothScroll />
          {children}
          <ScrollToTop />
        </BoutiqueProvider>
      </body>
    </html>
  );
}
