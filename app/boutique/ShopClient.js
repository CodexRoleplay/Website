"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Script from "next/script";
import { useSearchParams } from "next/navigation";
import { asPackageId, resolveCardHighlights } from "@/lib/boutique/card-display";
import { SUBSCRIPTION_TERMS, buildSubscriptionBoard, isMonthlySubscriptionPackage, isSubscriptionCategory, subscriptionGradeFromName, subscriptionTermFromName } from "@/lib/boutique/subscriptions";
import { normalizeShopSlug as normalizeSlug } from "@/lib/boutique/shop-links";
import styles from "./shop.module.css";
import SubscriptionBoard, { BonusPill, GiftMark } from "./SubscriptionBoard";

const TEBEX_LEGAL_LINKS = [
  { label: "Impressum", href: "https://checkout.tebex.io/impressum" },
  { label: "Terms & Conditions", href: "https://checkout.tebex.io/terms" },
  { label: "Privacy Policy", href: "https://checkout.tebex.io/privacy" },
];
const BASKET_STORAGE_KEY = "codex-rp-tebex-basket";
const DISCORD_STORAGE_KEY = "codex-rp-tebex-discord";
const DISCORD_PENDING_KEY = "codex-rp-discord-pending";
const SCROLL_STORAGE_KEY = "codex-rp-shop-scroll";
const PENDING_PACKAGE_KEY = "codex-rp-shop-pending-package";
const DISCORD_ID_PATTERN = /^\d{17,20}$/;
const GIFT_DISCORD_MESSAGE =
  "Connecte d’abord Discord avec le bouton Discord en bas de la boutique. On ne demande pas le Discord du destinataire.";
let tebexCheckoutBound = false;

function readDiscordAccount() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(DISCORD_STORAGE_KEY) || "");
    const id = String(parsed?.id ?? "");

    if (!DISCORD_ID_PATTERN.test(id)) {
      return null;
    }

    const name = String(parsed?.name ?? "").trim().slice(0, 64);

    return { id, name: name || "Discord" };
  } catch {
    return null;
  }
}

function storeDiscordAccount(account) {
  window.localStorage.setItem(
    DISCORD_STORAGE_KEY,
    JSON.stringify({ id: account.id, name: account.name || "Discord" }),
  );
}

function discordAccountFromSearch(params, pending) {
  const explicitId = ["discord_id", "discordId"]
    .map((key) => String(params.get(key) ?? "").trim())
    .find((value) => DISCORD_ID_PATTERN.test(value));
  const returnedId =
    explicitId ||
    ((pending || params.get("auth") === "discord") && DISCORD_ID_PATTERN.test(String(params.get("id") ?? "").trim())
      ? String(params.get("id")).trim()
      : "");

  if (!returnedId) {
    return null;
  }

  const name = ["username", "ign", "discord_tag", "discord_username"]
    .map((key) => String(params.get(key) ?? "").trim())
    .find(Boolean);

  return { id: returnedId, name: (name || "Discord").slice(0, 64) };
}

function boutiqueReturnPath(authValue) {
  const params = new URLSearchParams(window.location.search);
  ["payment", "discord_id", "discordId", "id", "username", "ign", "discord_tag", "discord_username"].forEach((key) => {
    params.delete(key);
  });
  params.set("auth", authValue);

  return `/boutique?${params.toString()}`;
}

async function apiRequest(path, options) {
  const response = await fetch(path, options);
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(payload?.error || "Une erreur est survenue avec Tebex.");
    error.code = typeof payload?.code === "string" ? payload.code : "";
    throw error;
  }

  return payload;
}

function rememberShopReturn(pendingPackage) {
  window.sessionStorage.setItem(SCROLL_STORAGE_KEY, String(Math.round(window.scrollY)));

  if (pendingPackage?.id) {
    window.sessionStorage.setItem(
      PENDING_PACKAGE_KEY,
      JSON.stringify({
        id: pendingPackage.id,
        ident: pendingPackage.ident ?? "",
        targetUsername: pendingPackage.targetUsername ?? "",
        applyMonthlyCoupon: pendingPackage.applyMonthlyCoupon === true,
      }),
    );
    return;
  }

  window.sessionStorage.removeItem(PENDING_PACKAGE_KEY);
}

function forgetShopReturn() {
  window.sessionStorage.removeItem(SCROLL_STORAGE_KEY);
  window.sessionStorage.removeItem(PENDING_PACKAGE_KEY);
}

