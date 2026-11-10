"use client";

import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Save } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { readApiJson } from "@/lib/admin/read-api-json";
import { LEGAL_FIELDS, defaultLegalDocument, missingLegalFields, normalizeLegalDocument } from "@/lib/legal/content";
import shellStyles from "@/components/admin/admin.module.css";
import styles from "./legal-admin.module.css";

const SECTIONS = [
  {
    id: "editor",
    title: "Éditeur du site",
    text: "Ces informations apparaissent dans les mentions légales. Pour une société, ajoute aussi la forme, le capital, le SIRET et le RCS.",
  },
  {
    id: "publication",
    title: "Directeur de la publication",
    text: "Nom et prénom de la personne responsable du contenu publié.",
  },
  {
    id: "host",
    title: "Hébergeur",
    text: "Le site est servi par Vercel. Tu peux corriger ces informations si l'hébergeur change.",
  },
  {
    id: "privacy",
    title: "Confidentialité",
    text: "L'adresse sert aux demandes d'accès, de rectification et de suppression. Les durées sont déjà rédigées et restent modifiables.",
  },
  {
    id: "notes",
    title: "Compléments",
    text: "Paragraphes facultatifs ajoutés en bas de chaque page.",
  },
];

function formatDate(value) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function LegalAdminClient() {
  const { user, getIdToken, loading: authLoading } = useAuth();
  const [legalDocument, setLegalDocument] = useState(defaultLegalDocument);
  const [lastMeta, setLastMeta] = useState({ updatedAt: null, updatedByEmail: null });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const missing = useMemo(() => missingLegalFields(legalDocument), [legalDocument]);

  useEffect(() => {
    if (authLoading || !user) {
      return undefined;
    }

    let cancelled = false;

    getIdToken()
      .then((token) => {
        if (!token) {
          throw new Error("Session expirée. Reconnecte-toi.");
        }

        return fetch("/api/admin/legal", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
      })
      .then(async (response) => {
        const payload = await readApiJson(response);

        if (!response.ok) {
          throw new Error(payload.error ?? "Chargement des pages légales impossible.");
        }

        return payload;
      })
      .then((payload) => {
        if (cancelled) {
          return;
        }

        setLegalDocument(normalizeLegalDocument(payload));
        setLastMeta({ updatedAt: payload.updatedAt ?? null, updatedByEmail: payload.updatedByEmail ?? null });
        setLoading(false);
      })
      .catch((loadError) => {
        if (!cancelled) {
          setError(loadError.message);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, getIdToken, user]);

  function updateField(key, value) {
    setLegalDocument((current) => ({ ...current, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const token = await getIdToken();

      if (!token) {
        throw new Error("Session expirée. Reconnecte-toi.");
      }

      const payload = normalizeLegalDocument(legalDocument);
      const response = await fetch("/api/admin/legal", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ document: payload }),
      });
      const result = await readApiJson(response);

      if (!response.ok) {
        throw new Error(result.error ?? "Enregistrement impossible.");
      }

      setLegalDocument(normalizeLegalDocument(result));
      setLastMeta({ updatedAt: result.updatedAt ?? new Date().toISOString(), updatedByEmail: result.updatedByEmail ?? user?.email ?? null });
      setMessage("Pages légales enregistrées.");
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className={styles.status}>Chargement des pages légales…</p>;
  }

  return (
    <div className={styles.editor}>
      <header className={shellStyles.pageHeader}>
        <h1>Pages légales</h1>
        <p>Renseigne l&apos;identité du site. Les paragraphes obligatoires sont déjà rédigés sur les pages publiques.</p>
      </header>

      <div className={styles.toolbar}>
        <div>
          {lastMeta.updatedAt ? (
            <p className={styles.meta}>
              Dernière modification : {formatDate(lastMeta.updatedAt)}
              {lastMeta.updatedByEmail ? ` · ${lastMeta.updatedByEmail}` : ""}
            </p>
          ) : (
            <p className={styles.meta}>Pas encore enregistré. L&apos;hébergeur Vercel est prérempli.</p>
          )}
          {missing.length ? (
            <p className={styles.missing}>Encore à remplir : {missing.join(", ")}.</p>
          ) : (
            <p className={styles.ready}>Les informations obligatoires sont renseignées.</p>
          )}
          {message ? <p className={styles.success}>{message}</p> : null}
          {error ? <p className={shellStyles.errorBox}>{error}</p> : null}
        </div>
        <div className={styles.toolbarActions}>
          <a href="/mentions-legales" rel="noreferrer" target="_blank">
            <ExternalLink aria-hidden="true" size={15} /> Mentions
          </a>
          <a href="/confidentialite" rel="noreferrer" target="_blank">
            <ExternalLink aria-hidden="true" size={15} /> Confidentialité
          </a>
          <button disabled={saving} onClick={handleSave} type="button">
            <Save aria-hidden="true" size={16} /> {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </div>

      {SECTIONS.map((section) => (
        <section className={styles.section} key={section.id}>
          <h2>{section.title}</h2>
          <p>{section.text}</p>
          <div className={styles.grid}>
            {LEGAL_FIELDS.filter((field) => field.section === section.id).map((field) => (
              <label className={field.multiline ? styles.wide : ""} key={field.key}>
                <span>
                  {field.label}
                  {field.required ? " *" : ""}
                </span>
                {field.multiline ? (
                  <textarea
                    onChange={(event) => updateField(field.key, event.target.value)}
                    rows={field.section === "notes" ? 5 : 3}
                    value={legalDocument[field.key] ?? ""}
                  />
                ) : (
                  <input
                    onChange={(event) => updateField(field.key, event.target.value)}
                    type={field.key.toLowerCase().includes("email") ? "email" : "text"}
                    value={legalDocument[field.key] ?? ""}
                  />
                )}
                {field.hint ? <small>{field.hint}</small> : null}
              </label>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
