"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { readApiJson } from "@/lib/admin/read-api-json";
import { cardCategoryKey, formatBonusLabel } from "@/lib/boutique/card-display";
import styles from "./boutique-admin.module.css";

function formatDate(value) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatPrice(value, currency) {
  if (typeof value !== "number") {
    return "";
  }

  try {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: currency || "EUR",
    }).format(value);
  } catch {
    return "";
  }
}

function cardsPayload(rows) {
  return {
    featuredProducts: rows
      .filter((row) => row.bannerText.trim())
      .map((row) => ({
        packageId: row.packageId,
        packageIdent: row.packageIdent,
        bannerText: row.bannerText.trim(),
      })),
    knownProducts: rows.map((row) => ({
      packageId: row.packageId,
      packageIdent: row.packageIdent,
      name: row.name,
      categoryName: row.categoryName,
    })),
    bonuses: rows
      .filter((row) => row.badgeText.trim() || (row.legacyBonusPercent !== "" && row.legacyBonusPercent != null))
      .map((row) => ({
        packageId: row.packageId,
        packageIdent: row.packageIdent,
        badgeText: row.badgeText.trim(),
        percent: row.badgeText.trim() ? null : row.legacyBonusPercent,
      })),
    priceNotes: rows
      .filter((row) => row.priceNote.trim())
      .map((row) => ({
        packageId: row.packageId,
        packageIdent: row.packageIdent,
        text: row.priceNote.trim(),
      })),
  };
}

export default function BoutiqueCardsClient() {
  const { user, getIdToken, loading: authLoading } = useAuth();
  const [rows, setRows] = useState([]);
  const [catalogError, setCatalogError] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const applyPayload = useCallback((payload) => {
    setRows(Array.isArray(payload.products) ? payload.products : []);
    setCatalogError(typeof payload.catalogError === "string" ? payload.catalogError : "");
    setUpdatedAt(payload.updatedAt ?? null);
  }, []);

  const loadCards = useCallback(async () => {
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

      const response = await fetch("/api/admin/boutique/cards", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const payload = await readApiJson(response);

      if (!response.ok) {
        throw new Error(payload.error ?? "Impossible de charger les cartes.");
      }

      applyPayload(payload);
      setLoaded(true);
    } catch (loadError) {
      setError(loadError.message ?? "Impossible de charger les cartes.");
    } finally {
      setLoading(false);
    }
  }, [applyPayload, authLoading, getIdToken, user]);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  function updateRow(packageId, partial) {
    setRows((current) => current.map((row) => (row.packageId === packageId ? { ...row, ...partial } : row)));
    setMessage("");
  }

  function removeRow(packageId) {
    setRows((current) => current.filter((row) => row.packageId !== packageId));
    setMessage("");
  }

  async function saveCards() {
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const token = await getIdToken();

      if (!token) {
        throw new Error("Session expirée. Reconnecte-toi.");
      }

      const response = await fetch("/api/admin/boutique/cards", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scope: "cards",
          cards: cardsPayload(rows),
        }),
      });
      const payload = await readApiJson(response);

      if (!response.ok) {
        throw new Error(payload.error ?? "Impossible d’enregistrer les cartes.");
      }

      applyPayload(payload);
      setMessage("Cartes enregistrées. La boutique publique affiche ces réglages au prochain chargement.");
    } catch (saveError) {
      setError(saveError.message ?? "Impossible d’enregistrer les cartes.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.editor}>
      <div className={styles.toolbar}>
        <div>
          <h2>Produits Tebex</h2>
          <div className={styles.help}>
            <p>Bandeau, badge et texte sous le prix sont libres. Tu peux les poser sur autant de produits que tu veux. Un champ vide n’affiche rien.</p>
            {updatedAt ? <p>Dernier enregistrement : {formatDate(updatedAt)}.</p> : null}
          </div>
        </div>
        <button className={styles.saveButton} disabled={loading || saving || !loaded} onClick={saveCards} type="button">
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>

      {catalogError ? <p className={styles.notice}>{catalogError}</p> : null}
      {error ? <p className={styles.error}>{error}</p> : null}
      {message ? <p className={styles.success} role="status">{message}</p> : null}

      {loading ? <p className={styles.empty}>Chargement des produits…</p> : null}

      {!loading && !rows.length ? (
        <p className={styles.empty}>
          {catalogError
            ? "Aucun produit enregistré pour le moment. Dès que le catalogue Tebex répond, la liste apparaîtra ici."
            : "Tebex n’a renvoyé aucun produit."}
        </p>
      ) : null}

      {rows.length ? (
        <ul className={styles.list}>
          {rows.map((row, index) => {
            const price = formatPrice(row.price, row.currency);
            const categoryChanged =
              index > 0 &&
              cardCategoryKey(rows[index - 1].categoryName) !== cardCategoryKey(row.categoryName);

            return (
              <Fragment key={row.packageId}>
                {categoryChanged ? <li aria-hidden="true" className={styles.categoryDivider} /> : null}
                <li className={`${styles.row} ${row.bannerText.trim() ? styles.rowFeatured : ""}`}>
                  <div className={styles.identity}>
                    <strong>{row.name}</strong>
                    <span>{[row.categoryName, price].filter(Boolean).join(" · ")}</span>
                    <small>ID Tebex {row.packageId}{row.packageIdent ? ` · ${row.packageIdent}` : ""}</small>
                    {row.missing ? <em className={styles.missing}>Absent du catalogue actuel</em> : null}
                    {row.missing ? (
                      <button className={styles.removeButton} onClick={() => removeRow(row.packageId)} type="button">
                        Retirer
                      </button>
                    ) : null}
                  </div>

                  <div className={styles.copyFields}>
                    <label>
                      <span>Bandeau</span>
                      <input
                        maxLength={80}
                        onChange={(event) => updateRow(row.packageId, { bannerText: event.target.value })}
                        placeholder="Recommandé, Meilleure valeur…"
                        value={row.bannerText}
                      />
                    </label>
                    <label>
                      <span>Badge</span>
                      <input
                        maxLength={80}
                        onChange={(event) => updateRow(row.packageId, { badgeText: event.target.value })}
                        placeholder="9 jours offerts, +42 % de bonus vs Venice…"
                        value={row.badgeText}
                      />
                    </label>
                    <label>
                      <span>Sous le prix</span>
                      <input
                        maxLength={140}
                        onChange={(event) => updateRow(row.packageId, { priceNote: event.target.value })}
                        placeholder="7,49 € le 1er mois"
                        value={row.priceNote}
                      />
                    </label>
                    {!row.badgeText.trim() && row.legacyBonusPercent !== "" && row.legacyBonusPercent != null ? (
                      <p className={styles.legacyHint}>
                        Ancien bonus encore affiché : {formatBonusLabel(row.legacyBonusPercent)}.
                        <button
                          onClick={() => updateRow(row.packageId, { legacyBonusPercent: "" })}
                          type="button"
                        >
                          Ne plus l’afficher
                        </button>
                      </p>
                    ) : null}
                  </div>
                </li>
              </Fragment>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