function consumePendingPackage() {
  const raw = window.sessionStorage.getItem(PENDING_PACKAGE_KEY);

  if (!raw) {
    return null;
  }

  window.sessionStorage.removeItem(PENDING_PACKAGE_KEY);

  try {
    const parsed = JSON.parse(raw);

    if (parsed?.id) {
      return {
        id: parsed.id,
        ident: typeof parsed.ident === "string" ? parsed.ident : "",
        targetUsername: typeof parsed.targetUsername === "string" ? parsed.targetUsername : "",
        applyMonthlyCoupon: parsed.applyMonthlyCoupon === true,
      };
    }
  } catch {
    if (/^\d+$/.test(raw)) {
      return { id: Number(raw), ident: "" };
    }
  }

  return null;
}

function restoreShopScroll() {
  const raw = window.sessionStorage.getItem(SCROLL_STORAGE_KEY);

  if (raw === null) {
    return;
  }

  window.sessionStorage.removeItem(SCROLL_STORAGE_KEY);
  const top = Number(raw);

  if (!Number.isFinite(top) || top < 0) {
    return;
  }

  const applyScroll = () => {
    window.dispatchEvent(new CustomEvent("codex:scroll-y", { detail: { top } }));
  };

  applyScroll();
  window.setTimeout(applyScroll, 80);
}

