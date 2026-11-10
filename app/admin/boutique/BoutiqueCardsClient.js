"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { readApiJson } from "@/lib/admin/read-api-json";
import { cardCategoryKey, emptySubscriptionPerks, formatBonusLabel } from "@/lib/boutique/card-display";
import { SUBSCRIPTION_GRADES } from "@/lib/boutique/subscriptions";
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

function cardsPayload(rows, perks) {
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
    subscriptionPerks: perks,
  };
}

function newPerk() {
  const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : String(Date.now());

  return { id: `ligne-${id}`, kind: "check", text: "" };
}

export default function BoutiqueCardsClient() {
  const { user, getIdToken, loading: authLoading } = useAuth();
  const [rows, setRows] = useState([]);
  const [perks, setPerks] = useState(emptySubscriptionPerks);
  const [coupon, setCoupon] = useState("");
  const [catalogError, setCatalogError] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const applyPayload = useCallback((payload) => {
    setRows(Array.isArray(payload.products) ? payload.products : []);
    setPerks({
      ...emptySubscriptionPerks(),
      ...(payload.cardDisplay?.subscriptionPerks ?? {}),
    });
    setCoupon(typeof payload.firstMonthCoupon === "string" ? payload.firstMonthCoupon : "");
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

  function updatePerk(grade, index, partial) {
    setPerks((current) => ({
      ...current,
      [grade]: current[grade].map((row, rowIndex) => (rowIndex === index ? { ...row, ...partial } : row)),
    }));
    setMessage("");
  }

  function movePerk(grade, index, direction) {
    setPerks((current) => {
      const nextIndex = index + direction;
      const rowsForGrade = [...(current[grade] ?? [])];

      if (nextIndex < 0 || nextIndex >= rowsForGrade.length) {
        return current;
      }

      const [item] = rowsForGrade.splice(index, 1);
      rowsForGrade.splice(nextIndex, 0, item);
      return { ...current, [grade]: rowsForGrade };
    });
    setMessage("");
  }

  function addPerk(grade) {
    setPerks((current) => ({
      ...current,
      [grade]: [...(current[grade] ?? []), newPerk()],
    }));
    setMessage("");
  }

  function removePerk(grade, index) {
    setPerks((current) => ({
      ...current,
      [grade]: current[grade].filter((_, rowIndex) => rowIndex !== index),
    }));
    setMessage("");
  }

  async function saveCards() {
    const emptyPerk = SUBSCRIPTION_GRADES.map((grade) => perks[grade.key] ?? []).flat().find((row) => !row.text.trim());

    if (emptyPerk) {
      setError("Chaque ligne d’avantage doit avoir un texte.");
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
        body: JSON.stringify({
          cards: cardsPayload(rows, perks),
          firstMonthCoupon: coupon.trim(),
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
            <p>Le code promo du premier mois reste sur le serveur. Il n’est pas calculé dans le petit texte : écris « 7,49 € le 1er mois » toi-même si tu veux l’afficher.</p>
            {updatedAt ? <p>Dernier enregistrement : {formatDate(updatedAt)}.</p> : null}
          </div>
        </div>
        <button className={styles.saveButton} disabled={loading || saving || !loaded} onClick={saveCards} type="button">
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>

      <label className={styles.couponField}>
        <span>Code promo 1er mois</span>
        <input
          autoComplete="off"
          maxLength={64}
          onChange={(event) => {
            setCoupon(event.target.value);
            setMessage("");
          }}
          spellCheck={false}
          value={coupon}
        />
        <small>Laisser vide pour n’appliquer aucun code. Utilisé seulement quand un abonnement mensuel est ajouté au panier.</small>
      </label>

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

      <section className={styles.perks}>
        <div>
          <h2>Avantages du tableau</h2>
          <p>Une liste par grade, la même pour Mensuel, 3 mois et 12 mois. Coche, croix, ou texte libre comme « 35 props » ou « Bientôt ».</p>
        </div>
        <div className={styles.perkColumns}>
          {SUBSCRIPTION_GRADES.map((grade) => (
            <div className={styles.perkColumn} key={grade.key}>
              <h3>{grade.label}</h3>
              <ul>
                {(perks[grade.key] ?? []).map((perk, index) => (
                  <li key={perk.id}>
                    <select
                      aria-label={`Type de ligne ${index + 1} pour ${grade.label}`}
                      onChange={(event) => updatePerk(grade.key, index, { kind: event.target.value })}
                      value={perk.kind}
                    >
                      <option value="check">Coche</option>
                      <option value="cross">Croix</option>
                      <option value="text">Texte</option>
                    </select>
                    <input
                      aria-label={`Texte de la ligne ${index + 1} pour ${grade.label}`}
                      maxLength={160}
                      onChange={(event) => updatePerk(grade.key, index, { text: event.target.value })}
                      value={perk.text}
                    />
                    <div className={styles.perkActions}>
                      <button aria-label="Monter" disabled={index === 0} onClick={() => movePerk(grade.key, index, -1)} type="button">↑</button>
                      <button
                        aria-label="Descendre"
                        disabled={index === perks[grade.key].length - 1}
                        onClick={() => movePerk(grade.key, index, 1)}
                        type="button"
                      >
                        ↓
                      </button>
                      <button aria-label="Supprimer" onClick={() => removePerk(grade.key, index)} type="button">×</button>
                    </div>
                  </li>
                ))}
              </ul>
              <button className={styles.removeButton} onClick={() => addPerk(grade.key)} type="button">
                Ajouter une ligne
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
