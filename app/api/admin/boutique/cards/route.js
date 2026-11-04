import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/firebase/admin";
import { loadAdminBoutiqueCatalog } from "@/lib/boutique/admin-catalog";
import { getBoutiqueSettings, setBoutiqueCardDisplay } from "@/lib/boutique/admin-persistence";
import { buildAdminProductRows, validateCardDisplayInput } from "@/lib/boutique/card-display";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function cardsResponse(settings) {
  const catalog = await loadAdminBoutiqueCatalog();

  return {
    enabled: settings.enabled === true,
    updatedAt: settings.updatedAt ?? null,
    cardDisplay: settings.cardDisplay,
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

    const validated = validateCardDisplayInput(payload?.cards);

    if (validated.error) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const settings = await setBoutiqueCardDisplay(validated.value);
    return NextResponse.json(await cardsResponse(settings));
  } catch (error) {
    console.error("[admin/boutique/cards POST]", error);
    return NextResponse.json({ error: error?.message ?? "Erreur serveur admin." }, { status: 500 });
  }
}
