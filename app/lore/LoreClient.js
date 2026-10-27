"use client";

import { useEffect, useState } from "react";
import ContentBlocks from "@/components/reglement/ContentBlocks";
import { LORE_DISCLAIMER } from "@/lib/lore/constants";
import { formatLoreUpdatedAt } from "@/lib/lore/format";
import { subscribeLore } from "@/lib/lore/service";
import shell from "../reglement/reglement.module.css";
import styles from "./lore.module.css";

export default function LoreClient({ initialLore }) {
  const [lore, setLore] = useState(initialLore);
  const updatedLabel = formatLoreUpdatedAt(lore?.updatedAt);
  const blocks = Array.isArray(lore?.blocks) ? lore.blocks : [];

  useEffect(() => {
    return subscribeLore((payload) => {
      setLore((current) => ({
        ...current,
        ...payload,
      }));
    });
  }, []);

  return (
    <section className={shell.ruleShell}>
      <div className={shell.background} aria-hidden="true">
        <div />
      </div>

      <div className={styles.layout}>
        <p className={styles.disclaimer}>{LORE_DISCLAIMER}</p>

        <header className={shell.hero}>
          <p className={shell.breadcrumb}>
            <span>Serveur</span>
            <span>Lore actuel</span>
          </p>
          <h1>{lore?.title || "Lore actuel"}</h1>
          {updatedLabel ? (
            <p className={styles.updated}>
              Dernière mise à jour : <time dateTime={lore.updatedAt}>{updatedLabel}</time>
            </p>
          ) : null}
        </header>

        {blocks.length > 0 ? (
          <ContentBlocks blocks={blocks} prose />
        ) : (
          <p className={styles.empty}>
            Rien n&apos;a encore été publié ici. Les histoires en cours apparaîtront dès qu&apos;elles seront
            enregistrées.
          </p>
        )}
      </div>
    </section>
  );
}
