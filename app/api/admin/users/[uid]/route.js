import { NextResponse } from "next/server";
import { deleteAdminUser, updateAdminUserPassword } from "@/lib/firebase/admin-server";
import { verifyAdminRequest } from "@/lib/firebase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function exposedError(error, fallback) {
  if (error?.expose) {
    return NextResponse.json({ error: error.message }, { status: error.status ?? 500 });
  }

  return NextResponse.json({ error: fallback }, { status: 500 });
}

export async function PATCH(request, { params }) {
  try {
    const admin = await verifyAdminRequest(request);

    if (admin.error) {
      return NextResponse.json({ error: admin.error }, { status: admin.status });
    }

    const { uid } = await params;

    if (!uid) {
      return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });
    }

    let payload;

    try {
      payload = await request.json();
    } catch {
      return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
    }

    const password = payload?.password;
    const passwordConfirm = payload?.passwordConfirm;

    if (typeof password !== "string" || typeof passwordConfirm !== "string") {
      return NextResponse.json({ error: "Mot de passe invalide." }, { status: 400 });
    }

    if (password.length === 0 || passwordConfirm.length === 0) {
      return NextResponse.json({ error: "Le mot de passe ne peut pas être vide." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Le mot de passe doit contenir au moins 8 caractères." }, { status: 400 });
    }

    if (password !== passwordConfirm) {
      return NextResponse.json({ error: "Les deux mots de passe ne correspondent pas." }, { status: 400 });
    }

    await updateAdminUserPassword(uid, password);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin/users PATCH]", error?.code ?? "erreur");
    return exposedError(error, "Impossible de modifier le mot de passe.");
  }
}

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

    const result = await deleteAdminUser(uid, { protectedUid: admin.uid });

    if (!result.found) {
      return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      message: "Compte supprimé. L'authentification et les données Firestore de cette personne ont été effacées.",
    });
  } catch (error) {
    console.error("[admin/users DELETE]", error?.code ?? "erreur");
    return exposedError(error, "Suppression impossible.");
  }
}
