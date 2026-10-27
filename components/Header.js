"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import ShopLink from "@/components/ShopLink";
import { socialLinks } from "@/data/site";

const serverLinks = [
  { label: "Règlement", href: "/reglement" },
  { label: "Code pénal", href: "/code-penal" },
  { label: "FAQ", href: "/faq" },
  { label: "Lore actuel", href: "/lore" },
];

const shopLinks = [
  { label: "Abonnements", href: "/boutique?categorie=abonnements#catalogue" },
  { label: "Packs Codyx", href: "/boutique?categorie=packs-codyx#catalogue" },
];

export function SocialIcon({ name }) {
  const commonProps = {
    "aria-hidden": true,
    role: "img",
    width: "1em",
    height: "1em",
    viewBox: "0 0 24 24",
  };

  if (name === "menu") {
    return (
      <svg {...commonProps} className="iconify iconify--hugeicons">
        <path
          d="M4 5h16M4 12h16M4 19h16"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
      </svg>
    );
  }

  if (name === "home") {
    return (
      <svg {...commonProps} className="iconify codex-home-icon">
        <path
          d="M4 10.8 12 4l8 6.8v8.7a.5.5 0 0 1-.5.5H15v-6H9v6H4.5a.5.5 0 0 1-.5-.5z"
          fill="currentColor"
        />
      </svg>
    );
  }

  if (name === "discord") {
    return (
      <svg {...commonProps} className="iconify iconify--iconoir">
        <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
          <path d="M5.5 16c5 2.5 8 2.5 13 0" />
          <path d="m15.5 17.5 1 2s4.171-1.328 5.5-3.5c0-1 .53-8.147-3-10.5-1.5-1-4-1.5-4-1.5l-1 2h-2" />
          <path d="m8.528 17.5-1 2S3.357 18.172 2.028 16c0-1-.53-8.147 3-10.5 1.5-1 4-1.5 4-1.5l1 2h2" />
          <path d="M8.5 14C7.672 14 7 13.105 7 12s.672-2 1.5-2 1.5.895 1.5 2-.672 2-1.5 2m7 0c-.828 0-1.5-.895-1.5-2s.672-2 1.5-2 1.5.895 1.5 2-.672 2-1.5 2" />
        </g>
      </svg>
    );
  }

  if (name === "tiktok") {
    return (
      <svg {...commonProps} className="iconify iconify--teenyicons" viewBox="0 0 15 15">
        <path
          clipRule="evenodd"
          d="M9 0h1v1a4 4 0 0 0 4 4v1a5 5 0 0 1-4-2v7a4 4 0 1 1-4-4v1a3 3 0 1 0 3 3z"
          fill="currentColor"
          fillRule="evenodd"
        />
      </svg>
    );
  }

  if (name === "youtube") {
    return (
      <svg {...commonProps} className="iconify iconify--hugeicons">
        <g fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 20.5c1.81 0 3.545-.179 5.153-.507 2.01-.41 3.014-.614 3.93-1.792.917-1.179.917-2.532.917-5.238v-1.926c0-2.706 0-4.06-.917-5.238-.916-1.178-1.92-1.383-3.93-1.792A26 26 0 0 0 12 3.5c-1.81 0-3.545.179-5.153.507-2.01.41-3.014.614-3.93 1.792C2 6.978 2 8.331 2 11.037v1.926c0 2.706 0 4.06.917 5.238.916 1.178 1.92 1.383 3.93 1.792 1.608.328 3.343.507 5.153.507Z" />
          <path
            d="M15.962 12.313c-.148.606-.938 1.04-2.517 1.911-1.718.947-2.577 1.42-3.272 1.237a1.7 1.7 0 0 1-.635-.317C9 14.709 9 13.806 9 12s0-2.709.538-3.144c.182-.147.4-.256.635-.317.695-.183 1.554.29 3.272 1.237 1.58.87 2.369 1.305 2.517 1.911.05.206.05.42 0 .626Z"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    );
  }

  if (name === "twitter") {
    return (
      <svg {...commonProps} className="iconify iconify--hugeicons">
        <path
          d="m3 21 7.548-7.548M21 3l-7.548 7.548m0 0L8 3H3l7.548 10.452m2.904-2.904L21 21h-5l-5.452-7.548"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
      </svg>
    );
  }

  if (name === "twitch") {
    return (
      <svg {...commonProps} className="iconify iconify--hugeicons">
        <path
          d="M16 7v4m-4-4v4m4-8H8c-1.886 0-2.828 0-3.414.584C4 4.167 4 5.106 4 6.984v6.576c0 .37 0 .555.025.71a2 2 0 0 0 1.662 1.657c.156.024.341.024.713.024.093 0 .14 0 .178.006a.5.5 0 0 1 .416.414c.006.039.006.085.006.178v1.543c0 1.182 0 1.773.335 1.89.334.117.705-.344 1.446-1.268l1.919-2.39c.147-.183.221-.275.324-.324.102-.049.22-.049.457-.049h3.862c.818 0 1.226 0 1.594-.152.367-.151.656-.44 1.235-1.015l.656-.655c.579-.575.867-.863 1.02-1.23.152-.366.152-.773.152-1.587V6.985c0-1.879 0-2.818-.586-3.401C18.828 3 17.886 3 16 3"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
      </svg>
    );
  }

  return (
    <svg {...commonProps} className="iconify iconify--hugeicons">
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
        <path d="M3 12c0-4.243 0-6.364 1.318-7.682S7.758 3 12 3s6.364 0 7.682 1.318S21 7.758 21 12s0 6.364-1.318 7.682S16.242 21 12 21s-6.364 0-7.682-1.318S3 16.242 3 12" />
        <path d="M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0m1.375-5.25h-.125m.25 0a.25.25 0 1 1-.5 0 .25.25 0 0 1 .5 0" />
      </g>
    </svg>
  );
}

