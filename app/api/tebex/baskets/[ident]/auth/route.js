import { NextResponse } from "next/server";
import { getTebexAuthLinks } from "@/lib/tebex";
import {
  getRequestOrigin,
  tebexErrorResponse,
  validateBasketIdent,
} from "@/app/api/tebex/_utils";

export async function GET(request, context) {
  try {
    const { ident } = await context.params;
    const origin = getRequestOrigin(request);
    const links = await getTebexAuthLinks(
      validateBasketIdent(ident),
      `${origin}/boutique?auth=complete`,
    );

    return NextResponse.json(links);
  } catch (error) {
    return tebexErrorResponse(error);
  }
}
