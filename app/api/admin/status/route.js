import { NextResponse } from "next/server";
import { getAdminInitStatus } from "@/lib/firebase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const status = await getAdminInitStatus();
    return NextResponse.json(status);
  } catch (error) {
    return NextResponse.json(
      {
        configured: false,
        initOk: false,
        initError: error?.message ?? "Erreur status admin.",
      },
      { status: 200 },
    );
  }
}
