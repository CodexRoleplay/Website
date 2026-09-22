"use client";

import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { FAQ_DOC_PATH } from "@/lib/faq/constants";
import { normalizeFaqCategories } from "@/lib/faq/normalize";
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

function emptyFaq() {
  return {
    categories: [],
    updatedAt: null,
    updatedBy: null,
    updatedByEmail: null,
    source: "empty",
  };
}

export async function fetchFaq() {
  if (!isFirebaseConfigured()) {
    return emptyFaq();
  }

  const db = getFirebaseDb();

  if (!db) {
    return emptyFaq();
  }

  const snapshot = await getDoc(doc(db, ...FAQ_DOC_PATH));
  return snapshot.exists() ? mapFaqData(snapshot.data()) : emptyFaq();
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
      onData(snapshot.exists() ? mapFaqData(snapshot.data()) : emptyFaq());
    },
    (error) => {
      onError?.(error);
    },
  );
}
