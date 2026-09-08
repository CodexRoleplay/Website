import { Suspense } from "react";
import AdminLoginPage from "./AdminLoginPage";
import styles from "@/components/admin/admin.module.css";

export const metadata = {
  alternates: {
    canonical: "/admin/login",
  },
};

function LoginFallback() {
  return (
    <div className={styles.loadingState}>
      <p>Chargement…</p>
    </div>
  );
}

export default function AdminLoginRoute() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <AdminLoginPage />
    </Suspense>
  );
}
