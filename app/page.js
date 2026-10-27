import About from "@/components/About";
import { pageMetadata } from "@/lib/seo";
import CxGlide from "@/components/CxGlide";
import Footer from "@/components/Footer";
import FooterPalmier from "@/components/FooterPalmier";
import Gallery from "@/components/Gallery";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HeroPalmier from "@/components/HeroPalmier";
import Services from "@/components/Services";
import VideoTeaser from "@/components/VideoTeaser";
import WordsTicker from "@/components/WordsTicker";

export const metadata = pageMetadata({
  path: "/",
  title: "Codex RP : Serveur RP FiveM français réaliste (GTA 5)",
  description:
    "Serveur RP FiveM francophone réaliste. Tout ce qui est possible dans la vraie vie est possible ici. Accès libre, rejoins Los Angeles.",
});

export default function HomePage() {
  return (
    <>
      <Header />
      <div className="wrapper_main__v_pMu wrapper_home__GdrY6">
        <main>
          <div className="page_home__B20_w">
            <Hero />
            <HeroPalmier />
            <WordsTicker />
            <VideoTeaser />
            <CxGlide />
            <Services />
            <About />
            <Gallery />
          </div>
        </main>
        <FooterPalmier />
        <Footer />
      </div>
      <section
        aria-label="Notifications alt+T"
        tabIndex={-1}
        aria-live="polite"
        aria-relevant="additions text"
        aria-atomic="false"
      />
    </>
  );
}
