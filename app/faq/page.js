import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { getPublishedFaq } from "@/lib/faq/published";
import { faqPageJsonLd, pageMetadata } from "@/lib/seo";
import FaqClient from "./FaqClient";
import styles from "./faq.module.css";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  path: "/faq",
  title: "FAQ — Codex RP",
  description:
    "FAQ Codex RP : installer FiveM, rejoindre le serveur, boutique Codyx et assistance Discord.",
});

export default async function FaqPage() {
  const { categories } = await getPublishedFaq();
  const faqSchema = faqPageJsonLd(categories);

  return (
    <>
      {faqSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c"),
          }}
        />
      ) : null}
      <Header />
      <div className={styles.page}>
        <FaqClient initialCategories={categories} />
        <div className={styles.pageFooter}>
          <Footer />
        </div>
      </div>
    </>
  );
}
