"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { readApiJson } from "@/lib/admin/read-api-json";
import { MAX_PERKS } from "@/lib/boutique/card-display";
import { SUBSCRIPTION_GRADES } from "@/lib/boutique/subscriptions";
import { SubscriptionPerkTable } from "@/app/boutique/SubscriptionBoard";
import styles from "../boutique-admin.module.css";

function formatDate(value) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function emptyCell(kind = "check") {
  return { kind, text: "" };
}

function newPerk() {
  const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : String(Date.now());

  return {
    id: `ligne-${id}`,
    label: "",
    pacific: emptyCell(),
    penthouse: emptyCell(),
    belair: emptyCell(),
  };
}

function perkCell(row, grade) {
  const cell = row?.[grade];
  if (!cell || typeof cell !== "object") {
    return emptyCell();
  }

  return {
    kind: cell.kind === "cross" || cell.kind === "text" || cell.kind === "check" ? cell.kind : "check",
    text: typeof cell.text === "string" ? cell.text : "",
  };
}

export default function BoutiqueSubscriptionsClient() {
  const { user, getIdToken, loading: authLoading } = useAuth();
  const [perks, setPerks] = useState([]);
  const [coupon, setCoupon] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);

  const applyPayload = useCallback((payload) => {
    const nextPerks = payload.cardDisplay?.subscriptionPerks;
    setPerks(Array.isArray(nextPerks) ? nextPerks : []);
    setCoupon(typeof payload.firstMonthCoupon === "string" ? payload.firstMonthCoupon : "");
    setUpdatedAt(payload.updatedAt ?? null);
  }, []);

  const loadSubscriptions = useCallback(async () => {
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
        throw new Error(payload.error ?? "Impossible de charger les abonnements.");
      }

      applyPayload(payload);
      setLoaded(true);
    } catch (loadError) {
      setError(loadError.message ?? "Impossible de charger les abonnements.");
    } finally {
      setLoading(false);
    }
  }, [applyPayload, authLoading, getIdToken, user]);

  useEffect(() => {
    loadSubscriptions();
  }, [loadSubscriptions]);

  function updateLabel(index, label) {
    setPerks((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, label } : row)));
    setMessage("");
  }

  function updateCell(index, grade, partial) {
    setPerks((current) => current.map((row, rowIndex) => {
      if (rowIndex !== index) {
        return row;
      }

      return {
        ...row,
        [grade]: { ...perkCell(row, grade), ...partial },
      };
    }));
    setMessage("");
  }

  function movePerk(fromIndex, toIndex) {
    setPerks((current) => {
      if (fromIndex === toIndex || fromIndex == null || toIndex == null || fromIndex < 0 || toIndex < 0 || fromIndex >= current.length || toIndex >= current.length) {
        return current;
      }

      const rows = [...current];
      const [item] = rows.splice(fromIndex, 1);
      rows.splice(toIndex, 0, item);
      return rows;
    });
    setMessage("");
  }

  function addPerk() {
    setPerks((current) => (current.length >= MAX_PERKS ? current : [...current, newPerk()]));
    setMessage("");
  }

  function removePerk(index) {
    setPerks((current) => current.filter((_, rowIndex) => rowIndex !== index));
    setMessage("");
  }

  async function saveSubscriptions() {
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
          scope: "subscriptions",
          cards: { subscriptionPerks: perks },
          firstMonthCoupon: coupon.trim(),
        }),
      });
      const payload = await readApiJson(response);

      if (!response.ok) {
        throw new Error(payload.error ?? "Impossible d’enregistrer les abonnements.");
      }

      applyPayload(payload);
      setMessage("Abonnements enregistrés. La boutique publique affiche ce tableau au prochain chargement.");
    } catch (saveError) {
      setError(saveError.message ?? "Impossible d’enregistrer les abonnements.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.editor}>
      <div className={styles.toolbar}>
        <div>
          <h2>Tableau comparatif</h2>
          <div className={styles.help}>
            {updatedAt ? <p>Dernier enregistrement : {formatDate(updatedAt)}.</p> : null}
          </div>
        </div>
        <button className={styles.saveButton} disabled={loading || saving || !loaded} onClick={saveSubscriptions} type="button">
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
        <small>Laisser vide pour n’appliquer aucun code. Il part avec le panier d’un abonnement mensuel. Pour écrire « 7,49 € le 1er mois » sous le prix, fais-le dans Cartes.</small>
      </label>

      {error ? <p className={styles.error}>{error}</p> : null}
      {message ? <p className={styles.success} role="status">{message}</p> : null}
      {loading ? <p className={styles.empty}>Chargement des avantages…</p> : null}

      <section aria-label="Lignes d’avantages" className={styles.perks}>
        {!loading && !perks.length ? <p>Aucune ligne pour le moment. Ajoute le premier avantage.</p> : null}
        <ul className={styles.perkRows}>
          {perks.map((perk, index) => {
            const lineName = perk.label.trim() || `la ligne ${index + 1}`;

            return (
              <li
                className={`${styles.perkRow} ${dragIndex === index ? styles.perkRowDragging : ""} ${overIndex === index && dragIndex !== index ? styles.perkRowOver : ""}`}
                key={perk.id}
                onDragOver={(event) => {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "move";
                  setOverIndex(index);
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  movePerk(dragIndex, index);
                  setDragIndex(null);
                  setOverIndex(null);
                }}
              >
                <div className={styles.perkRowHead}>
                  <button
                    aria-label={`Déplacer ${lineName}. Flèches haut et bas pour changer la position.`}
                    className={styles.perkDrag}
                    draggable
                    onDragEnd={() => {
                      setDragIndex(null);
                      setOverIndex(null);
                    }}
                    onDragStart={(event) => {
                      setDragIndex(index);
                      event.dataTransfer.effectAllowed = "move";
                      event.dataTransfer.setData("text/plain", perk.id);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "ArrowUp") {
                        event.preventDefault();
                        movePerk(index, index - 1);
                      }
                      if (event.key === "ArrowDown") {
                        event.preventDefault();
                        movePerk(index, index + 1);
                      }
                    }}
                    type="button"
                  >
                    ⋮⋮
                  </button>
                  <label className={styles.perkLabel}>
                    <span>Libellé</span>
                    <input
                      aria-label={`Libellé de la ligne ${index + 1}`}
                      maxLength={160}
                      onChange={(event) => updateLabel(index, event.target.value)}
                      placeholder="Argent toutes les 10 min"
                      value={perk.label}
                    />
                  </label>
                  <div className={styles.perkActions}>
                    <button aria-label={`Supprimer ${lineName}`} onClick={() => removePerk(index)} type="button">
                      Supprimer
                    </button>
                  </div>
                </div>
                <div className={styles.perkGrades}>
                  {SUBSCRIPTION_GRADES.map((grade) => {
                    const cell = perkCell(perk, grade.key);

                    return (
                      <div className={styles.perkGrade} key={grade.key}>
                        <span>{grade.label}</span>
                        <select
                          aria-label={`${grade.label} pour ${lineName}`}
                          onChange={(event) => updateCell(index, grade.key, { kind: event.target.value })}
                          value={cell.kind}
                        >
                          <option value="check">Coche</option>
                          <option value="cross">Croix</option>
                          <option value="text">Texte</option>
                        </select>
                        {cell.kind === "text" ? (
                          <input
                            aria-label={`Texte ${grade.label} pour ${lineName}`}
                            maxLength={160}
                            onChange={(event) => updateCell(index, grade.key, { text: event.target.value })}
                            placeholder="50, Illimité…"
                            value={cell.text}
                          />
                        ) : (
                          <p className={styles.perkKindHint}>{cell.kind === "check" ? "Affiche une coche." : "Affiche une croix."}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </li>
            );
          })}
        </ul>
        <button className={`${styles.removeButton} ${styles.addPerk}`} disabled={loading || !loaded || perks.length >= MAX_PERKS} onClick={addPerk} type="button">
          Ajouter une ligne
        </button>
      </section>

      <section aria-label="Aperçu sur la boutique" className={styles.preview}>
        <div>
          <h2>Aperçu sur la boutique</h2>
          <p>Le tableau se met à jour pendant la saisie. Une ligne sans libellé reste masquée, comme sur le site.</p>
        </div>
        {perks.some((row) => String(row.label ?? "").trim()) ? (
          <SubscriptionPerkTable perks={perks} />
        ) : (
          <p>Aucune ligne visible pour le moment.</p>
        )}
      </section>
    </div>
  );
}
