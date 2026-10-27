import { absoluteUrl } from "@/lib/site-url";

const routes = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/boutique", priority: 0.8, changeFrequency: "weekly" },
  { path: "/reglement", priority: 0.8, changeFrequency: "monthly" },
  { path: "/code-penal", priority: 0.7, changeFrequency: "monthly" },
  { path: "/faq", priority: 0.7, changeFrequency: "monthly" },
  { path: "/lore", priority: 0.7, changeFrequency: "weekly" },
];

export default function sitemap() {
  const lastModified = new Date();

  return routes.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
