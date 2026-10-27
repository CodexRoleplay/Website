"use client";

import { createContext, useContext } from "react";
import { FALLBACK_SHOP_CATEGORY_LINKS } from "@/lib/boutique/shop-links";

const ShopNavContext = createContext(FALLBACK_SHOP_CATEGORY_LINKS);

export function ShopNavProvider({ links, children }) {
  const value = Array.isArray(links) && links.length > 0 ? links : FALLBACK_SHOP_CATEGORY_LINKS;

  return <ShopNavContext.Provider value={value}>{children}</ShopNavContext.Provider>;
}

export function useShopCategoryLinks() {
  return useContext(ShopNavContext);
}
