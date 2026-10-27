import { AuthProvider } from "@/contexts/AuthContext";
import AdminShell from "@/components/admin/AdminShell";
import styles from "@/components/admin/admin.module.css";
import { pageMetadata } from "@/lib/seo";

export const metadata = {
  ...pageMetadata({
    path: "/admin",
    title: "Admin — Codex RP",
    description: "Espace d'administration Codex RP.",
  }),
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }) {
  return (
    <AuthProvider>
      <div className={styles.adminRoot}>
        <AdminShell>{children}</AdminShell>
      </div>
    </AuthProvider>
  );
}
