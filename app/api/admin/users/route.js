import { NextResponse } from "next/server";
import { createAdminUser, deleteAdminUser, listAdminUsers } from "@/lib/firebase/admin-server";
import { verifyAdminRequest } from "@/lib/firebase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function mapAuthError(error) {
  const code = error?.code ?? "";

  if (code === "auth/email-already-exists") {
    return "Un compte existe déjà avec cet email.";
  }

  if (code === "auth/invalid-email") {
    return "Adresse email invalide.";
  }

  if (code === "auth/weak-password") {
    return "Mot de passe trop faible (minimum 6 caractères Firebase).";
  }

  return error?.message ?? "Impossible de créer l'utilisateur.";
}

function jsonError(message, status = 500) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request) {
  try {
    const admin = await verifyAdminRequest(request);

    if (admin.error) {
      return NextResponse.json({ error: admin.error }, { status: admin.status });
    }

    const users = await listAdminUsers();
    return NextResponse.json({ users });
  } catch (error) {
    console.error("[admin/users GET]", error);
    return jsonError(error?.message ?? "Erreur serveur admin.");
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

    const email = String(payload.email ?? "")
      .trim()
      .toLowerCase();
    const password = String(payload.password ?? "");

    if (!email || !password) {
      return NextResponse.json({ error: "Email et mot de passe requis." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Le mot de passe doit contenir au moins 8 caractères." }, { status: 400 });
    }

    const user = await createAdminUser({
      email,
      password,
      createdBy: admin.uid,
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("[admin/users POST]", error);

    if (error?.code?.startsWith?.("auth/")) {
      return NextResponse.json({ error: mapAuthError(error) }, { status: 400 });
    }

    return jsonError(error?.message ?? "Erreur serveur admin.");
  }
}
