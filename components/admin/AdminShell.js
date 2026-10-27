"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookOpen,
  ChevronDown,
  ScrollText,
  CircleHelp,
  ExternalLink,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Scale,
  Users,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import styles from "@/components/admin/admin.module.css";

const NAV_GROUPS = [
  [
    { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard, match: (path) => path === "/admin" },
  ],
  [
    { href: "/admin/reglement", label: "Règlement", icon: BookOpen, match: (path) => path === "/admin/reglement" },
    {
      href: "/admin/reglement/historique",
      label: "Historique",
      icon: History,
      match: (path) => path.startsWith("/admin/reglement/historique"),
    },
  ],
  [
    { href: "/admin/lore", label: "Lore actuel", icon: ScrollText, match: (path) => path === "/admin/lore" },
    {
      href: "/admin/lore/historique",
      label: "Historique",
      icon: History,
      match: (path) => path.startsWith("/admin/lore/historique"),
    },
  ],
  [
    { href: "/admin/code-penal", label: "Code pénal", icon: Scale, match: (path) => path === "/admin/code-penal" },
    {
      href: "/admin/code-penal/historique",
      label: "Historique",
      icon: History,
      match: (path) => path.startsWith("/admin/code-penal/historique"),
    },
  ],
  [
    { href: "/admin/faq", label: "FAQ", icon: CircleHelp, match: (path) => path === "/admin/faq" },
    {
      href: "/admin/faq/historique",
      label: "Historique",
      icon: History,
      match: (path) => path.startsWith("/admin/faq/historique"),
    },
  ],
];

export default function AdminShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, loading, logout } = useAuth();
  const isLoginPage = pathname === "/admin/login";
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("codex-admin-sidebar");

    if (saved === "collapsed") {
      setCollapsed(true);
    }
  }, []);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (isLoginPage) {
      if (user && isAdmin) {
        router.replace("/admin");
      }
      return;
    }

    if (!user) {
      router.replace("/admin/login");
      return;
    }

    if (!isAdmin) {
      router.replace("/admin/login?error=unauthorized");
    }
  }, [loading, user, isAdmin, isLoginPage, router]);

  function toggleSidebar() {
    setCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem("codex-admin-sidebar", next ? "collapsed" : "expanded");
      return next;
    });
  }

  if (isLoginPage) {
    return children;
  }

  if (loading || !user || !isAdmin) {
    return (
      <div className={styles.loadingState}>
        <p>Vérification de l&apos;accès admin…</p>
      </div>
    );
  }

  return (
    <div className={`${styles.shell} ${collapsed ? styles.shellCollapsed : ""} ${mobileNavOpen ? styles.mobileNavOpen : ""}`}>
      <aside className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ""}`}>
        <div className={styles.sidebarTop}>
          <div className={styles.brand}>
            <span>Codex</span>
            <small>Panel admin</small>
          </div>
          <div aria-hidden="true" className={styles.brandCollapsed}>
            C
          </div>

          <button
            aria-controls="admin-mobile-nav"
            aria-expanded={mobileNavOpen}
            className={styles.mobileNavToggle}
            onClick={() => setMobileNavOpen((open) => !open)}
            type="button"
          >
            {mobileNavOpen ? <ChevronDown aria-hidden="true" size={18} /> : <Menu aria-hidden="true" size={18} />}
            <span>{mobileNavOpen ? "Fermer" : "Menu"}</span>
          </button>
        </div>

        <div className={styles.mobileNavPanel} id="admin-mobile-nav">
          <nav className={styles.nav}>
            {NAV_GROUPS.map((group, groupIndex) => (
              <div className={styles.navGroup} key={group[0].href}>
                {groupIndex > 0 ? <hr className={styles.navSeparator} /> : null}
                {group.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      className={item.match(pathname) ? styles.navActive : ""}
                      href={item.href}
                      key={item.href}
                      title={item.label}
                    >
                      <span className={styles.navShort}><Icon aria-hidden="true" size={17} /></span>
                      <span className={styles.navLabel}>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          <div className={styles.sidebarFooter}>
            <p className={styles.sidebarEmail}>{user.email}</p>

            <div className={styles.footerNav}>
              <Link
                className={pathname.startsWith("/admin/users") ? styles.footerNavActive : ""}
                href="/admin/users"
                title="Accès admin"
              >
                <span className={styles.navShort}><Users aria-hidden="true" size={17} /></span>
                <span className={styles.navLabel}>Accès admin</span>
              </Link>

              <Link href="/" rel="noreferrer" target="_blank" title="Voir le site">
                <span className={styles.navShort}><ExternalLink aria-hidden="true" size={17} /></span>
                <span className={styles.navLabel}>Voir le site</span>
              </Link>

              <button onClick={() => logout()} title="Déconnexion" type="button">
                <span className={styles.navShort}><LogOut aria-hidden="true" size={17} /></span>
                <span className={styles.navLabel}>Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      <button
        aria-expanded={!collapsed}
        aria-label={collapsed ? "Agrandir le menu" : "Réduire le menu"}
        className={`${styles.sidebarToggle} ${collapsed ? styles.sidebarToggleCollapsed : ""}`}
        onClick={toggleSidebar}
        type="button"
      >
        {collapsed ? <PanelLeftOpen aria-hidden="true" size={15} /> : <PanelLeftClose aria-hidden="true" size={15} />}
      </button>

      <main className={styles.main}>{children}</main>
    </div>
  );
}
