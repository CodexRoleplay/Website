import { JWT } from "google-auth-library";
import { getServiceAccount } from "@/lib/firebase/service-account";

const CLOUD_PLATFORM_SCOPE = "https://www.googleapis.com/auth/cloud-platform";

let jwtClientPromise = null;
let accessTokenCache = { token: null, expiresAt: 0 };

function getProjectId() {
  const serviceAccount = getServiceAccount();
  return serviceAccount?.project_id ?? serviceAccount?.projectId ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
}

export { getProjectId };

async function getAccessToken() {
  const now = Date.now();

  if (accessTokenCache.token && accessTokenCache.expiresAt > now + 120_000) {
    return accessTokenCache.token;
  }

  if (!jwtClientPromise) {
    jwtClientPromise = (async () => {
      const serviceAccount = getServiceAccount();

      if (!serviceAccount) {
        throw new Error("Firebase Admin SDK non configuré.");
      }

      const client = new JWT({
        email: serviceAccount.client_email,
        key: serviceAccount.private_key,
        scopes: [CLOUD_PLATFORM_SCOPE],
      });

      await client.authorize();
      return client;
    })();
  }

  const client = await jwtClientPromise;
  const tokenResponse = await client.getAccessToken();
  const token = typeof tokenResponse === "string" ? tokenResponse : tokenResponse?.token;

  if (!token) {
    throw new Error("Impossible d'obtenir un token Google.");
  }

  accessTokenCache = {
    token,
    expiresAt: client.credentials?.expiry_date ?? now + 3_500_000,
  };

  return token;
}

export { getAccessToken };

export async function testAdminInit() {
  try {
    await getAccessToken();
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      message: error?.message ?? "Initialisation Firebase Admin impossible.",
    };
  }
}

export async function verifyFirebaseIdToken(idToken) {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  if (!apiKey) {
    throw new Error("Clé API Firebase manquante.");
  }

  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ idToken }),
    cache: "no-store",
  });
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error?.message ?? "Token Firebase invalide.");
  }

  const user = payload.users?.[0];

  if (!user?.localId) {
    throw new Error("Token Firebase invalide.");
  }

  return {
    uid: user.localId,
    sub: user.localId,
    email: user.email ?? null,
  };
}

export async function listAdminUsers() {
  const projectId = getProjectId();
  const token = await getAccessToken();
  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/admins`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Firestore: ${response.status} ${errorText}`);
  }

  const payload = await response.json();
  const documents = payload.documents ?? [];

  return documents
    .map((document) => {
      const uid = document.name?.split("/").pop();
      const fields = document.fields ?? {};

      return {
        uid,
        email: fields.email?.stringValue ?? "",
        role: fields.role?.stringValue ?? "admin",
        createdAt: fields.createdAt?.stringValue ?? "",
        createdBy: fields.createdBy?.stringValue ?? "",
      };
    })
    .sort((left, right) => String(right.createdAt ?? "").localeCompare(String(left.createdAt ?? "")));
}

export async function getAdminDocument(uid, accessToken) {
  const projectId = getProjectId();
  const token = accessToken ?? (await getAccessToken());
  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/admins/${uid}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Firestore: ${response.status} ${errorText}`);
  }

  return response.json();
}

export async function createAdminUser({ email, password, createdBy }) {
  const projectId = getProjectId();
  const token = await getAccessToken();

  const createResponse = await fetch(
    `https://identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        emailVerified: true,
      }),
    },
  );

  const createPayload = await createResponse.json();

  if (!createResponse.ok) {
    const message = createPayload?.error?.message ?? "Création utilisateur impossible.";
    const error = new Error(message);
    error.code = message.includes("EMAIL_EXISTS") ? "auth/email-already-exists" : "auth/unknown";
    throw error;
  }

  const uid = createPayload.localId;
  const createdAt = new Date().toISOString();

  const writeResponse = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/admins/${uid}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fields: {
          email: { stringValue: email },
          role: { stringValue: "admin" },
          createdAt: { stringValue: createdAt },
          createdBy: { stringValue: createdBy },
        },
      }),
    },
  );

  if (!writeResponse.ok) {
    const errorText = await writeResponse.text();
    throw new Error(`Firestore: ${writeResponse.status} ${errorText}`);
  }

  return {
    uid,
    email,
    role: "admin",
    createdAt,
  };
}

export async function deleteAdminUser(uid) {
  const projectId = getProjectId();
  const token = await getAccessToken();

  const firestoreResponse = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/admins/${uid}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (firestoreResponse.status !== 404 && !firestoreResponse.ok) {
    const errorText = await firestoreResponse.text();
    throw new Error(`Firestore: ${firestoreResponse.status} ${errorText}`);
  }

  const authResponse = await fetch(
    `https://identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts:delete`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        localId: uid,
      }),
    },
  );

  if (!authResponse.ok) {
    const payload = await authResponse.json();
    const message = payload?.error?.message ?? "";

    if (!message.includes("USER_NOT_FOUND")) {
      throw new Error(message || "Suppression utilisateur impossible.");
    }
  }
}
