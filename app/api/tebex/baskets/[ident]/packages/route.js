import { NextResponse } from "next/server";
import {
  addTebexPackage,
  applyTebexCoupon,
  getTebexBasket,
  getTebexPackage,
  isBenignCouponError,
  removeTebexPackage,
  TebexApiError,
  updateTebexPackageQuantity,
} from "@/lib/tebex";
import { tebexErrorResponse, validateBasketIdent } from "@/app/api/tebex/_utils";
import { getBoutiqueSettings } from "@/lib/boutique/admin-persistence";
import { isMonthlySubscriptionPackage } from "@/lib/boutique/subscriptions";

function validatePackageId(packageId) {
  const parsedId = Number(packageId);

  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    throw new TebexApiError("Identifiant de produit invalide.", 400);
  }

  return parsedId;
}

function validatePackageRef(body) {
  const ident = typeof body?.packageIdent === "string" ? body.packageIdent.trim() : "";

  if (/^(?:pkg|dyn|ext)_[\w.-]+$/i.test(ident)) {
    return ident;
  }

  return validatePackageId(body?.packageId);
}

function validateDiscordId(value) {
  if (value == null || value === "") {
    return "";
  }

  const id = String(value).trim();

  if (!/^\d{17,20}$/.test(id)) {
    throw new TebexApiError("Identifiant Discord invalide.", 400);
  }

  return id;
}

function validateGiftUsername(value) {
  if (value == null || value === "") {
    return "";
  }

  const name = String(value).trim();

  if (!/^[A-Za-z0-9][A-Za-z0-9_.-]{1,31}$/.test(name) || /^\d{17,20}$/.test(name)) {
    throw new TebexApiError(
      "Indique le pseudo FiveM du joueur, comme REX-STUDIO. Le pseudo Discord ne fonctionne pas.",
      400,
    );
  }

  return name;
}

function validateQuantity(quantity) {
  const parsedQuantity = Number(quantity);

  if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1 || parsedQuantity > 100) {
    throw new TebexApiError("La quantité doit être comprise entre 1 et 100.", 400);
  }

  return parsedQuantity;
}

async function applyFirstMonthCoupon(basketIdent, packageRef) {
  try {
    const pack = await getTebexPackage(packageRef);

    if (!isMonthlySubscriptionPackage(pack)) {
      return "";
    }

    const settings = await getBoutiqueSettings();

    if (!settings.firstMonthCoupon) {
      return "";
    }

    try {
      await applyTebexCoupon(basketIdent, settings.firstMonthCoupon);
    } catch (error) {
      if (!isBenignCouponError(error)) {
        return "Le code promo du premier mois n'a pas pu être appliqué. Le produit est bien dans le panier.";
      }
    }
  } catch {
    return "Le code promo du premier mois n'a pas pu être vérifié. Le produit est bien dans le panier.";
  }

  return "";
}

export async function POST(request, context) {
  try {
    const { ident } = await context.params;
    const body = await request.json();
    const basketIdent = validateBasketIdent(ident);
    const currentBasket = await getTebexBasket(basketIdent);
    const packageRef = validatePackageRef(body);

    await addTebexPackage(
      basketIdent,
      packageRef,
      1,
      currentBasket,
      validateDiscordId(body?.discordId),
      validateGiftUsername(body?.targetUsername),
    );

    let notice = "";

    if (body?.applyMonthlyCoupon === true) {
      notice = await applyFirstMonthCoupon(basketIdent, packageRef);
    }

    const basket = await getTebexBasket(basketIdent);

    return NextResponse.json(notice ? { ...basket, notice } : basket);
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
