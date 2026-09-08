import { absoluteUrl } from "@/lib/site-url";

export const dynamic = "force-static";

export function GET() {
  const content = `# Codex RP

> Codex RP est un serveur roleplay FiveM francophone réaliste, situé dans un univers inspiré de Los Angeles.

Le serveur met l'accent sur l'immersion, la cohérence roleplay, l'économie, les carrières, les entreprises, la justice et la vie communautaire. L'accès au serveur est libre. La boutique Codex RP est cosmétique et ne donne aucun avantage de jeu.

## Pages principales

- [Accueil](${absoluteUrl("/")}): présentation du serveur, de son univers et de sa communauté.
- [Boutique](${absoluteUrl("/boutique")}): catalogue des abonnements et des packs Codyx.
- [Règlement](${absoluteUrl("/reglement")}): règles officielles du serveur Codex RP.
- [Code pénal](${absoluteUrl("/code-penal")}): infractions, sanctions et procédures judiciaires en jeu.
- [FAQ](${absoluteUrl("/faq")}): réponses aux questions fréquentes sur le serveur.

## Ressources d'exploration

- [Sitemap XML](${absoluteUrl("/sitemap.xml")}): liste des pages publiques indexables.
- [Règles pour les robots](${absoluteUrl("/robots.txt")}): directives d'exploration du site.

## Optional

- [Discord officiel](https://discord.gg/HwUqfteUHz): rejoindre la communauté Codex RP.
- [Vote Top Serveurs](https://top-serveurs.net/gta/vote/codex-rp): soutenir le serveur.
- [TikTok officiel](https://www.tiktok.com/@codexrpofficiel): contenus courts et actualités.
- [YouTube officiel](https://www.youtube.com/@CodexRPOfficiel): vidéos de la communauté.
`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
