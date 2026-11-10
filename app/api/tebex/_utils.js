import { NextResponse } from "next/server";
import { publicTebexMessage, TebexApiError } from "@/lib/tebex";

export function getRequestOrigin(request) {
  const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");

  if (configuredOrigin && !configuredOrigin.includes("votre-domaine")) {
    return configuredOrigin;
  }

  return request.nextUrl.origin;
}

const IPV4_PATTERN = /^(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)$/;
const IPV6_PATTERN = /^[0-9a-f:.]{2,45}$/i;

export function getClientIp(request) {
  const candidates = [
    ...(request.headers.get("x-forwarded-for") ?? "").split(","),
    request.headers.get("x-real-ip") ?? "",
    request.headers.get("x-vercel-forwarded-for") ?? "",
  ];

  for (const candidate of candidates) {
    const value = candidate.trim();

    if (IPV4_PATTERN.test(value) || (value.includes(":") && IPV6_PATTERN.test(value))) {
      return value;
    }
  }

  return "";
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
  const code = error instanceof TebexApiError ? error.code : "";

  return NextResponse.json(code ? { error: message, code } : { error: message }, { status });
}
