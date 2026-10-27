import { NextResponse } from "next/server";
import { getTebexAuthLinks } from "@/lib/tebex";
import {
  getRequestOrigin,
  tebexErrorResponse,
  validateBasketIdent,
} from "@/app/api/tebex/_utils";

function boutiqueReturnUrl(origin, requested) {
  const fallback = `${origin}/boutique?auth=complete`;

  if (typeof requested !== "string" || !requested.startsWith("/boutique") || requested.startsWith("//")) {
    return fallback;
  }

  let url;

  try {
    url = new URL(requested, origin);
  } catch {
    return fallback;
  }

  if (url.origin !== origin || url.pathname !== "/boutique") {
    return fallback;
  }

  url.searchParams.set("auth", "complete");
  url.hash = "";

  return url.toString();
}

export async function GET(request, context) {
  try {
    const { ident } = await context.params;
    const origin = getRequestOrigin(request);
    const links = await getTebexAuthLinks(
      validateBasketIdent(ident),
      boutiqueReturnUrl(origin, request.nextUrl.searchParams.get("returnPath")),
    );

    return NextResponse.json(links);
  } catch (error) {
    return tebexErrorResponse(error);
  }
}
