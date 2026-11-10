import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/firebase/admin";
import { getLegalDocument, saveLegalDocument } from "@/lib/legal/admin-persistence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const admin = await verifyAdminRequest(request);

    if (admin.error) {
      return NextResponse.json({ error: admin.error }, { status: admin.status });
    }

    const stored = await getLegalDocument();
    return NextResponse.json({ ...stored, source: "firestore" });
  } catch (error) {
    console.error("[admin/legal GET]", error);
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

    if (!payload?.document || typeof payload.document !== "object" || Array.isArray(payload.document)) {
      return NextResponse.json({ error: "Format des pages légales invalide." }, { status: 400 });
    }

    const result = await saveLegalDocument({
      document: payload.document,
      actor: { uid: admin.uid, email: admin.email },
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("[admin/legal POST]", error);
    return NextResponse.json({ error: error?.message ?? "Erreur serveur admin." }, { status: 500 });
  }
}
