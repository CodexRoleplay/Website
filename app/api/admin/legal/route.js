import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/firebase/admin";
import { getLegalPages, saveLegalPage } from "@/lib/legal/pages-persistence";
import { LEGAL_PAGE_KEYS } from "@/lib/legal/pages";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const admin = await verifyAdminRequest(request);

    if (admin.error) {
      return NextResponse.json({ error: admin.error }, { status: admin.status });
    }

    const pages = await getLegalPages();
    return NextResponse.json({ pages, source: "firestore" });
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

    if (!LEGAL_PAGE_KEYS.includes(payload?.page) || !Array.isArray(payload.blocks)) {
      return NextResponse.json({ error: "Format des pages légales invalide." }, { status: 400 });
    }

    if (payload.title != null && typeof payload.title !== "string") {
      return NextResponse.json({ error: "Le titre est invalide." }, { status: 400 });
    }

    const stored = await saveLegalPage({
      page: payload.page,
      title: payload.title,
      blocks: payload.blocks,
      actor: { uid: admin.uid, email: admin.email },
    });

    return NextResponse.json({ page: payload.page, ...stored });
  } catch (error) {
    console.error("[admin/legal POST]", error);
    return NextResponse.json({ error: error?.message ?? "Erreur serveur admin." }, { status: 500 });
  }
}
