"use client";

import { doc, onSnapshot } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { prepareLoreDocument } from "@/lib/lore/content";
import { LORE_DOC_PATH } from "./constants";

export function subscribeLore(onData, onError) {
  if (!isFirebaseConfigured()) {
    return () => {};
  }

  const db = getFirebaseDb();

  if (!db) {
    return () => {};
  }

  return onSnapshot(
    doc(db, ...LORE_DOC_PATH),
    (snapshot) => {
      if (!snapshot.exists()) {
        onData({
          ...prepareLoreDocument({ title: "", blocks: [] }),
          updatedAt: null,
          updatedBy: null,
          updatedByEmail: null,
        });
        return;
      }

      const data = snapshot.data();
      onData({
        ...prepareLoreDocument({
          title: data.title,
          blocks: data.blocks,
        }),
        updatedAt: data.updatedAt ?? null,
        updatedBy: data.updatedBy ?? null,
        updatedByEmail: data.updatedByEmail ?? null,
      });
    },
    (error) => {
      onError?.(error);
    },
  );
}
