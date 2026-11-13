"use client";

import { Fragment, useState } from "react";
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

function splitBonusCopy(label) {
  const text = String(label ?? "").trim();
  const match = text.match(/^(.*?)(\s+de\s+bonus\b[\s\S]*)$/i);

  if (!match || !match[1].trim()) {
    return { lead: text, suffix: "" };
  }

  return {
    lead: match[1].trim(),
    suffix: match[2].trim(),
  };
}

function SignedCopy({ value, className }) {
  const chunks = String(value ?? "").split("+");

  return (
    <span className={className}>
      {chunks.map((chunk, index) => (
        <Fragment key={`${index}-${chunk}`}>
          {index > 0 ? (
            <>
              <svg aria-hidden="true" className={styles.bonusSign} viewBox="0 0 12 12">
                <path d="M5 0h2v12H5zM0 5h12v2H0" />
              </svg>
              <span className={styles.bonusPlusText}>+</span>
            </>
          ) : null}
          {index > 0 ? chunk.replace(/^\s+/, "") : chunk}
        </Fragment>
      ))}
    </span>
  );
}

export function BonusPill({ label }) {
  const { lead, suffix } = splitBonusCopy(label);

  return (
    <span className={suffix ? `${styles.bonusPill} ${styles.bonusPillSplit}` : styles.bonusPill}>
      {lead ? <SignedCopy className={suffix ? styles.bonusLead : styles.bonusPillText} value={lead} /> : null}
      {suffix ? <SignedCopy className={styles.bonusSuffix} value={suffix} /> : null}
    </span>
  );
}

export function GiftMark() {
  return (
    <svg aria-hidden="true" className={styles.giftIcon} viewBox="0 0 24 24">
      <rect x="3" y="8" width="18" height="4" />
      <path d="M12 8v13" />
      <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
      <path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8" />
      <path d="M16.5 8a2.5 2.5 0 0 0 0-5C13 3 12 8 12 8" />
    </svg>
  );
}

function visiblePerkRows(perks) {
  if (!Array.isArray(perks)) {
    return [];
  }

  return perks.filter((row) => String(row?.label ?? "").trim());
}

function packageImageSrc(product) {
  const image = product?.image;

  if (typeof image === "string") {
    const value = image.trim();
    return value && value !== "null" && value !== "undefined" ? value : "";
  }

  if (image && typeof image === "object") {
    const nested = [image.url, image.src, image.thumbnail].find(
      (item) => typeof item === "string" && item.trim(),
    );
    return nested ? nested.trim() : "";
  }

  return "";
}

function GradeMedia({ src, banner, termLabel, title }) {
  const [failedSrc, setFailedSrc] = useState("");
  const showImage = Boolean(src) && failedSrc !== src;

  return (
    <div className={styles.gradeMedia}>
      {showImage ? (
        <img
          alt=""
          className={styles.gradeMediaImage}
          decoding="async"
          loading="lazy"
          onError={() => setFailedSrc(src)}
          src={src}
        />
      ) : null}
      {banner ? <span className={styles.gradeRibbon}>{banner}</span> : null}
      <div className={styles.gradeMediaTitle}>
        {termLabel ? <span>{termLabel}</span> : null}
        <h3>{title}</h3>
      </div>
    </div>
  );
}

