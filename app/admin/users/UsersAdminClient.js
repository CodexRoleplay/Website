"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { readApiJson } from "@/lib/admin/read-api-json";
import adminStyles from "@/components/admin/admin.module.css";
import styles from "./users-admin.module.css";

function formatDate(value) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function UsersAdminClient() {
  const { user, getIdToken, loading: authLoading } = useAuth();
  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingUid, setDeletingUid] = useState(null);
  const [passwordUid, setPasswordUid] = useState(null);
  const [nextPassword, setNextPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [savingPasswordUid, setSavingPasswordUid] = useState(null);
  const [error, setError] = useState("");
  const [setupRequired, setSetupRequired] = useState(false);
  const [adminStatus, setAdminStatus] = useState(null);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetch("/api/admin/status")
      .then((response) => readApiJson(response))
      .then((status) => {
        setAdminStatus(status);

        if (!status.configured || !status.initOk) {
          setSetupRequired(true);
        }
      })
      .catch(() => {});
  }, []);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    setSetupRequired(false);

    try {
      const token = await getIdToken();

      if (!token) {
        throw new Error("Session expirée. Reconnecte-toi.");
      }

      const response = await fetch("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const payload = await readApiJson(response);

      if (!response.ok) {
        if (response.status === 503) {
          setSetupRequired(true);
        }

        throw new Error(payload.error ?? "Impossible de charger les accès.");
      }

      setUsers(payload.users ?? []);
    } catch (loadError) {
      setError(loadError.message);

      if (loadError.message.includes("HTML")) {
        setSetupRequired(true);
      }
    } finally {
      setLoading(false);
    }
  }, [getIdToken]);

  useEffect(() => {
    if (authLoading || !user) {
      return;
    }

    loadUsers();
  }, [loadUsers, authLoading, user]);

  async function handleCreate(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const token = await getIdToken();

      if (!token) {
        throw new Error("Session expirée. Reconnecte-toi.");
      }

      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const payload = await readApiJson(response);

      if (!response.ok) {
        if (response.status === 503) {
          setSetupRequired(true);
        }

        throw new Error(payload.error ?? "Création impossible.");
      }

      setUsers((current) => [payload.user, ...current]);
      setEmail("");
      setPassword("");
      setSuccess(`Accès créé pour ${payload.user.email}.`);
    } catch (createError) {
      setError(createError.message);
    } finally {
      setSubmitting(false);
    }
  }

  function openPasswordForm(targetUid) {
    setPasswordUid((current) => (current === targetUid ? null : targetUid));
    setNextPassword("");
    setConfirmPassword("");
    setPasswordError("");
  }

  async function handlePasswordSave(event, targetUid, targetEmail) {
    event.preventDefault();
    setPasswordError("");
    setError("");
    setSuccess("");

    if (!nextPassword || !confirmPassword) {
      setPasswordError("Le mot de passe ne peut pas être vide.");
      return;
    }

    if (nextPassword.length < 8) {
      setPasswordError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    if (nextPassword !== confirmPassword) {
      setPasswordError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setSavingPasswordUid(targetUid);

    try {
      const token = await getIdToken();

      if (!token) {
        throw new Error("Session expirée. Reconnecte-toi.");
      }

      const response = await fetch(`/api/admin/users/${targetUid}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: nextPassword,
          passwordConfirm: confirmPassword,
        }),
      });
      const payload = await readApiJson(response);

      if (!response.ok) {
        throw new Error(payload.error ?? "Impossible de modifier le mot de passe.");
      }

      setNextPassword("");
      setConfirmPassword("");
      setPasswordUid(null);
      setSuccess(`Mot de passe mis à jour pour ${targetEmail}.`);
    } catch (passwordSaveError) {
      setPasswordError(passwordSaveError.message);
    } finally {
      setSavingPasswordUid(null);
    }
  }

  async function handleDelete(targetUid) {
    if (!window.confirm("Supprimer cet accès ? Le compte d'authentification et les données Firestore de cette personne seront effacés.")) {
      return;
    }

    setDeletingUid(targetUid);
    setError("");
    setSuccess("");

    try {
      const token = await getIdToken();

      if (!token) {
        throw new Error("Session expirée. Reconnecte-toi.");
      }

      const response = await fetch(`/api/admin/users/${targetUid}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const payload = await readApiJson(response);

      if (!response.ok) {
        throw new Error(payload.error ?? "Suppression impossible.");
      }

      setUsers((current) => current.filter((entry) => entry.uid !== targetUid));

      if (passwordUid === targetUid) {
        setPasswordUid(null);
        setNextPassword("");
        setConfirmPassword("");
        setPasswordError("");
      }

      setSuccess(payload.message ?? "Compte supprimé. L'authentification et les données Firestore de cette personne ont été effacées.");
    } catch (deleteError) {
      setError(deleteError.message);
    } finally {
      setDeletingUid(null);
    }
  }

  return (
    <>
      <header className={adminStyles.pageHeader}>
        <h1>Accès admin</h1>
        <p>Créez des comptes Firebase email / mot de passe autorisés à gérer le panel.</p>
      </header>

      {setupRequired ? (
        <section className={styles.setupBox}>
          <h2>Configuration Vercel requise</h2>
          <p>Ajoute ces variables dans Vercel → Settings → Environment Variables, puis redéploie.</p>
          <ul className={styles.setupList}>
            <li>
              <code>FIREBASE_ADMIN_CLIENT_EMAIL</code>
              {adminStatus?.hasClientEmail ? " ✓" : " ✗ manquant"}
            </li>
            <li>
              <code>FIREBASE_ADMIN_PRIVATE_KEY</code>
              {adminStatus?.hasPrivateKey ? " ✓" : " ✗ manquant"}
            </li>
          </ul>
          {adminStatus?.initError ? <p className={styles.setupHint}>{adminStatus.initError}</p> : null}
          <ol>
            <li>
              <a
                href="https://console.firebase.google.com/project/codex-rp/settings/serviceaccounts/adminsdk"
                rel="noreferrer"
                target="_blank"
              >
                Télécharge la clé JSON Firebase
              </a>
            </li>
            <li>
              Copie <code>client_email</code> → <code>FIREBASE_ADMIN_CLIENT_EMAIL</code>
            </li>
            <li>
              Copie <code>private_key</code> → <code>FIREBASE_ADMIN_PRIVATE_KEY</code> (garde les{" "}
              <code>\n</code> dans la valeur)
            </li>
            <li>Redeploy sur Vercel, puis Actualiser ici.</li>
          </ol>
          <p className={styles.setupHint}>
            Test direct : ouvre <code>/api/admin/status</code> sur ton site — tu dois voir du JSON, pas une
            page HTML.
          </p>
        </section>
      ) : null}

      <div className={styles.layout}>
        <section className={`${adminStyles.card} ${styles.formCard}`}>
          <h2>Nouvel accès</h2>
          <form className={adminStyles.form} onSubmit={handleCreate}>
            <div className={adminStyles.field}>
              <label htmlFor="admin-email">Email</label>
              <input
                autoComplete="username"
                id="admin-email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@codex-rp.fr"
                required
                type="email"
                value={email}
              />
            </div>

            <div className={adminStyles.field}>
              <label htmlFor="admin-password">Mot de passe</label>
              <input
                autoComplete="new-password"
                id="admin-password"
                minLength={8}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Minimum 8 caractères"
                required
                type="password"
                value={password}
              />
            </div>

            <button className={adminStyles.secondaryButton} disabled={submitting} type="submit">
              {submitting ? "Création…" : "Créer l'accès"}
            </button>
          </form>
        </section>

        <section className={`${adminStyles.card} ${styles.listCard}`}>
          <div className={styles.listHeader}>
            <h2>Comptes autorisés</h2>
            <button className={adminStyles.ghostButton} onClick={loadUsers} type="button">
              Actualiser
            </button>
          </div>

          {error ? <p className={adminStyles.errorBox}>{error}</p> : null}
          {success ? <p className={styles.successBox}>{success}</p> : null}

          {loading ? (
            <p className={styles.emptyState}>Chargement des accès…</p>
          ) : users.length === 0 ? (
            <p className={styles.emptyState}>Aucun accès admin pour le moment.</p>
          ) : (
            <ul className={styles.userList}>
              {users.map((entry) => {
                const isSelf = entry.uid === user?.uid;

                return (
                  <li className={styles.userItem} key={entry.uid}>
                    <div className={styles.userRow}>
                      <div className={styles.userMeta}>
                        <strong>{entry.email}</strong>
                        <span>{formatDate(entry.createdAt)}</span>
                        {isSelf ? <span className={styles.selfBadge}>Vous</span> : null}
                      </div>

                      <div className={styles.userActions}>
                        <button
                          className={styles.passwordButton}
                          onClick={() => openPasswordForm(entry.uid)}
                          type="button"
                        >
                          Mot de passe
                        </button>
                        <button
                          className={styles.deleteButton}
                          disabled={isSelf || deletingUid === entry.uid}
                          onClick={() => handleDelete(entry.uid)}
                          type="button"
                        >
                          {deletingUid === entry.uid ? "Suppression…" : "Supprimer"}
                        </button>
                      </div>
                    </div>

                    {passwordUid === entry.uid ? (
                      <form
                        className={styles.passwordForm}
                        noValidate
                        onSubmit={(event) => handlePasswordSave(event, entry.uid, entry.email)}
                      >
                        <div className={styles.passwordFields}>
                          <div className={adminStyles.field}>
                            <label htmlFor={`new-password-${entry.uid}`}>Nouveau mot de passe</label>
                            <input
                              autoComplete="new-password"
                              id={`new-password-${entry.uid}`}
                              onChange={(event) => setNextPassword(event.target.value)}
                              placeholder="Minimum 8 caractères"
                              type="password"
                              value={nextPassword}
                            />
                          </div>
                          <div className={adminStyles.field}>
                            <label htmlFor={`confirm-password-${entry.uid}`}>Confirmation</label>
                            <input
                              autoComplete="new-password"
                              id={`confirm-password-${entry.uid}`}
                              onChange={(event) => setConfirmPassword(event.target.value)}
                              placeholder="Saisis le même mot de passe"
                              type="password"
                              value={confirmPassword}
                            />
                          </div>
                        </div>
                        {passwordError ? <p className={styles.passwordError}>{passwordError}</p> : null}
                        <button
                          className={adminStyles.secondaryButton}
                          disabled={savingPasswordUid === entry.uid}
                          type="submit"
                        >
                          {savingPasswordUid === entry.uid ? "Enregistrement…" : "Enregistrer"}
                        </button>
                      </form>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
