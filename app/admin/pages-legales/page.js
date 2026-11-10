import LegalAdminClient from "./LegalAdminClient";

export const metadata = {
  alternates: {
    canonical: "/admin/pages-legales",
  },
  title: "Pages légales — Codex RP",
};

export default function LegalAdminPage() {
  return <LegalAdminClient />;
}
