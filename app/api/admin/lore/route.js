import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/firebase/admin";
import { getLoreDocument, saveLoreWithAudit } from "@/lib/lore/admin-persistence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const admin = await verifyAdminRequest(request);

    if (admin.error) {
      return NextResponse.json({ error: admin.error }, { status: admin.status });
    }

    const stored = await getLoreDocument();
    return NextResponse.json({ ...stored, source: "firestore" });
  } catch (error) {
    console.error("[admin/lore GET]", error);
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

    if (!Array.isArray(payload.blocks) || (payload.title != null && typeof payload.title !== "string")) {
      return NextResponse.json({ error: "Format de lore invalide." }, { status: 400 });
    }

    const result = await saveLoreWithAudit({
      title: payload.title,
      blocks: payload.blocks,
      actor: {
        uid: admin.uid,
        email: admin.email,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[admin/lore POST]", error);
    return NextResponse.json({ error: error?.message ?? "Erreur serveur admin." }, { status: 500 });
  }
}