function NavLabel({ index, label }) {
  return (
    <>
      <span className="cxnav__idx" aria-hidden="true">
        {index}
      </span>
      <span className="cxnav__label" data-text={label}>
        {label}
      </span>
    </>
  );
}

function Caret() {
  return (
    <svg className="cxnav__caret" viewBox="0 0 10 6" width="10" height="6" aria-hidden="true">
      <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function NavLink({ index, label, href, active, external }) {
  return (
    <li className="cxnav__cell">
      <a
        className={`cxnav__link${active ? " is-active" : ""}`}
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
      >
        <NavLabel index={index} label={label} />
      </a>
    </li>
  );
}

function NavDropdown({ index, label, links, active, featured, href }) {
  return (
    <li className={`cxnav__cell cxnav__cell--sub${featured ? " cxnav__cell--featured" : ""}`}>
      {href ? (
        <ShopLink className={`cxnav__link${active ? " is-active" : ""}`} href={href}>
          <NavLabel index={index} label={label} />
          <Caret />
        </ShopLink>
      ) : (
        <button className={`cxnav__link${active ? " is-active" : ""}`} type="button">
          <NavLabel index={index} label={label} />
          <Caret />
        </button>
      )}
      <div className="cxnav__panel" role="menu">
        <span className="cxnav__panel-tag" aria-hidden="true">
          //{label}
        </span>
        <ul>
          {links.map((link, i) => (
            <li key={link.label} style={{ "--i": i }}>
              <ShopLink
                className="cxnav__panel-link"
                href={link.href}
                rel={link.icon ? "noopener noreferrer" : undefined}
                target={link.icon ? "_blank" : undefined}
              >
                {link.icon ? <SocialIcon name={link.icon} /> : <span className="cxnav__panel-dot" aria-hidden="true" />}
                <span>{link.label}</span>
                <svg className="cxnav__panel-arrow" viewBox="0 0 12 12" width="10" height="10" aria-hidden="true">
                  <path d="M2 10 10 2M4 2h6v6" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </ShopLink>
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const updateHeader = () => setIsCompact(window.scrollY > 20);

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    return () => window.removeEventListener("scroll", updateHeader);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("cxnav-locked", isOpen);
    return () => document.documentElement.classList.remove("cxnav-locked");
  }, [isOpen]);

  return (
    <header className={`cxnav${isCompact ? " cxnav--compact" : ""}${isOpen ? " cxnav--open" : ""}`}>
      <div className="cxnav__bar">
        <a className="cxnav__brand" href="/" aria-label="CODEX RP - Accueil">
          <img
            className="cxnav__brand-logo cxnav__brand-logo--full"
            src="/img/logo_other.webp"
            alt=""
            aria-hidden="true"
          />
          <img
            className="cxnav__brand-logo cxnav__brand-logo--small"
            src="/img/codex_small.webp"
            alt=""
            aria-hidden="true"
          />
        </a>
        <div className="cxnav__glass" aria-hidden="true" />
        <span className="cxnav__edge cxnav__edge--top" aria-hidden="true" />
        <span className="cxnav__edge cxnav__edge--bottom" aria-hidden="true" />
        <svg
          className="cxnav__tip cxnav__tip--left"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <polyline points="99.5,0.5 0.5,50 99.5,99.5" vectorEffect="non-scaling-stroke" />
        </svg>
        <svg
          className="cxnav__tip cxnav__tip--right"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <polyline points="0.5,0.5 99.5,50 0.5,99.5" vectorEffect="non-scaling-stroke" />
        </svg>

        <nav className="cxnav__nav">
          <ul className="cxnav__group cxnav__group--cyan">
            <NavLink index="01" label="Accueil" href="/" active={pathname === "/"} />
            <NavLink index="02" label="Rejoindre" href="https://discord.gg/HwUqfteUHz" external />
            <NavDropdown
              index="03"
              label="Serveur"
              links={serverLinks}
              active={pathname.startsWith("/reglement") || pathname.startsWith("/code-penal") || pathname.startsWith("/lore")}
            />
          </ul>

          <div className="cxnav__core">
            <a className="cxnav__pod" href="/" aria-label="Codex RP - Accueil">
              <img className="cxnav__logo cxnav__logo--full" src="/img/logo_other.webp" alt="Codex RP" />
              <img className="cxnav__logo cxnav__logo--small" src="/img/codex_small.webp" alt="Codex RP" />
            </a>
          </div>

          <ul className="cxnav__group cxnav__group--pink">
            <NavDropdown
              index="04"
              label="Boutique"
              links={shopLinks}
              active={pathname.startsWith("/boutique")}
              featured
              href="/boutique"
            />
            <NavDropdown index="05" label="Réseaux" links={socialLinks} />
            <NavLink
              index="06"
              label="Voter"
              href="https://top-serveurs.net/gta/vote/codex-rp"
              external
            />
          </ul>
        </nav>

        <button
          className="cxnav__burger"
          type="button"
          aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((current) => !current)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div className="cxnav__drawer" data-lenis-prevent="true">
        <div className="cxnav__drawer-inner">
          <span className="cxnav__drawer-tag" aria-hidden="true">
            //NAVIGATION
          </span>
          <ul className="cxnav__drawer-list">
            <li style={{ "--i": 0 }}>
              <a className={pathname === "/" ? "is-active" : ""} href="/" onClick={() => setIsOpen(false)}>
                <em>01</em>Accueil
              </a>
            </li>
            <li style={{ "--i": 1 }}>
              <a href="https://discord.gg/HwUqfteUHz" target="_blank" rel="noopener noreferrer">
                <em>02</em>Rejoindre
              </a>
            </li>
            <li style={{ "--i": 2 }}>
              <span
                className={`cxnav__drawer-group${
                  pathname.startsWith("/reglement") || pathname.startsWith("/code-penal") || pathname.startsWith("/lore") ? " is-active" : ""
                }`}
              >
                <em>03</em>Serveur
              </span>
              <ul>
                {serverLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      className={pathname === link.href ? "is-active" : ""}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </li>
            <li style={{ "--i": 3 }}>
              <ShopLink
                className={`cxnav__drawer-group${pathname.startsWith("/boutique") ? " is-active" : ""}`}
                href="/boutique"
                onClick={() => setIsOpen(false)}
              >
                <em>04</em>Boutique
              </ShopLink>
              <ul>
                {shopLinks.map((link) => (
                  <li key={link.label}>
                    <ShopLink href={link.href} onClick={() => setIsOpen(false)}>
                      {link.label}
                    </ShopLink>
                  </li>
                ))}
              </ul>
            </li>
            <li style={{ "--i": 4 }}>
              <a href="https://top-serveurs.net/gta/vote/codex-rp" target="_blank" rel="noopener noreferrer">
                <em>05</em>Voter
              </a>
            </li>
          </ul>
          <div className="cxnav__drawer-social">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                aria-label={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <SocialIcon name={link.icon} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
