import Footer from "@/components/Footer";
import Header from "@/components/Header";
import LegalBlocksArticle from "@/components/legal/LegalBlocksArticle";
import SalesFallback from "@/components/legal/SalesFallback";
import styles from "@/components/legal/legal.module.css";
import { getPublishedLegalPages } from "@/lib/legal/pages-published";
import { pageMetadata } from "@/lib/seo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  path: "/conditions-de-vente",
  title: "Conditions de vente - Codex RP",
  description: "Paiement Tebex, livraison, abonnements et cadeaux de la boutique Codex RP.",
});

export default async function ConditionsDeVentePage() {
  const pages = await getPublishedLegalPages();
  const custom = pages.sales;

  return (
    <>
      <Header />
      <div className={styles.page}>
        {custom?.blocks?.length ? (
          <LegalBlocksArticle blocks={custom.blocks} title={custom.title} updatedAt={custom.updatedAt} />
        ) : (
          <SalesFallback />
        )}
        <div className={styles.pageFooter}>
          <Footer />
        </div>
      </div>
    </>
  );
}
