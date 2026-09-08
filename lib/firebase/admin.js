import { getAdminConfigStatus, isFirebaseAdminConfigured } from "@/lib/firebase/service-account";
import {
  getAccessToken,
  getAdminDocument,
  testAdminInit,
  verifyFirebaseIdToken,
} from "@/lib/firebase/admin-server";

export { getAdminConfigStatus, isFirebaseAdminConfigured };

const verifiedAdminCache = new Map();
const MAX_VERIFY_CACHE_MS = 5 * 60 * 1000;

function getTokenExpiresAt(token) {
  try {
    const [, payload] = token.split(".");
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(Buffer.from(normalized, "base64").toString("utf8"));
    return decoded.exp ? decoded.exp * 1000 : 0;
  } catch {
    return 0;
  }
}

function getCachedAdmin(token) {
  const cached = verifiedAdminCache.get(token);

  if (!cached || cached.expiresAt <= Date.now()) {
    verifiedAdminCache.delete(token);
    return null;
  }

  return cached.admin;
}

function setCachedAdmin(token, admin) {
  const tokenExpiresAt = getTokenExpiresAt(token);
  const maxExpiresAt = Date.now() + MAX_VERIFY_CACHE_MS;
  const expiresAt = tokenExpiresAt ? Math.min(tokenExpiresAt, maxExpiresAt) : maxExpiresAt;

  verifiedAdminCache.set(token, { admin, expiresAt });
}

export async function verifyAdminRequest(request) {
  if (!isFirebaseAdminConfigured()) {
    return {
      error: "Firebase Admin SDK non configuré sur Vercel. Ajoute FIREBASE_ADMIN_CLIENT_EMAIL et FIREBASE_ADMIN_PRIVATE_KEY.",
      status: 503,
    };
  }

  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return {
      error: "Token d'authentification manquant.",
      status: 401,
    };
  }

  const token = authorization.slice(7).trim();

  if (!token || token === "null" || token === "undefined") {
    return {
      error: "Token d'authentification manquant.",
      status: 401,
    };
  }

  const cachedAdmin = getCachedAdmin(token);

  if (cachedAdmin) {
    return cachedAdmin;
  }

  let decoded;

  try {
    decoded = await verifyFirebaseIdToken(token);
  } catch (error) {
    console.error("[verifyAdminRequest] token", error);
    return {
      error: "Session invalide ou expirée.",
      status: 401,
    };
  }

  const uid = decoded.uid ?? decoded.sub;

  if (!uid) {
    return {
      error: "Session invalide ou expirée.",
      status: 401,
    };
  }

  try {
    const accessToken = await getAccessToken();
    const adminDoc = await getAdminDocument(uid, accessToken);

    if (!adminDoc) {
      return {
        error: "Accès admin refusé.",
        status: 403,
      };
    }

    const admin = {
      uid,
      email: decoded.email ?? null,
    };
    setCachedAdmin(token, admin);
    return admin;
  } catch (error) {
    console.error("[verifyAdminRequest] firestore", error);
    return {
      error: "Impossible de vérifier l'accès admin (Firestore).",
      status: 503,
    };
  }
}

export async function getAdminInitStatus() {
  const status = getAdminConfigStatus();
  const init = status.configured ? await testAdminInit() : { ok: false, message: "Variables admin manquantes." };

  return {
    ...status,
    initOk: init.ok,
    initError: init.ok ? null : init.message,
  };
}
