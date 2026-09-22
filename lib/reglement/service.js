"use client";

import { doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { REGLEMENT_DOC_PATH } from "./constants";
import { normalizeCategories } from "./content";

function emptyReglement() {
  return {
    categories: [],
    updatedAt: null,
    updatedBy: null,
    updatedByEmail: null,
    source: "empty",
  };
}

export async function fetchReglement() {
  if (!isFirebaseConfigured()) {
    return emptyReglement();
  }

  const db = getFirebaseDb();

  if (!db) {
    return emptyReglement();
  }

  const snapshot = await getDoc(doc(db, ...REGLEMENT_DOC_PATH));

  if (!snapshot.exists()) {
    return emptyReglement();
  }

  const data = snapshot.data();

  return {
    categories: normalizeCategories(data.categories),
    updatedAt: data.updatedAt ?? null,
    updatedBy: data.updatedBy ?? null,
    updatedByEmail: data.updatedByEmail ?? null,
    source: "firestore",
  };
}

export function subscribeReglement(onData, onError) {
  if (!isFirebaseConfigured()) {
    return () => {};
  }

  const db = getFirebaseDb();

  if (!db) {
    return () => {};
  }

  return onSnapshot(
    doc(db, ...REGLEMENT_DOC_PATH),
    (snapshot) => {
      if (!snapshot.exists()) {
        onData(emptyReglement());
        return;
      }

      const data = snapshot.data();

      onData({
        categories: normalizeCategories(data.categories),
        updatedAt: data.updatedAt ?? null,
        updatedBy: data.updatedBy ?? null,
        updatedByEmail: data.updatedByEmail ?? null,
        source: "firestore",
      });
    },
    (error) => {
      onError?.(error);
    },
  );
}

export async function saveReglement(categories) {
  const db = getFirebaseDb();

  if (!db) {
    throw new Error("Firebase n'est pas configuré.");
  }

  await setDoc(
    doc(db, ...REGLEMENT_DOC_PATH),
    {
      categories: normalizeCategories(categories),
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );
}
