"use client";

import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { CODE_PENAL_DOC_PATH } from "@/lib/code-penal/constants";
import { getFallbackCodePenal } from "@/lib/code-penal/fallback";
import { getLosAngelesSections, normalizePenalJurisdictions } from "@/lib/code-penal/normalize";
import { getFirebaseDb } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config";

function mapCodePenalData(data) {
  const jurisdictions = normalizePenalJurisdictions(data?.jurisdictions, data?.sections);

  return {
    jurisdictions,
    sections: getLosAngelesSections(jurisdictions),
    updatedAt: data?.updatedAt ?? null,
    updatedBy: data?.updatedBy ?? null,
    updatedByEmail: data?.updatedByEmail ?? null,
    source: "firestore",
  };
}

export async function fetchCodePenal() {
  if (!isFirebaseConfigured()) {
    return getFallbackCodePenal();
  }

  const db = getFirebaseDb();

  if (!db) {
    return getFallbackCodePenal();
  }

  const snapshot = await getDoc(doc(db, ...CODE_PENAL_DOC_PATH));

  if (!snapshot.exists()) {
    return getFallbackCodePenal();
  }

  return mapCodePenalData(snapshot.data());
}

export function subscribeCodePenal(onData, onError) {
  if (!isFirebaseConfigured()) {
    return () => {};
  }

  const db = getFirebaseDb();

  if (!db) {
    return () => {};
  }

  return onSnapshot(
    doc(db, ...CODE_PENAL_DOC_PATH),
    (snapshot) => {
      if (snapshot.exists()) {
        onData(mapCodePenalData(snapshot.data()));
      }
    },
    (error) => {
      onError?.(error);
    },
  );
}
