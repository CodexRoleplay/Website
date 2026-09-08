"use client";

import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { FAQ_DOC_PATH } from "@/lib/faq/constants";
import { getFallbackFaq, normalizeFaqCategories } from "@/lib/faq/fallback";
import { getFirebaseDb } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config";

function mapFaqData(data) {
  return {
    categories: normalizeFaqCategories(data?.categories),
    updatedAt: data?.updatedAt ?? null,
    updatedBy: data?.updatedBy ?? null,
    updatedByEmail: data?.updatedByEmail ?? null,
    source: "firestore",
  };
}

export async function fetchFaq() {
  if (!isFirebaseConfigured()) {
    return getFallbackFaq();
  }

  const db = getFirebaseDb();

  if (!db) {
    return getFallbackFaq();
  }

  const snapshot = await getDoc(doc(db, ...FAQ_DOC_PATH));
  return snapshot.exists() ? mapFaqData(snapshot.data()) : getFallbackFaq();
}

export function subscribeFaq(onData, onError) {
  if (!isFirebaseConfigured()) {
    return () => {};
  }

  const db = getFirebaseDb();

  if (!db) {
    return () => {};
  }

  return onSnapshot(
    doc(db, ...FAQ_DOC_PATH),
    (snapshot) => {
      if (snapshot.exists()) {
        onData(mapFaqData(snapshot.data()));
      }
    },
    (error) => {
      onError?.(error);
    },
  );
}
