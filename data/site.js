import { FALLBACK_SHOP_CATEGORY_LINKS } from "@/lib/boutique/shop-links";

export const serviceCards = [
  {
    eyebrow: "Scripts",
    titleLead: "Des scripts",
    titleStrong: "100% Customs",
    description:
      "Profite d'une expérience unique grâce à nos scripts développés sur mesure. De la gestion d'entreprise aux missions spéciales, chaque aspect du jeu a été pensé pour enrichir ton aventure RP.",
    image: "/img/home-services-card-primary.webp",
    color: "var(--primary-rgb)",
    column: "left",
  },
  {
    eyebrow: "Développement",
    titleLead: "Des développeurs",
    titleStrong: "expérimentés",
    description:
      "Un développement rigoureux assure la stabilité du serveur et des mises à jour régulières. Chaque fonctionnalité est testée avant sa mise en production, pour une expérience de jeu fluide.",
    image: "/img/home-services-card-tertiary.webp",
    color: "var(--tertiary-rgb)",
    column: "left",
  },
  {
    eyebrow: "Idées",
    titleLead: "Votre serveur",
    titleStrong: "vos idées",
    description:
      "Chez Codex RP, ta voix compte. Nous encourageons activement la communauté à partager ses idées et suggestions pour faire évoluer le serveur. Ta créativité façonne notre univers.",
    image: "/img/home-services-card-secondary.webp",
    color: "var(--secondary-rgb)",
    column: "right",
  },
  {
    eyebrow: "Réalisme",
    titleLead: "Le réalisme,",
    titleStrong: "sans exception",
    description:
      "Ici, on n'impose pas la gentillesse : on impose la cohérence. Ton personnage peut être ce qu'il veut, ami loyal ou pire ordure de la ville, tant que c'est réaliste. Le règlement veille, sans passe-droit.",
    image: "/img/home-services-card-quaternary.webp",
    color: "var(--quaternary-rgb)",
    column: "right",
  },
];

export const footerGroups = [
  {
    title: "Codex RP",
    color: "var(--primary)",
    links: [
      { label: "Accueil", href: "/" },
      { label: "Rejoindre", href: "https://discord.gg/HwUqfteUHz", external: true },
      { label: "Notre histoire", href: "#about" },
      {
        label: "Discord",
        href: "https://discord.gg/HwUqfteUHz",
        external: true,
      },
      {
        label: "Voter",
        href: "https://top-serveurs.net/gta/vote/codex-rp",
        external: true,
      },
    ],
  },
  {
    title: "Serveur",
    color: "var(--secondary)",
    links: [
      { label: "Règlement", href: "/reglement" },
      { label: "Code pénal", href: "/code-penal" },
      { label: "FAQ", href: "/faq" },
      { label: "Lore actuel", href: "/lore" },
    ],
  },
  {
    title: "Boutique",
    color: "var(--tertiary)",
    links: [{ label: "Catalogue", href: "/boutique" }, ...FALLBACK_SHOP_CATEGORY_LINKS],
  },
];

export const socialLinks = [
  { label: "Discord", href: "https://discord.gg/HwUqfteUHz", icon: "discord" },
  { label: "TikTok", href: "https://www.tiktok.com/@codexrpofficiel", icon: "tiktok" },
  { label: "Youtube", href: "https://www.youtube.com/@CodexRPOfficiel", icon: "youtube" },
];

export function galleryAlt(tag) {
  const raw = String(tag ?? "").trim();
  const label = raw
    ? raw.charAt(0).toLocaleUpperCase("fr-FR") + raw.slice(1).toLocaleLowerCase("fr-FR")
    : "Photo";

  return `${label} sur Codex RP`;
}

export const galleryPhotos = [
  { src: "/img/portfolio/1.webp", tag: "OFFROAD" },
  { src: "/img/portfolio/2.webp", tag: "SKYLINE" },
  { src: "/img/portfolio/3.webp", tag: "SERVEUR" },
  { src: "/img/portfolio/4.webp", tag: "CINÉ" },
  { src: "/img/portfolio/5.webp", tag: "SCÈNE" },
  { src: "/img/portfolio/6.webp", tag: "COMMU" },
  { src: "/img/portfolio/7.webp", tag: "NEON" },
  { src: "/img/portfolio/8.webp", tag: "STREET" },
  { src: "/img/portfolio/9.webp", tag: "EVENT" },
];

export const presentationVideo = {
  src: "/video/codexvideo.mp4",
};
