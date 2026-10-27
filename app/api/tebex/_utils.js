import { NextResponse } from "next/server";
import { publicTebexMessage, TebexApiError } from "@/lib/tebex";

export function getRequestOrigin(request) {
  const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");

  if (configuredOrigin && !configuredOrigin.includes("votre-domaine")) {
    return configuredOrigin;
  }

  return request.nextUrl.origin;
}

export function validateBasketIdent(ident) {
  if (!/^[a-zA-Z0-9-]{10,128}$/.test(ident ?? "")) {
    throw new TebexApiError("Identifiant de panier invalide.", 400);
  }

  return ident;
}

export function tebexErrorResponse(error) {
  const status = error instanceof TebexApiError ? error.status : 500;
  const message = publicTebexMessage(error);

  return NextResponse.json({ error: message }, { status });
}
