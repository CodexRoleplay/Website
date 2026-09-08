"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config";

const AuthContext = createContext(null);
const ADMIN_SESSION_CACHE_KEY = "codex-admin-auth";

function readCachedAdminUid() {
  try {
    const cached = window.sessionStorage.getItem(ADMIN_SESSION_CACHE_KEY);
    return cached ? JSON.parse(cached)?.uid ?? null : null;
  } catch {
    return null;
  }
}

function writeCachedAdminUid(uid) {
  try {
    if (uid) {
      window.sessionStorage.setItem(ADMIN_SESSION_CACHE_KEY, JSON.stringify({ uid }));
    } else {
      window.sessionStorage.removeItem(ADMIN_SESSION_CACHE_KEY);
    }
  } catch {}
}

async function checkIsAdmin(user) {
  if (!user) {
    return false;
  }

  const db = getFirebaseDb();

  if (!db) {
    return false;
  }

  const snapshot = await getDoc(doc(db, "admins", user.uid));
  return snapshot.exists();
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setLoading(false);
      setError("Firebase n'est pas configuré.");
      return;
    }

    const auth = getFirebaseAuth();

    if (!auth) {
      setLoading(false);
      setError("Impossible d'initialiser Firebase Auth.");
      return;
    }

    return onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);

      if (!nextUser) {
        setIsAdmin(false);
        writeCachedAdminUid(null);
        setLoading(false);
        return;
      }

      const cachedAdminUid = readCachedAdminUid();

      if (cachedAdminUid === nextUser.uid) {
        setIsAdmin(true);
        setLoading(false);
      }

      try {
        const nextIsAdmin = await checkIsAdmin(nextUser);
        setIsAdmin(nextIsAdmin);
        writeCachedAdminUid(nextIsAdmin ? nextUser.uid : null);
      } catch (authError) {
        setError(authError.message);
        setIsAdmin(false);
        writeCachedAdminUid(null);
      } finally {
        setLoading(false);
      }
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAdmin,
      loading,
      error,
      async loginWithEmail(email, password) {
        const auth = getFirebaseAuth();
        setError(null);
        await signInWithEmailAndPassword(auth, email, password);
      },
      async loginWithGoogle() {
        const auth = getFirebaseAuth();
        setError(null);
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: "select_account" });
        await signInWithPopup(auth, provider);
      },
      async logout() {
        const auth = getFirebaseAuth();
        writeCachedAdminUid(null);
        await signOut(auth);
      },
      async getIdToken(forceRefresh = false) {
        if (!user) {
          return null;
        }

        return user.getIdToken(forceRefresh);
      },
    }),
    [user, isAdmin, loading, error],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth doit être utilisé dans AuthProvider.");
  }

  return context;
}
