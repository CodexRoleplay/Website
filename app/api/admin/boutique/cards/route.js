import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/firebase/admin";
import { loadAdminBoutiqueCatalog } from "@/lib/boutique/admin-catalog";
import { getBoutiqueSettings, setBoutiqueCardDisplay } from "@/lib/boutique/admin-persistence";
import { buildAdminProductRows, sanitizeCouponCode, sanitizeFirstMonthPercent, validateCardDisplayInput, validateSubscriptionPerksInput } from "@/lib/boutique/card-display";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function cardsResponse(settings) {
  const catalog = await loadAdminBoutiqueCatalog();

  return {
    enabled: settings.enabled === true,
    updatedAt: settings.updatedAt ?? null,
    cardDisplay: settings.cardDisplay,
    firstMonthCoupon: settings.firstMonthCoupon ?? "",
    firstMonthPercent: settings.firstMonthPercent ?? 25,
    catalogError: catalog.catalogError,
    products: buildAdminProductRows(catalog.packages, settings.cardDisplay),
  };
}

export async function GET(request) {
  try {
    const admin = await verifyAdminRequest(request);

    if (admin.error) {
      return NextResponse.json({ error: admin.error }, { status: admin.status });
    }

    const settings = await getBoutiqueSettings();
    return NextResponse.json(await cardsResponse(settings));
  } catch (error) {
    console.error("[admin/boutique/cards GET]", error);
    return NextResponse.json({ error: error?.message ?? "Erreur serveur admin." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const admin = await verifyAdminRequest(request);

    if (admin.error) {
      return NextResponse.json({ error: admin.error }, { status: admin.status });
    }

    let payload;

    try {
      payload = await request.json();
    } catch {
      return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
    }

    const scope = payload?.scope === "cards" || payload?.scope === "subscriptions" ? payload.scope : "";

    if (scope) {
      const existing = await getBoutiqueSettings();

      if (scope === "subscriptions") {
        const perkResult = validateSubscriptionPerksInput(payload?.cards ?? {});

        if (perkResult.error) {
          return NextResponse.json({ error: perkResult.error }, { status: 400 });
        }

        const coupon = sanitizeCouponCode(payload?.firstMonthCoupon ?? "");
        const percent = sanitizeFirstMonthPercent(payload?.firstMonthPercent);

        if (coupon.error) {
          return NextResponse.json({ error: coupon.error }, { status: 400 });
        }

        if (percent.error) {
          return NextResponse.json({ error: percent.error }, { status: 400 });
        }

        const settings = await setBoutiqueCardDisplay(
          {
            ...existing.cardDisplay,
            subscriptionPerks: perkResult.subscriptionPerks,
            subscriptionGradeOrder: perkResult.subscriptionGradeOrder,
          },
          coupon.value,
          percent.value,
        );
        return NextResponse.json(await cardsResponse(settings));
      }

      const validatedCards = validateCardDisplayInput({
        ...(payload?.cards ?? {}),
        subscriptionPerks: existing.cardDisplay.subscriptionPerks,
        subscriptionGradeOrder: existing.cardDisplay.subscriptionGradeOrder,
      });

      if (validatedCards.error) {
        return NextResponse.json({ error: validatedCards.error }, { status: 400 });
      }

      const settings = await setBoutiqueCardDisplay(
        validatedCards.value,
        existing.firstMonthCoupon ?? "",
        existing.firstMonthPercent ?? 25,
      );
      return NextResponse.json(await cardsResponse(settings));
    }

    const validated = validateCardDisplayInput(payload?.cards);

    if (validated.error) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const coupon = sanitizeCouponCode(payload?.firstMonthCoupon ?? "");
    const percent = sanitizeFirstMonthPercent(payload?.firstMonthPercent);

    if (coupon.error) {
      return NextResponse.json({ error: coupon.error }, { status: 400 });
    }

    if (percent.error) {
      return NextResponse.json({ error: percent.error }, { status: 400 });
    }

    const settings = await setBoutiqueCardDisplay(validated.value, coupon.value, percent.value);
    return NextResponse.json(await cardsResponse(settings));
  } catch (error) {
    console.error("[admin/boutique/cards POST]", error);
    return NextResponse.json({ error: error?.message ?? "Erreur serveur admin." }, { status: 500 });
  }
}
