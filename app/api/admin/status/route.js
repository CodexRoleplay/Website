import { NextResponse } from "next/server";
import { getAdminInitStatus, verifyAdminRequest } from "@/lib/firebase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const admin = await verifyAdminRequest(request);

    if (admin.error) {
      return NextResponse.json({ error: admin.error }, { status: admin.status });
    }

    const status = await getAdminInitStatus();
    return NextResponse.json(status);
  } catch (error) {
    console.error("[admin/status GET]", error);
    return NextResponse.json({ error: "Erreur status admin." }, { status: 500 });
  }
}
