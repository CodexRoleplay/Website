import AdminDashboardClient from "./AdminDashboardClient";

export const metadata = {
  alternates: {
    canonical: "/admin",
  },
};

export default function AdminDashboardPage() {
  return (
    <AdminDashboardClient
      initialCodePenal={{ articles: 0, jurisdictions: 0, sections: 0 }}
      initialFaq={{ categories: 0, questions: 0 }}
      initialLore={{ blocks: 0 }}
      initialReglement={{ categories: 0, sections: 0 }}
    />
  );
}
