import { NextResponse } from "next/server";
import { deleteAdminUser, getAdminDocument } from "@/lib/firebase/admin-server";
import { verifyAdminRequest } from "@/lib/firebase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(request, { params }) {
  try {
    const admin = await verifyAdminRequest(request);

    if (admin.error) {
      return NextResponse.json({ error: admin.error }, { status: admin.status });
    }

    const { uid } = await params;

    if (!uid) {
      return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });
    }

    if (uid === admin.uid) {
      return NextResponse.json({ error: "Vous ne pouvez pas supprimer votre propre accès." }, { status: 400 });
    }

    const adminDoc = await getAdminDocument(uid);

    if (!adminDoc) {
      return NextResponse.json({ error: "Accès admin introuvable." }, { status: 404 });
    }

    await deleteAdminUser(uid);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin/users DELETE]", error);
    return NextResponse.json({ error: error?.message ?? "Suppression impossible." }, { status: 500 });
  }
}
