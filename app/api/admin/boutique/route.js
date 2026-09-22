import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/firebase/admin";
import { getBoutiqueSettings, setBoutiqueEnabled } from "@/lib/boutique/admin-persistence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const admin = await verifyAdminRequest(request);

    if (admin.error) {
      return NextResponse.json({ error: admin.error }, { status: admin.status });
    }

    const settings = await getBoutiqueSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error("[admin/boutique GET]", error);
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

    if (typeof payload?.enabled !== "boolean") {
      return NextResponse.json({ error: "Le champ enabled est requis." }, { status: 400 });
    }

    const settings = await setBoutiqueEnabled(payload.enabled);
    return NextResponse.json(settings);
  } catch (error) {
    console.error("[admin/boutique POST]", error);
    return NextResponse.json({ error: error?.message ?? "Erreur serveur admin." }, { status: 500 });
  }
}
