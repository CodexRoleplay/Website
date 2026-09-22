import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/firebase/admin";
import { getCodePenalDocument, saveCodePenalWithAudit } from "@/lib/code-penal/admin-persistence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const admin = await verifyAdminRequest(request);

    if (admin.error) {
      return NextResponse.json({ error: admin.error }, { status: admin.status });
    }

    const stored = await getCodePenalDocument();
    return NextResponse.json({ ...stored, source: "firestore" });
  } catch (error) {
    console.error("[admin/code-penal GET]", error);
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

    if (!Array.isArray(payload.jurisdictions) && !Array.isArray(payload.sections)) {
      return NextResponse.json({ error: "Format de code pénal invalide." }, { status: 400 });
    }

    const result = await saveCodePenalWithAudit({
      jurisdictions: payload.jurisdictions,
      sections: payload.sections,
      actor: {
        uid: admin.uid,
        email: admin.email,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[admin/code-penal POST]", error);
    return NextResponse.json({ error: error?.message ?? "Erreur serveur admin." }, { status: 500 });
  }
}
