"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { readApiJson } from "@/lib/admin/read-api-json";
import { BONUS_PERCENT_MAX, BONUS_PERCENT_MIN, formatBonusLabel } from "@/lib/boutique/card-display";
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

function bonusError(row) {
  if (!row.bonusEnabled) {
    return "";
  }

  const percent = row.bonusPercent;

  if (percent === "" || percent === null) {
    return `Indique un pourcentage pour ${row.name}.`;
  }

  if (!Number.isInteger(percent) || percent < BONUS_PERCENT_MIN || percent > BONUS_PERCENT_MAX) {
    return `Le bonus de ${row.name} doit être un entier entre ${BONUS_PERCENT_MIN} et ${BONUS_PERCENT_MAX}.`;
  }

  return "";
}

function cardsPayload(rows) {
  const featuredProducts = rows
    .filter((row) => row.featured)
    .map((row) => ({
      packageId: row.packageId,
      packageIdent: row.packageIdent,
    }));

  return {
    featuredPackageId: "",
    featuredPackageIdent: "",
    featuredProducts,
    knownProducts: rows.map((row) => ({
      packageId: row.packageId,
      packageIdent: row.packageIdent,
      name: row.name,
      categoryName: row.categoryName,
    })),
    bonuses: rows
      .filter((row) => row.bonusEnabled)
      .map((row) => ({
        packageId: row.packageId,
        packageIdent: row.packageIdent,
        percent: row.bonusPercent,
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

      setRows(Array.isArray(payload.products) ? payload.products : []);
      setCatalogError(typeof payload.catalogError === "string" ? payload.catalogError : "");
      setUpdatedAt(payload.updatedAt ?? null);
      setLoaded(true);
    } catch (loadError) {
      setError(loadError.message ?? "Impossible de charger les cartes.");
    } finally {
      setLoading(false);
    }
  }, [authLoading, getIdToken, user]);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  function updateRow(packageId, partial) {
    setRows((current) => current.map((row) => (row.packageId === packageId ? { ...row, ...partial } : row)));
    setMessage("");
  }

  function toggleFeatured(packageId) {
    setRows((current) => {
      const target = current.find((row) => row.packageId === packageId);
      const category = target?.categoryName ?? "";
      const nextFeatured = target?.featured !== true;

      return current.map((row) => {
        if (row.packageId === packageId) {
          return { ...row, featured: nextFeatured };
        }

        if (nextFeatured && (row.categoryName ?? "") === category) {
          return { ...row, featured: false };
        }

        return row;
      });
    });
    setMessage("");
  }

  function removeRow(packageId) {
    setRows((current) => current.filter((row) => row.packageId !== packageId));
    setMessage("");
  }

  async function saveCards() {
    const invalid = rows.map(bonusError).find(Boolean);

    if (invalid) {
      setError(invalid);
      setMessage("");
      return;
    }

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
        body: JSON.stringify({ cards: cardsPayload(rows) }),
      });
      const payload = await readApiJson(response);

      if (!response.ok) {
        throw new Error(payload.error ?? "Impossible d’enregistrer les cartes.");
      }

      setRows(Array.isArray(payload.products) ? payload.products : []);
      setCatalogError(typeof payload.catalogError === "string" ? payload.catalogError : "");
      setUpdatedAt(payload.updatedAt ?? null);
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
            <p>Le badge public affiche « Meilleure vente ». Une seule carte par catégorie, ou aucune.</p>
            <p>Le bonus n’est pas calculé. Coche « Afficher un bonus » et saisis le pourcentage seulement si tu veux le montrer.</p>
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
          {rows.map((row) => {
            const price = formatPrice(row.price, row.currency);

            return (
              <li className={`${styles.row} ${row.featured ? styles.rowFeatured : ""}`} key={row.packageId}>
                <div className={styles.identity}>
                  <strong>{row.name}</strong>
                  <span>{[row.categoryName, price].filter(Boolean).join(" · ")}</span>
                  <small>ID Tebex {row.packageId}{row.packageIdent ? ` · ${row.packageIdent}` : ""}</small>
                  {row.missing ? <em className={styles.missing}>Absent du catalogue actuel</em> : null}
                </div>

                <label className={styles.check}>
                  <input
                    checked={row.featured === true}
                    onChange={() => toggleFeatured(row.packageId)}
                    type="checkbox"
                  />
                  <span>Meilleure vente</span>
                </label>

                <div className={styles.bonus}>
                  <label className={styles.check}>
                    <input
                      checked={row.bonusEnabled === true}
                      onChange={(event) => updateRow(row.packageId, { bonusEnabled: event.target.checked })}
                      type="checkbox"
                    />
                    <span>Afficher un bonus</span>
                  </label>
                  <label className={styles.percent}>
                    <input
                      aria-label={`Pourcentage de bonus pour ${row.name}`}
                      disabled={!row.bonusEnabled}
                      inputMode="numeric"
                      max={BONUS_PERCENT_MAX}
                      min={BONUS_PERCENT_MIN}
                      onChange={(event) => {
                        const value = event.target.value;

                        if (value === "") {
                          updateRow(row.packageId, { bonusPercent: "" });
                          return;
                        }

                        if (!/^\d{1,3}$/.test(value)) {
                          return;
                        }

                        updateRow(row.packageId, { bonusPercent: Number(value) });
                      }}
                      step={1}
                      type="number"
                      value={row.bonusPercent}
                    />
                    <span>{row.bonusEnabled && Number.isInteger(row.bonusPercent) ? formatBonusLabel(row.bonusPercent) : "%"}</span>
                  </label>
                  {row.missing ? (
                    <button className={styles.removeButton} onClick={() => removeRow(row.packageId)} type="button">
                      Retirer
                    </button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
