import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/firebase/admin";
import { getFallbackReglement } from "@/lib/reglement/fallback";
import { getReglementDocument, saveReglementWithAudit } from "@/lib/reglement/admin-persistence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const admin = await verifyAdminRequest(request);

    if (admin.error) {
      return NextResponse.json({ error: admin.error }, { status: admin.status });
    }

    const stored = await getReglementDocument();
    const payload = stored.updatedAt || stored.categories.length
      ? { ...stored, source: "firestore" }
      : getFallbackReglement();

    return NextResponse.json(payload);
  } catch (error) {
    console.error("[admin/reglement GET]", error);
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

    if (!Array.isArray(payload.categories)) {
      return NextResponse.json({ error: "Format de règlement invalide." }, { status: 400 });
    }

    const result = await saveReglementWithAudit({
      categories: payload.categories,
      actor: {
        uid: admin.uid,
        email: admin.email,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[admin/reglement POST]", error);
    return NextResponse.json({ error: error?.message ?? "Erreur serveur admin." }, { status: 500 });
  }
}
