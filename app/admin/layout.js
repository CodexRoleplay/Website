import { AuthProvider } from "@/contexts/AuthContext";
import AdminShell from "@/components/admin/AdminShell";
import styles from "@/components/admin/admin.module.css";

export const metadata = {
  alternates: {
    canonical: "/admin",
  },
  title: "Admin — Codex RP",
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
