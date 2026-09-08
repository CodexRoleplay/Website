import { NextResponse } from "next/server";
import { createTebexBasket } from "@/lib/tebex";
import { getRequestOrigin, tebexErrorResponse } from "@/app/api/tebex/_utils";

export async function POST(request) {
  try {
    const origin = getRequestOrigin(request);
    const basket = await createTebexBasket({
      completeUrl: `${origin}/boutique?payment=success`,
      cancelUrl: `${origin}/boutique?payment=cancelled`,
    });

    return NextResponse.json(basket);
  } catch (error) {
    return tebexErrorResponse(error);
  }
}