export function SubscriptionPerkTable({ perks, grades = SUBSCRIPTION_GRADES }) {
  const perkRows = visiblePerkRows(perks);

  if (!perkRows.length) {
    return null;
  }

  return (
    <table className={styles.perkCompare}>
      <caption>Avantages selon le grade</caption>
      <thead>
        <tr>
          <th scope="col">Avantage</th>
          {grades.map((grade) => (
            <th key={grade.key} scope="col">{grade.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {perkRows.map((row) => (
          <tr key={row.id}>
            <th scope="row">{row.label}</th>
            {grades.map((grade) => (
              <td key={grade.key}>
                <span className={styles.perkCellLabel}>{grade.label}</span>
                <PerkValue cell={row[grade.key]} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function PerkValue({ cell }) {
  if (cell?.kind === "check") {
    return (
      <span aria-label="Inclus" className={styles.perkMark} role="img">
        ✓
      </span>
    );
  }

  if (cell?.kind === "cross") {
    return (
      <span aria-label="Non inclus" className={`${styles.perkMark} ${styles.perkCross}`} role="img">
        ✗
      </span>
    );
  }

  const text = String(cell?.text ?? "").trim();
  return text ? <span>{text}</span> : null;
}

export default function SubscriptionBoard({
  slots,
  highlights,
  perks,
  grades = SUBSCRIPTION_GRADES,
  term,
  onTerm,
  isBusy,
  signedIn,
  onSubscribe,
  onGift,
  onDetail,
  firstMonthOffer = null,
}) {
  const promoCode = String(firstMonthOffer?.code ?? "").trim();
  const promoPercent = Number.isInteger(firstMonthOffer?.percent) ? firstMonthOffer.percent : 25;

  return (
    <div className={styles.gradeBoard}>
      <div className={styles.gradeHeader}>
        {promoCode ? (
          <p className={styles.promoNote}>
            <span className={styles.promoLead}>
              <strong>-{promoPercent} %</strong> le 1er mois
            </span>
            <strong className={styles.promoCode}>{promoCode}</strong>
          </p>
        ) : null}
        <p className={styles.cancelNote}>*Annulable à tout moment</p>
      </div>
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
        {grades.map((grade) => {
          const offer = columnOffer(slots, term, grade.key);
          const product = offer.product;
          const productId = product ? asPackageId(product.id) : "";
          const banner = productId ? highlights.bannerById.get(productId) ?? "" : "";
          const badge = productId ? highlights.badgeById.get(productId) ?? "" : "";
          const priceNote = productId ? highlights.priceNoteById.get(productId) ?? "" : "";
          const total = product ? Number(product.base_price ?? product.total_price ?? 0) : 0;
          const currency = product?.currency || "EUR";
          const caption = subscriptionTotalCaption(offer.months);
          const termLabel = grade.key === "belair" && term === "year"
            ? "6 mois"
            : SUBSCRIPTION_TERMS.find((item) => item.key === term)?.label ?? "";
          const imageSrc = packageImageSrc(product);

          return (
            <article className={banner ? `${styles.gradeColumn} ${styles.gradeFeatured}` : styles.gradeColumn} key={grade.key}>
              <GradeMedia banner={banner} src={imageSrc} termLabel={termLabel} title={grade.label} />
              <div className={styles.gradeBody}>
                {product ? (
                  <div className={styles.gradePrice}>
                    {badge ? <BonusPill label={badge} /> : null}
                    <strong>
                      {offer.months > 1 ? (
                        <>
                          {formatPrice(total / offer.months, currency)}
                          <small>/mois</small>
                        </>
                      ) : (
                        formatPrice(total, currency)
                      )}
                    </strong>
                    {caption ? <span>soit {formatPrice(total, currency)} {caption}</span> : null}
                    {priceNote ? <span className={styles.gradeNote}>{priceNote}</span> : null}
                  </div>
                ) : (
                  <p className={styles.gradeMissing}>Cette durée n’est pas en ligne.</p>
                )}
                {product ? (
                  <div className={styles.gradeActions}>
                    <button className={styles.gradeSubscribe} disabled={isBusy} onClick={() => onSubscribe(product)} type="button">
                      {signedIn ? "S'abonner" : "Connexion requise"}
                    </button>
                    <div className={styles.gradeSecondary}>
                      <button className={styles.gradeGift} disabled={isBusy} onClick={() => onGift(product)} type="button">
                        <GiftMark />
                        Offrir
                      </button>
                      <button className={styles.gradeDetail} onClick={() => onDetail(product)} type="button">
                        Voir le détail
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
      <SubscriptionPerkTable grades={grades} perks={perks} />
    </div>
  );
}
