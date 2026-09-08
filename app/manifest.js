export default function manifest() {
  return {
    name: "Codex RP",
    short_name: "Codex RP",
    description:
      "Serveur roleplay GTA V communautaire : scripts custom, immersion et communauté.",
    start_url: "/",
    display: "standalone",
    background_color: "#01081a",
    theme_color: "#01081a",
    lang: "fr",
    icons: [
      {
        src: "/img/favicon_codex.webp",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
