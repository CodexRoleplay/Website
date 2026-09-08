import { SocialIcon } from "@/components/Header";
import { footerGroups, socialLinks } from "@/data/site";

export default function Footer() {
  return (
    <footer className="footer_footer__pTLpy">
      <div className="footer_bg__Qx50L" aria-hidden="true">
        <div
          style={{
            translate: "none",
            rotate: "none",
            scale: "none",
            transform: "translate(0px, -15%)",
          }}
        />
      </div>

      <div className="kit_wrapper__8wmK4 footer_stage__nEw01">
        <div className="footer_content__nEw12">
          <div className="footer_brand__nEw13">
            <img
              className="footer_logo__mzArI"
              src="/img/logo_other.webp"
              alt="Codex RP"
              loading="lazy"
              decoding="async"
            />
            <p>
              Pas de vitrine RP : un monde cohérent où chaque décision se joue en scène, pas dans
              un salon Discord.
            </p>
            <div className="footer_socials__nEw14" aria-label="Réseaux sociaux">
              {socialLinks.map((social) => (
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  title={social.label}
                  key={social.label}
                >
                  <SocialIcon name={social.icon} />
                </a>
              ))}
            </div>
          </div>

          <nav className="footer_nav__nEw15" aria-label="Navigation du pied de page">
            <ul className="footer_menu__aJYNX">
              {footerGroups.map((group) => (
                <li style={{ "--color": group.color }} key={group.title}>
                  <h3>{group.title}</h3>
                  <ul>
                    {group.links.map((link) => (
                      <li key={link.label}>
                        <a
                          className={link.disabled ? "footer_disabled__KBqk1" : ""}
                          href={link.href}
                          target={link.external ? "_blank" : undefined}
                          rel={link.external ? "noopener noreferrer" : undefined}
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="footer_bottom__j1FqV">
          <p className="footer_copyright__nEw16">
            <strong>© 2026 Codex RP</strong>
            <span>Tous droits réservés.</span>
          </p>
          <p className="footer_disclaimer__nEw17">
            Codex RP n&apos;est ni approuvé ni sponsorisé par Rockstar Games.
          </p>
        </div>
      </div>
    </footer>
  );
}
