import LoreAdminClient from "./LoreAdminClient";
import styles from "@/components/admin/admin.module.css";

export const metadata = {
  alternates: {
    canonical: "/admin/lore",
  },
};

export default function AdminLorePage() {
  return (
    <>
      <header className={styles.pageHeader}>
        <h1>Lore actuel</h1>
        <p>
          Une seule page pour consigner les histoires en cours. Les retours à la ligne et les blocs sont repris
          tels quels sur la page publique.
        </p>
      </header>
      <LoreAdminClient />
    </>
  );
}
