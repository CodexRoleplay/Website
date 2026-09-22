"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import CxModal from "@/components/CxModal";
import { subscribeBoutique } from "@/lib/boutique/service";

const BoutiqueContext = createContext(null);

export function BoutiqueProvider({ children }) {
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  const [soonOpen, setSoonOpen] = useState(false);

  useEffect(() => {
    return subscribeBoutique(
      (payload) => {
        setEnabled(payload.enabled);
        setReady(true);
      },
      () => {
        setEnabled(false);
        setReady(true);
      },
    );
  }, []);

  const value = useMemo(
    () => ({
      enabled,
      ready,
      openSoon: () => setSoonOpen(true),
      closeSoon: () => setSoonOpen(false),
    }),
    [enabled, ready],
  );

  return (
    <BoutiqueContext.Provider value={value}>
      {children}
      <CxModal
        closeLabel="Fermer"
        eyebrow="Boutique"
        onClose={() => setSoonOpen(false)}
        open={soonOpen}
        title="Bientôt disponible"
      >
        <p>
          La boutique n&apos;est pas encore ouverte. Le catalogue sera prêt très prochainement :
          abonnements, packs Codyx et paiement sécurisé.
        </p>
      </CxModal>
    </BoutiqueContext.Provider>
  );
}

export function useBoutique() {
  const context = useContext(BoutiqueContext);

  if (!context) {
    throw new Error("useBoutique doit être utilisé dans BoutiqueProvider.");
  }

  return context;
}
