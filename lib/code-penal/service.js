"use client";

import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { CODE_PENAL_DOC_PATH } from "@/lib/code-penal/constants";
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

function emptyCodePenal() {
  return {
    jurisdictions: [],
    sections: [],
    updatedAt: null,
    updatedBy: null,
    updatedByEmail: null,
    source: "empty",
  };
}

export async function fetchCodePenal() {
  if (!isFirebaseConfigured()) {
    return emptyCodePenal();
  }

  const db = getFirebaseDb();

  if (!db) {
    return emptyCodePenal();
  }

  const snapshot = await getDoc(doc(db, ...CODE_PENAL_DOC_PATH));

  if (!snapshot.exists()) {
    return emptyCodePenal();
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
      onData(snapshot.exists() ? mapCodePenalData(snapshot.data()) : emptyCodePenal());
    },
    (error) => {
      onError?.(error);
    },
  );
}
