import { NextResponse } from "next/server";
import { getTebexBasket } from "@/lib/tebex";
import { tebexErrorResponse, validateBasketIdent } from "@/app/api/tebex/_utils";

export async function GET(_request, context) {
  try {
    const { ident } = await context.params;
    const basket = await getTebexBasket(validateBasketIdent(ident));

    return NextResponse.json(basket);
  } catch (error) {
    return tebexErrorResponse(error);
  }
}
