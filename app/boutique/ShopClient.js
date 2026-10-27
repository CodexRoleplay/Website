"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "next/navigation";
import { normalizeShopSlug as normalizeSlug } from "@/lib/boutique/shop-links";
import styles from "./shop.module.css";

const BASKET_STORAGE_KEY = "codex-rp-tebex-basket";
const SCROLL_STORAGE_KEY = "codex-rp-shop-scroll";
const PENDING_PACKAGE_KEY = "codex-rp-shop-pending-package";

async function apiRequest(path, options) {
  const response = await fetch(path, options);
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error || "Une erreur est survenue avec Tebex.");
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
    }),
  });
}

function formatPrice(value, currency = "EUR") {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
  }).format(Number(value ?? 0));
}

function cleanDescription(value = "") {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
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

function getCategoryDescriptionBlocks(value = "") {
  const html = String(value);
  const paragraphMatches = [...html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)];
  const paragraphs = paragraphMatches.length ? paragraphMatches.map((match) => match[1]) : [html];

  return paragraphs
    .map((paragraph) => {
      const strongMatch = paragraph.match(/<strong\b[^>]*>([\s\S]*?)<\/strong>/i);
      const lead = strongMatch ? decodeDescriptionText(strongMatch[1]) : "";
      const text = decodeDescriptionText(strongMatch ? paragraph.replace(strongMatch[0], "") : paragraph);

      return { lead, text };
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

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 5h16v14H4zM8 9h8M8 13h5" />
    </svg>
  );
}

export default function ShopClient({ initialCategories, catalogError }) {
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
  const [selectedCategoryId, setSelectedCategoryId] = useState(() =>
    getInitialCategoryId(categories, targetedCategory),
  );
  const [basket, setBasket] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [portalTarget, setPortalTarget] = useState(null);
  const initializedRef = useRef(false);
  const cartCloseRef = useRef(null);

  const selectedCategory =
    categories.find((category) => category.id === selectedCategoryId) ?? categories[0] ?? null;
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

        if (params.get("payment") === "success") {
          setMessage("Paiement terminé. Merci pour votre achat !");
        } else if (params.get("payment") === "cancelled") {
          setMessage("Paiement annulé. Votre panier reste disponible.");
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

        if (params.get("auth") === "complete") {
          params.delete("auth");
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
      const params = new URLSearchParams(window.location.search);
      params.delete("payment");
      params.set("auth", "complete");
      const returnPath = `/boutique?${params.toString()}`;
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

  async function addProduct(product) {
    if (!basket?.username) {
      setMessage("Connectez votre compte FiveM avant d'ajouter un produit.");
      await connectFiveM(product);
      return;
    }

    setIsBusy(true);
    setMessage("");

    try {
      const updatedBasket = await addPackageRequest(basket.ident, product);
      storeBasket(updatedBasket);
      setIsCartOpen(true);
      setMessage("Produit ajouté au panier.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsBusy(false);
    }
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

  function checkout() {
    if (!basket?.username) {
      setMessage("Connectez votre compte FiveM avant le paiement.");
      return;
    }

    if (!basketItems.length || !basket?.links?.checkout) {
      setMessage("Votre panier est vide.");
      return;
    }

    window.location.assign(basket.links.checkout);
  }

  return (
    <section className={styles.store}>
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
        {selectedCategory?.packages?.map((product) => {
          const description = cleanDescription(product.description);

          return (
            <article className={styles.productCard} key={product.id}>
              <div className={styles.productMedia}>
                {product.image ? <img alt="" loading="lazy" src={product.image} /> : <Icon name="catalog" />}
              </div>
              <div className={styles.productBody}>
                <span className={styles.productType}>{product.type === "subscription" ? "Abonnement" : "Achat unique"}</span>
                <h3>{product.name}</h3>
                <p>{description || "Produit disponible via la boutique sécurisée Tebex."}</p>
                <div className={styles.productFooter}>
                  <strong>{formatPrice(product.base_price ?? product.total_price, product.currency)}</strong>
                  <button disabled={isBusy} onClick={() => addProduct(product)} type="button">
                    {basket?.username ? "Ajouter" : "Connexion requise"}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

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

              return (
                <div className={styles.cartItem} key={`${details.id ?? details.name}-${index}`}>
                  <div>
                    <strong>{details.name}</strong>
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
            <span>{basket.username}<small>Se déconnecter</small></span>
          </button>
        ) : (
          <button disabled={isBusy} onClick={connectFiveM} type="button">
            <Icon name="user" />
            <span>{isBusy ? "Préparation..." : "Se connecter"}<small>Compte FiveM</small></span>
          </button>
        )}
      </nav>
    </section>
  );
}
