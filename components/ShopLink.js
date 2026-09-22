"use client";

import { isBoutiqueHref } from "@/lib/boutique/service";
import { useBoutique } from "@/components/BoutiqueProvider";

export default function ShopLink({ href, className, children, onClick, ...props }) {
  const { enabled, ready, openSoon } = useBoutique();
  const blocked = ready && !enabled && isBoutiqueHref(href);

  return (
    <a
      {...props}
      className={className}
      href={blocked ? "#boutique" : href}
      onClick={(event) => {
        if (blocked) {
          event.preventDefault();
          openSoon();
        }

        onClick?.(event);
      }}
    >
      {children}
    </a>
  );
}
