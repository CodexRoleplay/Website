import "lenis/dist/lenis.css";
import "./globals.css";
import ScrollToTop from "@/components/ScrollToTop";
import SitePreloader from "@/components/SitePreloader";
import SmoothScroll from "@/components/SmoothScroll";
import { absoluteUrl, siteUrl } from "@/lib/site-url";

const title = "Codex RP : Serveur RP FiveM français réaliste (GTA 5)";
const description =
  "Serveur roleplay GTA V communautaire Codex RP : scripts custom, immersion et communauté.";
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
  alternates: {
    canonical: "/",
  },
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
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "/",
    siteName: "Codex RP",
    title,
    description,
    images: [
      {
        url: "/img/home_hero_bg.webp",
        width: 1536,
        height: 1024,
        alt: "Codex RP, serveur roleplay FiveM français",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/img/home_hero_bg.webp"],
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
        <SitePreloader />
        <SmoothScroll />
        {children}
        <ScrollToTop />
      </body>
    </html>
  );
}
