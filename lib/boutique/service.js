"use client";

import { doc, onSnapshot } from "firebase/firestore";
import { BOUTIQUE_DOC_PATH } from "@/lib/boutique/constants";
import { getFirebaseDb } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config";

export function subscribeBoutique(onData, onError) {
  if (!isFirebaseConfigured()) {
    onData({ enabled: false });
    return () => {};
  }

  const db = getFirebaseDb();

  if (!db) {
    onData({ enabled: false });
    return () => {};
  }

  return onSnapshot(
    doc(db, ...BOUTIQUE_DOC_PATH),
    (snapshot) => {
      onData({ enabled: snapshot.exists() ? snapshot.data()?.enabled === true : false });
    },
    (error) => {
      onError?.(error);
      onData({ enabled: false });
    },
  );
}

export function isBoutiqueHref(href) {
  return typeof href === "string" && (href === "/boutique" || href.startsWith("/boutique?") || href.startsWith("/boutique#"));
}
