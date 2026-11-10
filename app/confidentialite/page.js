import Footer from "@/components/Footer";
import Header from "@/components/Header";
import LegalArticle from "@/components/legal/LegalArticle";
import LegalBlocksArticle from "@/components/legal/LegalBlocksArticle";
import styles from "@/components/legal/legal.module.css";
import { getPublishedLegal } from "@/lib/legal/published";
import { getPublishedLegalPages } from "@/lib/legal/pages-published";
import { pageMetadata } from "@/lib/seo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  path: "/confidentialite",
  title: "Confidentialité - Codex RP",
  description:
    "Données utilisées par Codex RP, durées de conservation, destinataires et droits d'accès.",
});

export default async function ConfidentialitePage() {
  const [legal, pages] = await Promise.all([getPublishedLegal(), getPublishedLegalPages()]);
  const custom = pages.privacy;

  return (
    <>
      <Header />
      <div className={styles.page}>
        {custom?.blocks?.length ? (
          <LegalBlocksArticle blocks={custom.blocks} title={custom.title} updatedAt={custom.updatedAt} />
        ) : (
          <LegalArticle document={legal} kind="privacy" />
        )}
        <div className={styles.pageFooter}>
          <Footer />
        </div>
      </div>
    </>
  );
}
