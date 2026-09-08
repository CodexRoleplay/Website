"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import styles from "./login.module.css";

function formatAuthError(message) {
  if (!message) {
    return "";
  }

  if (message.includes("auth/unauthorized-domain")) {
    return "Ce domaine n'est pas autorisé dans Firebase. Ajoute ton URL Vercel dans Authentication → Authorized domains.";
  }

  if (message.includes("auth/invalid-credential") || message.includes("auth/wrong-password")) {
    return "Email ou mot de passe incorrect.";
  }

  if (message.includes("auth/popup-closed-by-user")) {
    return "Connexion Google annulée.";
  }

  if (message.includes("auth/popup-blocked")) {
    return "La popup Google a été bloquée. Autorise les popups pour ce site.";
  }

  return message.replace(/^Firebase:\s*/i, "").replace(/\s*\(auth\/[^)]+\)\.?\s*$/, ".");
}

export default function AdminLoginPage() {
  const { loginWithEmail, loginWithGoogle, error } = useAuth();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(
    searchParams.get("error") === "unauthorized"
      ? "Ce compte n'a pas les droits administrateur."
      : "",
  );

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setFormError("");

    try {
      await loginWithEmail(email, password);
    } catch (loginError) {
      setFormError(formatAuthError(loginError.message));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleLogin() {
    setSubmitting(true);
    setFormError("");

    try {
      await loginWithGoogle();
    } catch (loginError) {
      setFormError(formatAuthError(loginError.message));
    } finally {
      setSubmitting(false);
    }
  }

  const displayError = formError || formatAuthError(error);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <img className={styles.logo} src="/img/logo_other.webp" alt="Codex RP" />
          <span>Panel admin</span>
        </div>

        <p className={styles.lead}>Connecte-toi pour gérer le règlement et le contenu du site.</p>

        {displayError ? <div className={styles.errorBox}>{displayError}</div> : null}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input
              autoComplete="email"
              id="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@codex-rp.fr"
              required
              type="email"
              value={email}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password">Mot de passe</label>
            <input
              autoComplete="current-password"
              id="password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              required
              type="password"
              value={password}
            />
          </div>

          <button className={styles.submitButton} disabled={submitting} type="submit">
            {submitting ? "Connexion…" : "Se connecter"}
          </button>
        </form>

        <div className={styles.divider}>ou</div>

        <button className={styles.googleButton} disabled={submitting} onClick={handleGoogleLogin} type="button">
          <span className={styles.googleIcon} aria-hidden="true">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          </span>
          Continuer avec Gmail
        </button>

        <Link className={styles.backLink} href="/">
          Retour au site
        </Link>
      </div>
    </div>
  );
}
