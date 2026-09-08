"use client";

import { readApiJson } from "@/lib/admin/read-api-json";

export async function fetchCodePenalLogsClient(token) {
  if (!token) {
    throw new Error("Session expirée. Reconnecte-toi.");
  }

  const response = await fetch("/api/admin/code-penal/logs", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });
  const payload = await readApiJson(response);

  if (!response.ok) {
    throw new Error(payload.error ?? "Impossible de charger l'historique.");
  }

  return Array.isArray(payload.logs) ? payload.logs : [];
}
