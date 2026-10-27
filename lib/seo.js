import { absoluteUrl, siteUrl } from "@/lib/site-url";

export const shareImage = {
  url: absoluteUrl("/img/og-codex.jpg"),
  width: 1200,
  height: 760,
  alt: "Codex RP, serveur roleplay FiveM à Los Angeles",
  type: "image/jpeg",
};

export function pageMetadata({ path = "/", title, description }) {
  const url = path === "/" ? `${siteUrl}/` : absoluteUrl(path);

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      locale: "fr_FR",
      url,
      siteName: "Codex RP",
      title,
      description,
      images: [shareImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [shareImage.url],
    },
  };
}

export function faqPageJsonLd(categories) {
  const mainEntity = (categories ?? []).flatMap((category) =>
    (category.items ?? [])
      .map((item) => ({
        question: String(item?.question ?? "").trim(),
        answer: String(item?.answer ?? "")
          .replace(/<[^>]*>/g, " ")
          .replace(/\s+/g, " ")
          .trim(),
      }))
      .filter((item) => item.question && item.answer)
      .map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
  );

  if (!mainEntity.length) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${absoluteUrl("/faq")}#faq`,
    url: absoluteUrl("/faq"),
    inLanguage: "fr-FR",
    mainEntity,
  };
}
