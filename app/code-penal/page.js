import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { getPublishedCodePenal } from "@/lib/code-penal/published";
import { pageMetadata } from "@/lib/seo";
import CodePenalClient from "./CodePenalClient";
import styles from "./code-penal.module.css";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  path: "/code-penal",
  title: "Code pénal - Codex RP",
  description:
    "Code pénal de Codex RP : infractions, amendes, peines et procédures judiciaires en jeu.",
});

export default async function CodePenalPage() {
  const { jurisdictions, sections } = await getPublishedCodePenal();

  return (
    <>
      <Header />
      <div className={styles.page}>
        <CodePenalClient initialJurisdictions={jurisdictions} initialSections={sections} />
        <div className={styles.pageFooter}>
          <Footer />
        </div>
      </div>
    </>
  );
}
