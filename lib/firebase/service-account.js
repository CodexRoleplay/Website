import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const DEFAULT_SERVICE_ACCOUNT_PATH = join(process.cwd(), "firebase-service-account.json");

function normalizePrivateKey(privateKey) {
  if (!privateKey) {
    return privateKey;
  }

  let normalized = privateKey.trim();

  if (
    (normalized.startsWith('"') && normalized.endsWith('"')) ||
    (normalized.startsWith("'") && normalized.endsWith("'"))
  ) {
    normalized = normalized.slice(1, -1);
  }

  return normalized.replace(/\\n/g, "\n");
}

function readPrivateKeyFromEnv() {
  const base64Key = process.env.FIREBASE_ADMIN_PRIVATE_KEY_BASE64;

  if (base64Key) {
    try {
      return Buffer.from(base64Key.trim(), "base64").toString("utf8");
    } catch {
      return null;
    }
  }

  return normalizePrivateKey(process.env.FIREBASE_ADMIN_PRIVATE_KEY);
}

function readServiceAccountFile(filePath) {
  if (!filePath || !existsSync(filePath)) {
    return null;
  }

  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function parseInlineServiceAccount(raw) {
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    try {
      return JSON.parse(raw.trim().replace(/^'|'$/g, "").replace(/^"|"$/g, ""));
    } catch {
      return null;
    }
  }
}

export function getServiceAccount() {
  const inlineJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  const fromInline = parseInlineServiceAccount(inlineJson);

  if (fromInline) {
    return fromInline;
  }

  const filePath =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    DEFAULT_SERVICE_ACCOUNT_PATH;

  const fromFile = readServiceAccountFile(filePath);

  if (fromFile) {
    return fromFile;
  }

  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = readPrivateKeyFromEnv();
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (clientEmail && privateKey && projectId) {
    return {
      projectId,
      client_email: clientEmail,
      private_key: privateKey,
    };
  }

  return null;
}

export function getAdminConfigStatus() {
  const serviceAccount = getServiceAccount();

  return {
    configured: Boolean(serviceAccount),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? null,
    hasClientEmail: Boolean(process.env.FIREBASE_ADMIN_CLIENT_EMAIL),
    hasPrivateKey: Boolean(
      process.env.FIREBASE_ADMIN_PRIVATE_KEY ||
        process.env.FIREBASE_ADMIN_PRIVATE_KEY_BASE64,
    ),
    hasServiceAccountJson: Boolean(process.env.FIREBASE_SERVICE_ACCOUNT),
    hasServiceAccountFile: existsSync(DEFAULT_SERVICE_ACCOUNT_PATH),
  };
}

export function isFirebaseAdminConfigured() {
  try {
    return Boolean(getServiceAccount());
  } catch {
    return false;
  }
}

export function getFirebaseAdminSetupHint() {
  return [
    "1. Firebase Console → Paramètres → Comptes de service → Générer une clé privée.",
    "2. Sur Vercel, ajoute FIREBASE_ADMIN_CLIENT_EMAIL et FIREBASE_ADMIN_PRIVATE_KEY.",
    "3. Redéploie le projet.",
  ].join("\n");
}
