import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { getPublishedLore } from "@/lib/lore/published";
import { pageMetadata } from "@/lib/seo";
import LoreClient from "./LoreClient";
import shell from "../reglement/reglement.module.css";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  path: "/lore",
  title: "Lore actuel - Codex RP",
  description: "Le lore actuel de Codex RP : ce qui se passe en ce moment à Los Angeles.",
});

export default async function LorePage() {
  const lore = await getPublishedLore();

  return (
    <>
      <Header />
      <div className={shell.page}>
        <LoreClient initialLore={lore} />
        <div className={shell.pageFooter}>
          <Footer />
        </div>
      </div>
    </>
  );
}
