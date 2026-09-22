"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowUpRight,
  BookOpen,
  CircleHelp,
  Clock3,
  ExternalLink,
  FileText,
  History,
  RefreshCw,
  Scale,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { readApiJson } from "@/lib/admin/read-api-json";
import styles from "./dashboard.module.css";

function formatDate(value) {
  if (!value) {
    return "Aucune publication distante";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

async function fetchAdminData(url, token) {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const payload = await readApiJson(response);

  if (!response.ok) {
    throw new Error(payload.error ?? "Chargement impossible.");
  }

  return payload;
}

function countReglement(payload) {
  const categories = Array.isArray(payload?.categories) ? payload.categories : [];

  return {
    categories: categories.length,
    sections: categories.reduce(
      (total, category) => total + (Array.isArray(category.sections) ? category.sections.length : 0),
      0,
    ),
    updatedAt: payload?.updatedAt ?? null,
  };
}

function countCodePenal(payload) {
  const jurisdictions =
    Array.isArray(payload?.jurisdictions) && payload.jurisdictions.length
      ? payload.jurisdictions
      : [{ sections: Array.isArray(payload?.sections) ? payload.sections : [] }];
  const sections = jurisdictions.flatMap((jurisdiction) =>
    Array.isArray(jurisdiction.sections) ? jurisdiction.sections : [],
  );

  return {
    jurisdictions: jurisdictions.length,
    sections: sections.length,
    articles: sections.reduce(
      (total, section) => total + (Array.isArray(section.articles) ? section.articles.length : 0),
      0,
    ),
    updatedAt: payload?.updatedAt ?? null,
  };
}

function countFaq(payload) {
  const categories = Array.isArray(payload?.categories) ? payload.categories : [];

  return {
    categories: categories.length,
    questions: categories.reduce(
      (total, category) => total + (Array.isArray(category.items) ? category.items.length : 0),
      0,
    ),
    updatedAt: payload?.updatedAt ?? null,
  };
}

export default function AdminDashboardClient({ initialReglement, initialCodePenal, initialFaq }) {
  const { user, getIdToken, loading: authLoading } = useAuth();
  const [reglement, setReglement] = useState(initialReglement);
  const [codePenal, setCodePenal] = useState(initialCodePenal);
  const [faq, setFaq] = useState(initialFaq);
  const [reglementLog, setReglementLog] = useState(null);
  const [codePenalLog, setCodePenalLog] = useState(null);
  const [faqLog, setFaqLog] = useState(null);
  const [boutiqueEnabled, setBoutiqueEnabled] = useState(false);
  const [boutiqueSaving, setBoutiqueSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    if (authLoading || !user) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = await getIdToken();

      if (!token) {
        throw new Error("Session expirée. Reconnecte-toi.");
      }

      const [reglementResult, penalResult, faqResult, reglementLogsResult, penalLogsResult, faqLogsResult, boutiqueResult] = await Promise.allSettled([
        fetchAdminData("/api/admin/reglement", token),
        fetchAdminData("/api/admin/code-penal", token),
        fetchAdminData("/api/admin/faq", token),
        fetchAdminData("/api/admin/reglement/logs", token),
        fetchAdminData("/api/admin/code-penal/logs", token),
        fetchAdminData("/api/admin/faq/logs", token),
        fetchAdminData("/api/admin/boutique", token),
      ]);

      if (reglementResult.status === "fulfilled") {
        setReglement(countReglement(reglementResult.value));
      }

      if (penalResult.status === "fulfilled") {
        setCodePenal(countCodePenal(penalResult.value));
      }

      if (faqResult.status === "fulfilled") {
        setFaq(countFaq(faqResult.value));
      }

      if (boutiqueResult.status === "fulfilled") {
        setBoutiqueEnabled(boutiqueResult.value.enabled === true);
      }

      if (reglementLogsResult.status === "fulfilled") {
        setReglementLog(reglementLogsResult.value.logs?.[0] ?? null);
      }

      if (penalLogsResult.status === "fulfilled") {
        setCodePenalLog(penalLogsResult.value.logs?.[0] ?? null);
      }

      if (faqLogsResult.status === "fulfilled") {
        setFaqLog(faqLogsResult.value.logs?.[0] ?? null);
      }

      const rejected = [reglementResult, penalResult, faqResult, reglementLogsResult, penalLogsResult, faqLogsResult, boutiqueResult].find(
        (result) => result.status === "rejected",
      );

      if (rejected) {
        setError(rejected.reason?.message ?? "Certaines données n'ont pas pu être actualisées.");
      }
    } catch (loadError) {
      setError(loadError.message ?? "Impossible d'actualiser le tableau de bord.");
    } finally {
      setLoading(false);
    }
  }, [authLoading, getIdToken, user]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  async function updateBoutique(nextEnabled) {
    setBoutiqueSaving(true);
    setError("");

    try {
      const token = await getIdToken();

      if (!token) {
        throw new Error("Session expirée. Reconnecte-toi.");
      }

      const response = await fetch("/api/admin/boutique", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ enabled: nextEnabled }),
      });
      const payload = await readApiJson(response);

      if (!response.ok) {
        throw new Error(payload.error ?? "Impossible de modifier la boutique.");
      }

      setBoutiqueEnabled(payload.enabled === true);
    } catch (updateError) {
      setError(updateError.message ?? "Impossible de modifier la boutique.");
    } finally {
      setBoutiqueSaving(false);
    }
  }

  const statItems = [
    { label: "Rubriques", value: reglement.categories, icon: BookOpen, tone: "cyan" },
    { label: "Sections règlement", value: reglement.sections, icon: FileText, tone: "blue" },
    { label: "Juridictions", value: codePenal.jurisdictions ?? 1, icon: Scale, tone: "pink" },
    { label: "Articles", value: codePenal.articles, icon: ShieldCheck, tone: "green" },
  ];

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Centre de contrôle</span>
          <h1>Tableau de bord</h1>
          <p>Le contenu public et les outils d’administration réunis au même endroit.</p>
        </div>
        <button className={styles.refreshButton} disabled={loading} onClick={loadDashboard} type="button">
          <RefreshCw aria-hidden="true" className={loading ? styles.spinning : ""} size={17} />
          {loading ? "Actualisation" : "Actualiser"}
        </button>
      </header>

      {error ? <p className={styles.errorLine}>{error}</p> : null}

      <section className={styles.shopSwitch} aria-label="Boutique publique">
        <div>
          <span className={styles.eyebrow}>Visibilité</span>
          <h2>Boutique {boutiqueEnabled ? "ouverte" : "fermée"}</h2>
          <p>
            {boutiqueEnabled
              ? "Les joueurs accèdent au catalogue."
              : "Un clic sur Boutique affiche seulement l’annonce « bientôt disponible »."}
          </p>
        </div>
        <div className={styles.shopSwitchControl} role="group" aria-label="Activer la boutique">
          <button
            aria-pressed={!boutiqueEnabled}
            disabled={boutiqueSaving}
            onClick={() => updateBoutique(false)}
            type="button"
          >
            Off
          </button>
          <button
            aria-pressed={boutiqueEnabled}
            data-on={boutiqueEnabled ? "true" : "false"}
            disabled={boutiqueSaving}
            onClick={() => updateBoutique(true)}
            type="button"
          >
            On
          </button>
        </div>
      </section>

      <section className={styles.stats} aria-label="Statistiques du contenu">
        {statItems.map((item) => {
          const Icon = item.icon;

          return (
            <article className={styles.stat} data-tone={item.tone} key={item.label}>
              <Icon aria-hidden="true" size={20} />
              <div>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            </article>
          );
        })}
      </section>

      <section className={styles.workspaceGrid} aria-label="Espaces de gestion">
        <article className={`${styles.workspace} ${styles.workspaceReglement}`}>
          <div className={styles.workspaceHeader}>
            <span className={styles.workspaceIcon}><BookOpen aria-hidden="true" size={24} /></span>
            <div>
              <span className={styles.workspaceKicker}>Contenu du serveur</span>
              <h2>Règlement</h2>
            </div>
          </div>

          <p className={styles.workspaceDescription}>
            Organisez les rubriques, les sous-rubriques et tous les blocs visibles par les joueurs.
          </p>

          <div className={styles.workspaceMeta}>
            <span><strong>{reglement.categories}</strong> rubriques</span>
            <span><strong>{reglement.sections}</strong> sections</span>
          </div>

          <div className={styles.activity}>
            <Clock3 aria-hidden="true" size={17} />
            <div>
              <span>Dernière activité</span>
              <strong>{reglementLog?.summary || formatDate(reglement.updatedAt)}</strong>
              {reglementLog?.createdAt ? <small>{formatDate(reglementLog.createdAt)}</small> : null}
            </div>
          </div>

          <div className={styles.actions}>
            <Link className={styles.primaryAction} href="/admin/reglement">
              Ouvrir l’éditeur <ArrowUpRight aria-hidden="true" size={16} />
            </Link>
            <Link className={styles.secondaryAction} href="/admin/reglement/historique">
              <History aria-hidden="true" size={16} /> Historique
            </Link>
          </div>
        </article>

        <article className={`${styles.workspace} ${styles.workspacePenal}`}>
          <div className={styles.workspaceHeader}>
            <span className={styles.workspaceIcon}><Scale aria-hidden="true" size={24} /></span>
            <div>
              <span className={styles.workspaceKicker}>Référentiel juridique</span>
              <h2>Code pénal</h2>
            </div>
          </div>

          <p className={styles.workspaceDescription}>
            Gérez les juridictions, les chapitres, les infractions, les amendes et les peines.
          </p>

          <div className={styles.workspaceMeta}>
            <span><strong>{codePenal.jurisdictions ?? 1}</strong> juridiction(s)</span>
            <span><strong>{codePenal.sections}</strong> sections</span>
            <span><strong>{codePenal.articles}</strong> articles</span>
          </div>

          <div className={styles.activity}>
            <Clock3 aria-hidden="true" size={17} />
            <div>
              <span>Dernière activité</span>
              <strong>{codePenalLog?.summary || formatDate(codePenal.updatedAt)}</strong>
              {codePenalLog?.createdAt ? <small>{formatDate(codePenalLog.createdAt)}</small> : null}
            </div>
          </div>

          <div className={styles.actions}>
            <Link className={styles.primaryAction} href="/admin/code-penal">
              Ouvrir l’éditeur <ArrowUpRight aria-hidden="true" size={16} />
            </Link>
            <Link className={styles.secondaryAction} href="/admin/code-penal/historique">
              <History aria-hidden="true" size={16} /> Historique
            </Link>
          </div>
        </article>

        <article className={`${styles.workspace} ${styles.workspaceFaq}`}>
          <div className={styles.workspaceHeader}>
            <span className={styles.workspaceIcon}><CircleHelp aria-hidden="true" size={24} /></span>
            <div>
              <span className={styles.workspaceKicker}>Centre d’aide</span>
              <h2>FAQ</h2>
            </div>
          </div>

          <p className={styles.workspaceDescription}>
            Organisez les catégories, les questions et les réponses destinées aux joueurs.
          </p>

          <div className={styles.workspaceMeta}>
            <span><strong>{faq.categories}</strong> catégories</span>
            <span><strong>{faq.questions}</strong> questions</span>
          </div>

          <div className={styles.activity}>
            <Clock3 aria-hidden="true" size={17} />
            <div>
              <span>Dernière activité</span>
              <strong>{faqLog?.summary || formatDate(faq.updatedAt)}</strong>
              {faqLog?.createdAt ? <small>{formatDate(faqLog.createdAt)}</small> : null}
            </div>
          </div>

          <div className={styles.actions}>
            <Link className={styles.primaryAction} href="/admin/faq">
              Ouvrir l’éditeur <ArrowUpRight aria-hidden="true" size={16} />
            </Link>
            <Link className={styles.secondaryAction} href="/admin/faq/historique">
              <History aria-hidden="true" size={16} /> Historique
            </Link>
          </div>
        </article>
      </section>

      <section className={styles.utilityGrid} aria-label="Outils rapides">
        <Link className={styles.utility} href="/admin/users">
          <Users aria-hidden="true" size={21} />
          <span><strong>Accès administrateurs</strong><small>Comptes et autorisations du panel</small></span>
          <ArrowUpRight aria-hidden="true" size={17} />
        </Link>
        <Link className={styles.utility} href="/reglement" rel="noreferrer" target="_blank">
          <ExternalLink aria-hidden="true" size={21} />
          <span><strong>Voir le règlement</strong><small>Ouvrir la page publique</small></span>
          <ArrowUpRight aria-hidden="true" size={17} />
        </Link>
        <Link className={styles.utility} href="/code-penal" rel="noreferrer" target="_blank">
          <ExternalLink aria-hidden="true" size={21} />
          <span><strong>Voir le code pénal</strong><small>Contrôler le rendu public</small></span>
          <ArrowUpRight aria-hidden="true" size={17} />
        </Link>
        <Link className={styles.utility} href="/faq" rel="noreferrer" target="_blank">
          <ExternalLink aria-hidden="true" size={21} />
          <span><strong>Voir la FAQ</strong><small>Contrôler les réponses publiques</small></span>
          <ArrowUpRight aria-hidden="true" size={17} />
        </Link>
      </section>
    </div>
  );
}
