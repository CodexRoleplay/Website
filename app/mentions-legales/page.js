import Footer from "@/components/Footer";
import Header from "@/components/Header";
import LegalArticle from "@/components/legal/LegalArticle";
import styles from "@/components/legal/legal.module.css";
import { getPublishedLegal } from "@/lib/legal/published";
import { pageMetadata } from "@/lib/seo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  path: "/mentions-legales",
  title: "Mentions légales - Codex RP",
  description: "Éditeur, directeur de la publication, hébergeur et paiement Tebex du site Codex RP.",
});

export default async function MentionsLegalesPage() {
  const legal = await getPublishedLegal();

  return (
    <>
      <Header />
      <div className={styles.page}>
        <LegalArticle document={legal} kind="mentions" />
        <div className={styles.pageFooter}>
          <Footer />
        </div>
      </div>
    </>
  );
}
