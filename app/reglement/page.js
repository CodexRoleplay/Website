import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { getPublishedReglement } from "@/lib/reglement/published";
import ReglementClient from "./ReglementClient";
import styles from "./reglement.module.css";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata = {
  alternates: {
    canonical: "/reglement",
  },
  title: "Règlement — Codex RP",
  description: "Règlement Codex RP : bases du RP, règles légales, illégales et sanctions.",
};

export default async function ReglementPage() {
  const { categories } = await getPublishedReglement();

  return (
    <>
      <Header />
      <div className={styles.page}>
        <ReglementClient initialCategories={categories} />
        <div className={styles.pageFooter}>
          <Footer />
        </div>
      </div>
    </>
  );
}
