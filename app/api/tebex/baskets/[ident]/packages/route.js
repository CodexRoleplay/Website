import { NextResponse } from "next/server";
import {
  addTebexPackage,
  getTebexBasket,
  removeTebexPackage,
  TebexApiError,
  updateTebexPackageQuantity,
} from "@/lib/tebex";
import { tebexErrorResponse, validateBasketIdent } from "@/app/api/tebex/_utils";

function validatePackageId(packageId) {
  const parsedId = Number(packageId);

  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    throw new TebexApiError("Identifiant de produit invalide.", 400);
  }

  return parsedId;
}

function validatePackageRef(body) {
  const ident = typeof body?.packageIdent === "string" ? body.packageIdent.trim() : "";

  if (/^(pkg|dyn|ext)_[\w-]+$/i.test(ident)) {
    return ident;
  }

  return validatePackageId(body?.packageId);
}

function validateQuantity(quantity) {
  const parsedQuantity = Number(quantity);

  if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1 || parsedQuantity > 100) {
    throw new TebexApiError("La quantité doit être comprise entre 1 et 100.", 400);
  }

  return parsedQuantity;
}

export async function POST(request, context) {
  try {
    const { ident } = await context.params;
    const body = await request.json();
    const basketIdent = validateBasketIdent(ident);
    const currentBasket = await getTebexBasket(basketIdent);

    await addTebexPackage(basketIdent, validatePackageRef(body), 1, currentBasket);
    const basket = await getTebexBasket(basketIdent);

    return NextResponse.json(basket);
  } catch (error) {
    return tebexErrorResponse(error);
  }
}

export async function DELETE(request, context) {
  try {
    const { ident } = await context.params;
    const body = await request.json();
    const basketIdent = validateBasketIdent(ident);

    await removeTebexPackage(basketIdent, validatePackageId(body.packageId));
    const basket = await getTebexBasket(basketIdent);

    return NextResponse.json(basket);
  } catch (error) {
    return tebexErrorResponse(error);
  }
}

export async function PATCH(request, context) {
  try {
    const { ident } = await context.params;
    const body = await request.json();
    const basketIdent = validateBasketIdent(ident);

    await updateTebexPackageQuantity(
      basketIdent,
      validatePackageId(body.packageId),
      validateQuantity(body.quantity),
    );
    const basket = await getTebexBasket(basketIdent);

    return NextResponse.json(basket);
  } catch (error) {
    return tebexErrorResponse(error);
  }
}
