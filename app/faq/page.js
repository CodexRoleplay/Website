import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { getPublishedFaq } from "@/lib/faq/published";
import FaqClient from "./FaqClient";
import styles from "./faq.module.css";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata = {
  alternates: {
    canonical: "/faq",
  },
  title: "FAQ — Codex RP",
  description: "FAQ Codex RP : FiveM, connexion au serveur, boutique, Codyx et assistance.",
};

export default async function FaqPage() {
  const { categories } = await getPublishedFaq();

  return (
    <>
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
