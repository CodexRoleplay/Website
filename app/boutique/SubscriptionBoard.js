"use client";

import { asPackageId } from "@/lib/boutique/card-display";
import {
  SUBSCRIPTION_GRADES,
  SUBSCRIPTION_TERMS,
  columnOffer,
  subscriptionTotalCaption,
} from "@/lib/boutique/subscriptions";
import styles from "./shop.module.css";

function formatPrice(value, currency = "EUR") {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
  }).format(Number(value ?? 0));
}

function PerkLine({ perk }) {
  if (perk.kind === "check") {
    return (
      <li>
        <span aria-hidden="true" className={styles.perkMark}>✓</span>
        <span>{perk.text}</span>
      </li>
    );
  }

  if (perk.kind === "cross") {
    return (
      <li>
        <span aria-hidden="true" className={`${styles.perkMark} ${styles.perkCross}`}>✗</span>
        <span>{perk.text}</span>
      </li>
    );
  }

  return (
    <li>
      <span>{perk.text}</span>
    </li>
  );
}

export default function SubscriptionBoard({
  slots,
  highlights,
  perks,
  term,
  onTerm,
  isBusy,
  signedIn,
  onSubscribe,
  onGift,
  onDetail,
}) {
  return (
    <div className={styles.gradeBoard}>
      <p className={styles.cancelNote}>*Annulable à tout moment</p>
      <div aria-label="Durée de l’abonnement" className={styles.termSwitch} role="tablist">
        {SUBSCRIPTION_TERMS.map((item) => (
          <button
            aria-selected={term === item.key}
            className={term === item.key ? styles.termActive : ""}
            key={item.key}
            onClick={() => onTerm(item.key)}
            role="tab"
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className={styles.gradeGrid}>
        {SUBSCRIPTION_GRADES.map((grade) => {
          const offer = columnOffer(slots, term, grade.key);
          const product = offer.product;
          const productId = product ? asPackageId(product.id) : "";
          const banner = productId ? highlights.bannerById.get(productId) ?? "" : "";
          const badge = productId ? highlights.badgeById.get(productId) ?? "" : "";
          const priceNote = productId ? highlights.priceNoteById.get(productId) ?? "" : "";
          const total = product ? Number(product.base_price ?? product.total_price ?? 0) : 0;
          const currency = product?.currency || "EUR";
          const caption = subscriptionTotalCaption(offer.months);
          const lines = Array.isArray(perks?.[grade.key]) ? perks[grade.key] : [];

          return (
            <article className={styles.gradeColumn} key={grade.key}>
              {banner ? <span className={styles.gradeBanner}>{banner}</span> : null}
              <h3>{grade.label}</h3>
              {badge ? <span className={styles.bonusPill}>{badge}</span> : null}
              {product ? (
                <p className={styles.gradePrice}>
                  <strong>
                    {offer.months > 1 ? `${formatPrice(total / offer.months, currency)}/mois` : formatPrice(total, currency)}
                  </strong>
                  {caption ? <span>soit {formatPrice(total, currency)} {caption}</span> : null}
                  {priceNote ? <small className={styles.priceNote}>{priceNote}</small> : null}
                </p>
              ) : (
                <p className={styles.gradeMissing}>Cette durée n’est pas en ligne.</p>
              )}
              {lines.length ? (
                <ul className={styles.perkList}>
                  {lines.map((perk) => (
                    <PerkLine key={perk.id} perk={perk} />
                  ))}
                </ul>
              ) : null}
              {product ? (
                <div className={styles.productActions}>
                  <button disabled={isBusy} onClick={() => onSubscribe(product)} type="button">
                    {signedIn ? "S'abonner" : "Connexion requise"}
                  </button>
                  <button className={styles.giftLink} disabled={isBusy} onClick={() => onGift(product)} type="button">
                    Offrir
                  </button>
                  <button className={styles.detailLink} onClick={() => onDetail(product)} type="button">
                    Voir le détail
                  </button>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}