async function addPackageRequest(ident, product) {
  return apiRequest(`/api/tebex/baskets/${ident}/packages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      packageId: product.id,
      packageIdent: product.ident ?? "",
      discordId: readDiscordAccount()?.id ?? "",
      targetUsername: product.targetUsername ?? "",
      applyMonthlyCoupon: product.applyMonthlyCoupon === true,
    }),
  });
}

function purchasePayload(product, targetUsername = "") {
  return {
    id: product.id,
    ident: product.ident ?? "",
    name: product.name ?? "",
    type: product.type ?? "",
    targetUsername,
    applyMonthlyCoupon: isMonthlySubscriptionPackage(product),
  };
}

function formatPrice(value, currency = "EUR") {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
  }).format(Number(value ?? 0));
}

function cleanDescription(value = "") {
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/[^\S\n]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function categoryMatchesTarget(category, target) {
  if (!target) {
    return false;
  }

  const targetSlug = normalizeSlug(target);
  const categorySlug = normalizeSlug(category.name);

  return (
    targetSlug === String(category.id) ||
    targetSlug === categorySlug ||
    targetSlug === categorySlug.replace(/^packs-/, "pack-") ||
    targetSlug === categorySlug.replace(/s$/, "")
  );
}

function getInitialCategoryId(categories, target) {
  return (
    categories.find((category) => categoryMatchesTarget(category, target))?.id ??
    categories.find((category) => category.packages.length)?.id ??
    categories[0]?.id ??
    null
  );
}

function decodeDescriptionText(value = "") {
  return cleanDescription(value)
    .replace(/&eacute;/g, "e")
    .replace(/&egrave;/g, "e")
    .replace(/&agrave;/g, "a")
    .replace(/&ccedil;/g, "c");
}

function hideCalculatedBonusNote(value) {
  return String(value ?? "")
    .replace(/bonus\s+calcul[ée][^.]*(?:\.|$)/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function productKindLabel(product) {
  if (product?.type !== "subscription") {
    return "Achat unique";
  }

  const term = subscriptionTermFromName(product?.name);
  const known = SUBSCRIPTION_TERMS.find((item) => item.key === term);

  if (known) {
    return known.label;
  }

  if (term === "half") {
    return "6 mois";
  }

  return "Abonnement";
}

function getCategoryDescriptionBlocks(value = "") {
  const html = String(value);
  const paragraphMatches = [...html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)];
  const paragraphs = paragraphMatches.length ? paragraphMatches.map((match) => match[1]) : [html];

  return paragraphs
    .map((paragraph) => {
      const strongMatch = paragraph.match(/<strong\b[^>]*>([\s\S]*?)<\/strong>/i);
      const lead = strongMatch ? decodeDescriptionText(strongMatch[1]) : "";
      const text = decodeDescriptionText(strongMatch ? paragraph.replace(strongMatch[0], "") : paragraph);

      return {
        lead: hideCalculatedBonusNote(lead),
        text: hideCalculatedBonusNote(text),
      };
    })
    .filter((block) => block.lead || block.text);
}

function CategoryDescription({ description }) {
  const blocks = getCategoryDescriptionBlocks(description);

  if (!blocks.length) {
    return <p>Choisissez un produit Tebex pour commencer.</p>;
  }

  return (
    <div className={styles.categoryDescription}>
      {blocks.map((block, index) => (
        <p key={`${block.lead}-${index}`}>
          {block.lead ? <strong>{block.lead}</strong> : null}
          {block.text ? <span>{block.text}</span> : null}
        </p>
      ))}
    </div>
  );
}

function basketPackageDetails(item, catalogPrice = 0) {
  const product = item.package ?? item;
  const basketPrice =
    item.in_basket?.price ??
    item.base_price ??
    product.base_price ??
    item.price ??
    product.price ??
    item.total_price ??
    product.total_price ??
    0;

  return {
    id: product.id ?? item.package_id ?? null,
    name: product.name ?? item.name ?? "Produit Tebex",
    quantity: Number(item.in_basket?.quantity ?? item.qty ?? item.quantity ?? 1),
    price: Number(basketPrice) > 0 ? basketPrice : catalogPrice,
  };
}

function Icon({ name }) {
  if (name === "cart") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 4h2l2.4 10.2a2 2 0 0 0 2 1.5h7.7a2 2 0 0 0 1.9-1.4L21 7H7" />
        <circle cx="10" cy="20" r="1" />
        <circle cx="18" cy="20" r="1" />
      </svg>
    );
  }

  if (name === "user") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </svg>
    );
  }

  if (name === "discord") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7.2 8.4c3.1-1.2 6.5-1.2 9.6 0" />
        <path d="M8.4 16.8 7.2 19S4.2 18 3.2 16.2c0-.8-.4-6.4 2.4-8.3 1.2-.8 3.2-1.2 3.2-1.2l.8 1.6" />
        <path d="m15.6 16.8 1.2 2.2s3-1 4-2.8c0-.8.4-6.4-2.4-8.3-1.2-.8-3.2-1.2-3.2-1.2l-.8 1.6" />
        <path d="M9.2 14.2a.9.9 0 1 0 0-1.8.9.9 0 0 0 0 1.8Zm5.6 0a.9.9 0 1 0 0-1.8.9.9 0 0 0 0 1.8Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 5h16v14H4zM8 9h8M8 13h5" />
    </svg>
  );
}

export default function ShopClient({ initialCategories, catalogError, cardDisplay = null }) {
  const searchParams = useSearchParams();
  const targetedCategory = searchParams.get("categorie") ?? searchParams.get("category") ?? "";
  const categories = useMemo(
    () => initialCategories.filter((category) => Array.isArray(category.packages)),
    [initialCategories],
  );
  const catalogPrices = useMemo(
    () =>
      new Map(
        categories.flatMap((category) =>
          category.packages.map((product) => [String(product.id), product.base_price ?? product.total_price ?? 0]),
        ),
      ),
    [categories],
  );
  const catalogProducts = useMemo(
    () =>
      new Map(
        categories.flatMap((category) =>
          category.packages.map((product) => [String(product.id), product]),
        ),
      ),
    [categories],
  );
  const cardHighlights = useMemo(
    () =>
      resolveCardHighlights(
        categories.flatMap((category) =>
          category.packages.map((product) => ({
            id: product.id,
            ident: product.ident,
            categoryName: category.name,
          })),
        ),
        cardDisplay,
      ),
    [cardDisplay, categories],
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState(() =>
    getInitialCategoryId(categories, targetedCategory),
  );
  const [basket, setBasket] = useState(null);
  const [discordAccount, setDiscordAccount] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [portalTarget, setPortalTarget] = useState(null);
  const [subscriptionTerm, setSubscriptionTerm] = useState("monthly");
  const [giftProduct, setGiftProduct] = useState(null);
  const [giftName, setGiftName] = useState("");
  const [giftError, setGiftError] = useState("");
  const [detailProduct, setDetailProduct] = useState(null);
  const initializedRef = useRef(false);
  const cartCloseRef = useRef(null);
  const checkoutFrameRef = useRef(null);
  const renderedCheckoutRef = useRef("");
  const onCheckoutPaidRef = useRef(async () => {});
  const onCheckoutNoticeRef = useRef(() => {});

  const selectedCategory =
    categories.find((category) => category.id === selectedCategoryId) ?? categories[0] ?? null;
  const subscriptionView = useMemo(() => {
    if (!isSubscriptionCategory(selectedCategory)) {
      return null;
    }

    const board = buildSubscriptionBoard(selectedCategory?.packages ?? []);
    return board.matched > 0 ? board : null;
  }, [selectedCategory]);
  const basketItems = Array.isArray(basket?.packages) ? basket.packages : [];
  const basketCount = basketItems.reduce(
    (total, item) => total + basketPackageDetails(item).quantity,
    0,
  );

  function storeBasket(nextBasket) {
    setBasket(nextBasket);

    if (nextBasket?.ident) {
      window.localStorage.setItem(BASKET_STORAGE_KEY, nextBasket.ident);
    }

    return nextBasket;
  }

  function selectCategory(category) {
    setSelectedCategoryId(category.id);

    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set("categorie", normalizeSlug(category.name));
    nextUrl.hash = "catalogue";
    window.history.replaceState(null, "", nextUrl);
  }

  async function createBasket() {
    const nextBasket = await apiRequest("/api/tebex/baskets", { method: "POST" });
    return storeBasket(nextBasket);
  }

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }

    initializedRef.current = true;
    const pendingPackage = consumePendingPackage();

    async function restoreBasket() {
      setIsBusy(true);

      try {
        const savedIdent = window.localStorage.getItem(BASKET_STORAGE_KEY);
        const params = new URLSearchParams(window.location.search);
        const pendingDiscord = window.sessionStorage.getItem(DISCORD_PENDING_KEY) === "1";
        const returnedDiscord = discordAccountFromSearch(params, pendingDiscord);

        if (pendingDiscord) {
          window.sessionStorage.removeItem(DISCORD_PENDING_KEY);
        }

        if (returnedDiscord) {
          storeDiscordAccount(returnedDiscord);
          setDiscordAccount(returnedDiscord);
        } else {
          setDiscordAccount(readDiscordAccount());
        }

        if (params.get("payment") === "success") {
          setMessage("Paiement terminé. Merci pour votre achat !");
        } else if (params.get("payment") === "cancelled") {
          setMessage("Paiement annulé. Votre panier reste disponible.");
        } else if (pendingDiscord) {
          setMessage(
            returnedDiscord
              ? "Compte Discord connecté."
              : "La connexion Discord n'a pas abouti. Réessayez.",
          );
        }

        let activeBasket = null;

        if (savedIdent) {
          try {
            const restoredBasket = await apiRequest(`/api/tebex/baskets/${savedIdent}`);

            if (!restoredBasket.complete) {
              activeBasket = storeBasket(restoredBasket);
            }
          } catch {
            window.localStorage.removeItem(BASKET_STORAGE_KEY);
          }
        }

        if (!activeBasket) {
          activeBasket = await createBasket();
        }

        if (pendingPackage?.id && activeBasket?.username) {
          try {
            const updatedBasket = await addPackageRequest(activeBasket.ident, pendingPackage);
            storeBasket(updatedBasket);
            setIsCartOpen(true);
            setMessage("Produit ajouté au panier.");
          } catch (error) {
            setMessage(error.message);
          }
        }

        restoreShopScroll();

        if (params.get("auth") === "complete" || params.get("auth") === "discord" || returnedDiscord || pendingDiscord) {
          params.delete("auth");

          if (returnedDiscord || pendingDiscord) {
            ["discord_id", "discordId", "id", "username", "ign", "discord_tag", "discord_username"].forEach((key) => {
              params.delete(key);
            });
          }

          const query = params.toString();
          const hash = window.location.hash;
          window.history.replaceState(
            null,
            "",
            `${window.location.pathname}${query ? `?${query}` : ""}${hash}`,
          );
        }
      } catch (error) {
        setMessage(error.message);
        restoreShopScroll();
      } finally {
        setIsBusy(false);
      }
    }

    restoreBasket();
  }, []);

  useEffect(() => {
    if (!targetedCategory) {
      return;
    }

    const nextCategoryId = categories.find((category) => categoryMatchesTarget(category, targetedCategory))?.id;

    if (!nextCategoryId) {
      return;
    }

    setSelectedCategoryId((current) => (current === nextCategoryId ? current : nextCategoryId));
  }, [categories, targetedCategory]);

  useEffect(() => {
    setPortalTarget(document.body);
  }, []);

  useEffect(() => {
    if (!isCartOpen) {
      return undefined;
    }

    const previouslyFocused = document.activeElement;
    const focusFrame = window.requestAnimationFrame(() => cartCloseRef.current?.focus());

    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setIsCartOpen(false);
      }
    };

    window.dispatchEvent(new Event("codex:lenis-stop"));
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.removeEventListener("keydown", closeOnEscape);
      window.dispatchEvent(new Event("codex:lenis-start"));

      if (previouslyFocused instanceof HTMLElement) {
        previouslyFocused.focus();
      }
    };
  }, [isCartOpen]);

  async function connectFiveM(pendingPackage = null) {
    setIsBusy(true);
    setMessage("");
    let remembered = false;

    try {
      const activeBasket = basket?.ident ? basket : await createBasket();
      const returnPath = boutiqueReturnPath("complete");
      const authLinks = await apiRequest(
        `/api/tebex/baskets/${activeBasket.ident}/auth?returnPath=${encodeURIComponent(returnPath)}`,
      );
      const providers = Array.isArray(authLinks) ? authLinks : [authLinks];
      const provider = providers.find((item) => item?.name?.toLowerCase().includes("fivem")) ?? providers[0];

      if (!provider?.url) {
        throw new Error("Tebex n'a retourné aucun lien de connexion FiveM.");
      }

      rememberShopReturn(pendingPackage);
      remembered = true;
      window.location.assign(provider.url);
    } catch (error) {
      if (remembered) {
        forgetShopReturn();
      }

      setMessage(error.message);
      setIsBusy(false);
    }
  }

  function connectDiscord(pendingPackage = null) {
    setIsBusy(true);
    setMessage(pendingPackage ? "Connectez votre compte Discord pour ajouter ce produit." : "");
    rememberShopReturn(pendingPackage);
    window.sessionStorage.setItem(DISCORD_PENDING_KEY, "1");
    const returnUrl = `${window.location.origin}${boutiqueReturnPath("discord")}`;
    window.location.assign(`https://ident.tebex.io/discord/?return=${encodeURIComponent(returnUrl)}`);
  }

  function disconnectDiscord() {
    window.localStorage.removeItem(DISCORD_STORAGE_KEY);
    setDiscordAccount(null);
    setMessage("Compte Discord déconnecté.");
  }

  async function disconnectFiveM() {
    setIsBusy(true);
    setMessage("");

    try {
      window.localStorage.removeItem(BASKET_STORAGE_KEY);
      await createBasket();
      setMessage("Compte FiveM déconnecté et panier réinitialisé.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsBusy(false);
    }
  }

  async function addProduct(product, targetUsername = "") {
    const payload = purchasePayload(product, targetUsername);

    if (targetUsername && !readDiscordAccount()?.id) {
      setMessage(GIFT_DISCORD_MESSAGE);
      if (discordAccount?.id) {
        setGiftError(GIFT_DISCORD_MESSAGE);
      }
      return;
    }

    if (!basket?.username) {
      setMessage("Connectez votre compte FiveM avant d'ajouter un produit.");
      await connectFiveM(payload);
      return;
    }

    setIsBusy(true);
    setMessage("");

    try {
      const updatedBasket = await addPackageRequest(basket.ident, payload);
      storeBasket(updatedBasket);
      setIsCartOpen(true);
      setGiftProduct(null);
      setMessage(updatedBasket.notice || "Produit ajouté au panier.");
    } catch (error) {
      if (error.code === "discord_required" && !targetUsername) {
        connectDiscord(payload);
        return;
      }

      if (targetUsername || giftProduct) {
        setGiftError(error.code === "discord_required" ? error.message || GIFT_DISCORD_MESSAGE : error.message);
      }

      setMessage(error.code === "discord_required" ? error.message || GIFT_DISCORD_MESSAGE : error.message);
    } finally {
      setIsBusy(false);
    }
  }

  function openGift(product) {
    setGiftProduct(product);
    setGiftName("");
    setGiftError("");
  }

  function submitGift(event) {
    event.preventDefault();
    const name = giftName.trim();

    if (!/^[A-Za-z0-9][A-Za-z0-9_.-]{1,31}$/.test(name) || DISCORD_ID_PATTERN.test(name)) {
      setGiftError("Indique le pseudo du joueur à qui offrir.");
      return;
    }

    if (!readDiscordAccount()?.id) {
      setMessage(GIFT_DISCORD_MESSAGE);
      return;
    }

    addProduct(giftProduct, name);
  }

  async function removeProduct(packageId) {
    if (!basket?.ident || !packageId) {
      return;
    }

    setIsBusy(true);

    try {
      const updatedBasket = await apiRequest(`/api/tebex/baskets/${basket.ident}/packages`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId }),
      });
      storeBasket(updatedBasket);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsBusy(false);
    }
  }

  async function updateProductQuantity(packageId, quantity) {
    if (!basket?.ident || !packageId || quantity < 1) {
      return;
    }

    setIsBusy(true);
    setMessage("");

    try {
      const updatedBasket = await apiRequest(`/api/tebex/baskets/${basket.ident}/packages`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId, quantity }),
      });
      storeBasket(updatedBasket);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsBusy(false);
    }
  }

  onCheckoutPaidRef.current = async () => {
    window.localStorage.removeItem(BASKET_STORAGE_KEY);
    setIsCartOpen(false);
    setIsCheckoutOpen(false);
    setMessage("Paiement terminé. Merci pour votre achat !");

    try {
      await createBasket();
    } catch (error) {
      setBasket(null);
      setMessage(error.message);
    }
  };
  onCheckoutNoticeRef.current = setMessage;

  function ensureTebexCheckoutEvents() {
    if (tebexCheckoutBound || !window.Tebex?.checkout?.on) {
      return;
    }

    tebexCheckoutBound = true;
    window.Tebex.checkout.on("open", () => {
      window.dispatchEvent(new Event("codex:lenis-stop"));
    });
    window.Tebex.checkout.on("close", () => {
      window.dispatchEvent(new Event("codex:lenis-start"));
      setIsCheckoutOpen(false);
    });
    window.Tebex.checkout.on("payment:complete", () => {
      onCheckoutPaidRef.current();
    });
    window.Tebex.checkout.on("payment:error", () => {
      onCheckoutNoticeRef.current("Le paiement n'a pas abouti. Vous pouvez réessayer.");
    });
  }

  function checkout() {
    if (!basket?.username) {
      setMessage("Connectez votre compte FiveM avant le paiement.");
      return;
    }

    if (!basketItems.length || !basket?.ident) {
      setMessage("Votre panier est vide.");
      return;
    }

    if (!window.Tebex?.checkout) {
      setMessage("Le paiement Tebex se charge. Réessayez dans un instant.");
      return;
    }

    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  }

  useEffect(() => {
    if (!isCheckoutOpen) {
      renderedCheckoutRef.current = "";
      return undefined;
    }

    if (!checkoutFrameRef.current || !window.Tebex?.checkout?.render || !basket?.ident) {
      return undefined;
    }

    if (renderedCheckoutRef.current === basket.ident) {
      return undefined;
    }

    ensureTebexCheckoutEvents();
    renderedCheckoutRef.current = basket.ident;
    const frame = checkoutFrameRef.current;
    frame.replaceChildren();
    const width = Math.min(1040, Math.max(320, window.innerWidth - 48));
    const height = Math.min(780, Math.max(560, window.innerHeight - 96));
    window.Tebex.checkout.init({
      ident: basket.ident,
      locale: "fr_FR",
      theme: "dark",
      colors: [
        { name: "primary", color: "#24b6bd" },
        { name: "secondary", color: "#fe14be" },
      ],
    });
    window.Tebex.checkout.render(frame, width, height, false);

    return undefined;
  }, [isCheckoutOpen, basket?.ident, portalTarget]);

  useEffect(() => {
    if (!isCheckoutOpen) {
      return undefined;
    }

    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setIsCheckoutOpen(false);
      }
    };

    window.dispatchEvent(new Event("codex:lenis-stop"));
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      window.dispatchEvent(new Event("codex:lenis-start"));
    };
  }, [isCheckoutOpen]);

  const listedProducts = subscriptionView ? subscriptionView.leftovers : selectedCategory?.packages ?? [];
  const categorySlug = normalizeSlug(selectedCategory?.name ?? "");
  const isCodyxPackCategory = categorySlug.includes("codyx") || (categorySlug.includes("pack") && !categorySlug.includes("cadeau"));
  const showPackBonusNote =
    isCodyxPackCategory &&
    !subscriptionView &&
    listedProducts.some((product) => {
      const productId = asPackageId(product.id);
      return Boolean(productId && cardHighlights.badgeById.get(productId));
    });

  return (
    <section className={styles.store}>
      <Script src="https://js.tebex.io/v/1.js" strategy="afterInteractive" onLoad={ensureTebexCheckoutEvents} />
      {message ? <div className={styles.notice}>{message}</div> : null}
      {catalogError ? <div className={styles.error}>{catalogError}</div> : null}

      <div className={styles.categoryBar} id="catalogue">
        {categories.map((category) => (
          <button
            className={category.id === selectedCategory?.id ? styles.categoryActive : ""}
            key={category.id}
            onClick={() => selectCategory(category)}
            type="button"
          >
            {category.name}
            <small>{category.packages.length}</small>
          </button>
        ))}
      </div>

      <div className={styles.sectionHeading}>
        <div>
          <span>Catégorie sélectionnée</span>
          <h2>{selectedCategory?.name ?? "Catalogue indisponible"}</h2>
          <CategoryDescription description={selectedCategory?.description} />
        </div>
      </div>

      <div className={styles.products}>
        {subscriptionView ? (
          <SubscriptionBoard
            highlights={cardHighlights}
            isBusy={isBusy}
            onDetail={setDetailProduct}
            onGift={openGift}
            onSubscribe={(product) => addProduct(product)}
            onTerm={setSubscriptionTerm}
            perks={cardHighlights.subscriptionPerks}
            signedIn={Boolean(basket?.username)}
            slots={subscriptionView.slots}
            term={subscriptionTerm}
          />
        ) : null}
        {listedProducts.map((product) => {
          const description = hideCalculatedBonusNote(cleanDescription(product.description));
          const productId = asPackageId(product.id);
          const banner = productId ? cardHighlights.bannerById.get(productId) ?? "" : "";
          const badge = productId ? cardHighlights.badgeById.get(productId) ?? "" : "";
          const priceNote = productId ? cardHighlights.priceNoteById.get(productId) ?? "" : "";

          return (
            <article className={banner ? `${styles.productCard} ${styles.productCardFeatured}` : styles.productCard} key={product.id}>
              {banner ? <span className={styles.valueBadge}>{banner}</span> : null}
              <div className={styles.productMedia}>
                {product.image ? <img alt="" loading="lazy" src={product.image} /> : <Icon name="catalog" />}
              </div>
              <div className={styles.productBody}>
                <span className={styles.productType}>{productKindLabel(product)}</span>
                <h3>{product.name}</h3>
                <p>{description || "Produit disponible via la boutique sécurisée Tebex."}</p>
                <div className={styles.productFooter}>
                  {badge ? <BonusPill label={badge} /> : null}
                  <div className={styles.productPrice}>
                    <strong>{formatPrice(product.base_price ?? product.total_price, product.currency)}</strong>
                    {priceNote ? <small className={styles.priceNote}>{priceNote}</small> : null}
                  </div>
                  <div className={styles.productActions}>
                    <button className={styles.addButton} disabled={isBusy} onClick={() => addProduct(product)} type="button">
                      {basket?.username ? "Acheter" : "Connexion requise"}
                    </button>
                    <button className={styles.giftLink} disabled={isBusy} onClick={() => openGift(product)} type="button">
                      <GiftMark />
                      Offrir
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      {showPackBonusNote ? (
        <p className={styles.bonusFootnote}>
          <span aria-hidden="true" className={styles.bonusFootnoteMark} />
          Bonus calculé par rapport au pack Venice.
        </p>
      ) : null}

      {portalTarget
        ? createPortal(
            <div
              className={`${styles.cartModal} ${isCartOpen ? styles.cartModalOpen : ""}`}
              aria-hidden={!isCartOpen}
            >
              <button
                aria-label="Fermer le panier"
                className={styles.cartBackdrop}
                onClick={() => setIsCartOpen(false)}
                tabIndex={isCartOpen ? 0 : -1}
                type="button"
              />
              <aside
                className={`${styles.cartPanel} ${isCartOpen ? styles.cartPanelOpen : ""}`}
                aria-hidden={!isCartOpen}
                aria-modal="true"
                role="dialog"
              >
        <div className={styles.cartHeader}>
          <div>
            <span>Panier Tebex</span>
            <h2>{basketCount} produit{basketCount > 1 ? "s" : ""}</h2>
          </div>
          <button ref={cartCloseRef} aria-label="Fermer le panier" onClick={() => setIsCartOpen(false)} type="button">×</button>
        </div>

        <div className={styles.cartItems}>
          {basketItems.length ? (
            basketItems.map((item, index) => {
              const productId = item.package?.id ?? item.package_id ?? item.id;
              const details = basketPackageDetails(item, catalogPrices.get(String(productId)) ?? 0);
              const catalogProduct = catalogProducts.get(String(details.id));
              const quantityDisabled = catalogProduct?.disable_quantity === true;
              const giftedTo = item.in_basket?.gift_username || item.gift_username || "";
              const giftedSubscription =
                Boolean(giftedTo) &&
                ((catalogProduct?.type ?? item.type) === "subscription" || Boolean(subscriptionGradeFromName(details.name)));

              return (
                <div className={styles.cartItem} key={`${details.id ?? details.name}-${index}`}>
                  <div>
                    <strong>{details.name}</strong>
                    {giftedTo ? <small>Offert à {giftedTo}</small> : null}
                    {giftedSubscription ? (
                      <small className={styles.renewalNote}>
                        Cet abonnement se renouvelle comme un abonnement normal : le moyen de paiement de cette commande est débité aux échéances suivantes, jusqu’à annulation.
                      </small>
                    ) : null}
                    {quantityDisabled ? (
                      <small>Quantité unique</small>
                    ) : (
                      <div className={styles.quantityControl} aria-label={`Quantité de ${details.name}`}>
                        <button
                          aria-label={`Diminuer la quantité de ${details.name}`}
                          disabled={isBusy || details.quantity <= 1}
                          onClick={() => updateProductQuantity(details.id, details.quantity - 1)}
                          type="button"
                        >
                          −
                        </button>
                        <span>{details.quantity}</span>
                        <button
                          aria-label={`Augmenter la quantité de ${details.name}`}
                          disabled={isBusy || details.quantity >= 100}
                          onClick={() => updateProductQuantity(details.id, details.quantity + 1)}
                          type="button"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                  <div>
                    <span>{formatPrice(details.price, basket?.currency)}</span>
                    <button disabled={!details.id || isBusy} onClick={() => removeProduct(details.id)} type="button">Retirer</button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className={styles.emptyCart}>Votre panier est vide.</p>
          )}
        </div>

        <div className={styles.cartTotal}>
          <span>Sous-total</span>
          <strong>{formatPrice(basket?.total_price, basket?.currency)}</strong>
        </div>
        <p className={styles.taxNotice}>Prix TTC, taxes incluses.</p>
        <button className={styles.checkoutButton} disabled={isBusy || !basketItems.length} onClick={checkout} type="button">
          Accéder au paiement Tebex
        </button>
              </aside>
            </div>,
            portalTarget,
          )
        : null}

      {portalTarget && isCheckoutOpen
        ? createPortal(
            <div className={styles.checkoutModal}>
              <button
                aria-label="Fermer le paiement"
                className={styles.giftBackdrop}
                onClick={() => setIsCheckoutOpen(false)}
                type="button"
              />
              <div aria-label="Paiement Tebex" aria-modal="true" className={styles.checkoutPanel} role="dialog">
                <button aria-label="Fermer" className={styles.checkoutClose} onClick={() => setIsCheckoutOpen(false)} type="button">
                  ×
                </button>
                <div ref={checkoutFrameRef} className={styles.checkoutFrame} />
              </div>
            </div>,
            portalTarget,
          )
        : null}

      {portalTarget && giftProduct
        ? createPortal(
            <div className={styles.giftModal}>
              <button aria-label="Fermer" className={styles.giftBackdrop} onClick={() => setGiftProduct(null)} type="button" />
              <form className={styles.giftPanel} onSubmit={submitGift}>
                <span className={styles.giftKicker}>Cadeau</span>
                <h2 className={styles.giftTitle}>Offrir {giftProduct.name}</h2>
                <p>Pseudo du joueur à qui offrir.</p>
                {discordAccount ? null : (
                  <p className={styles.giftNote}>
                    Connecte Discord avec le bouton en bas de la boutique. Ferme cette fenêtre pour l’atteindre.
                  </p>
                )}
                <label>
                  Pseudo du joueur
                  <input
                    autoComplete="off"
                    maxLength={32}
                    onChange={(event) => {
                      setGiftName(event.target.value);
                      setGiftError("");
                    }}
                    placeholder="Pseudo"
                    value={giftName}
                  />
                </label>
                {giftError ? <p className={styles.giftError}>{giftError}</p> : null}
                <div className={styles.giftActions}>
                  <button onClick={() => setGiftProduct(null)} type="button">Annuler</button>
                  <button className={styles.checkoutButton} disabled={isBusy || !discordAccount} type="submit">
                    {isBusy ? "Ajout…" : "Ajouter au panier"}
                  </button>
                </div>
              </form>
            </div>,
            portalTarget,
          )
        : null}

      {portalTarget && detailProduct
        ? createPortal(
            <div className={styles.giftModal}>
              <button aria-label="Fermer" className={styles.giftBackdrop} onClick={() => setDetailProduct(null)} type="button" />
              <div aria-modal="true" className={`${styles.giftPanel} ${styles.detailPanel}`} role="dialog">
                <span>Détail Tebex</span>
                <h2>{detailProduct.name}</h2>
                <div className={styles.detailBody}>{cleanDescription(detailProduct.description) || "Tebex n’a pas renvoyé de description."}</div>
                <div className={styles.giftActions}>
                  <button onClick={() => setDetailProduct(null)} type="button">Fermer</button>
                </div>
              </div>
            </div>,
            portalTarget,
          )
        : null}

      <nav className={styles.legalBar} aria-label="Informations légales Tebex">
        {TEBEX_LEGAL_LINKS.map((link) => (
          <a href={link.href} key={link.href} rel="noopener noreferrer" target="_blank">
            {link.label}
          </a>
        ))}
      </nav>

      <nav className={styles.shopDock} aria-label="Navigation boutique" data-lenis-prevent>
        <div className={styles.shopDockGlass} aria-hidden="true" />
        <svg
          className={styles.shopDockBorder}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <polygon
            points="4 0.6 96 0.6 99.5 50 96 99.4 4 99.4 0.5 50"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <a href="#catalogue">
          <Icon name="catalog" />
          <span>Catalogue</span>
        </a>
        <button onClick={() => setIsCartOpen(true)} type="button">
          <Icon name="cart" />
          <span>Panier <b>{basketCount}</b></span>
        </button>
        {basket?.username ? (
          <button disabled={isBusy} onClick={disconnectFiveM} type="button">
            <Icon name="user" />
            <span><span className={styles.dockName}>{basket.username}</span><small>Se déconnecter</small></span>
          </button>
        ) : (
          <button disabled={isBusy} onClick={connectFiveM} type="button">
            <Icon name="user" />
            <span>{isBusy ? "Préparation..." : "Se connecter"}<small>Compte FiveM</small></span>
          </button>
        )}
        {discordAccount ? (
          <button disabled={isBusy} onClick={disconnectDiscord} type="button">
            <Icon name="discord" />
            <span><span className={styles.dockName}>{discordAccount.name}</span><small>Se déconnecter</small></span>
          </button>
        ) : (
          <button disabled={isBusy} onClick={() => connectDiscord()} type="button">
            <Icon name="discord" />
            <span>Discord<small>Se connecter</small></span>
          </button>
        )}
      </nav>
    </section>
  );
}
