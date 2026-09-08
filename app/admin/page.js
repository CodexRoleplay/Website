import { getFallbackCodePenal } from "@/lib/code-penal/fallback";
import { getFallbackFaq } from "@/lib/faq/fallback";
import { getFallbackReglement } from "@/lib/reglement/fallback";
import AdminDashboardClient from "./AdminDashboardClient";

export const metadata = {
  alternates: {
    canonical: "/admin",
  },
};

export default function AdminDashboardPage() {
  const { categories } = getFallbackReglement();
  const { jurisdictions, sections } = getFallbackCodePenal();
  const { categories: faqCategories } = getFallbackFaq();

  return (
    <AdminDashboardClient
      initialCodePenal={{
        articles: sections.reduce((total, section) => total + section.articles.length, 0),
        jurisdictions: jurisdictions.length,
        sections: sections.length,
      }}
      initialFaq={{
        categories: faqCategories.length,
        questions: faqCategories.reduce((total, category) => total + category.items.length, 0),
      }}
      initialReglement={{
        categories: categories.length,
        sections: categories.reduce((total, category) => total + category.sections.length, 0),
      }}
    />
  );
}
