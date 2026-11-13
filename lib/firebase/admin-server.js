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

const USER_DATA_COLLECTIONS = ["admins", "users", "profiles", "roles"];

function authError(message, status = 500, code = "") {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  error.expose = true;
  return error;
}

function assertSafeUid(uid) {
  if (typeof uid !== "string" || !/^[A-Za-z0-9_-]{1,128}$/.test(uid)) {
    throw authError("Utilisateur introuvable.", 404, "USER_NOT_FOUND");
  }
}

function safeAuthCode(payload) {
  const message = typeof payload?.error?.message === "string"
    ? payload.error.message
    : typeof payload?.message === "string"
      ? payload.message
      : "";
  const match = message.match(/[A-Z][A-Z0-9_]{2,}/);
  return match ? match[0] : "";
}

async function readJsonResponse(response) {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

function encodeFirestorePath(documentPath) {
  return documentPath
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function documentPathFromName(name) {
  const marker = "/documents/";
  const index = typeof name === "string" ? name.indexOf(marker) : -1;

  if (index === -1) {
    return "";
  }

  return name
    .slice(index + marker.length)
    .split("/")
    .map((segment) => decodeURIComponent(segment))
    .join("/");
}

function isUserOwnedDocumentPath(documentPath) {
  const [collectionId, documentId, extra] = documentPath.split("/");
  return Boolean(documentId) && !extra && USER_DATA_COLLECTIONS.includes(collectionId);
}

async function identityToolkit(projectId, token, methodPath, body) {
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/projects/${projectId}${methodPath}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    },
  );
  const payload = await readJsonResponse(response);
  return { response, payload };
}

async function firestoreRequest(projectId, token, urlPath, options = {}) {
  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/${urlPath}`,
    {
      method: options.method ?? "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        ...(options.body ? { "Content-Type": "application/json" } : {}),
      },
      body: options.body,
      cache: "no-store",
    },
  );
  const payload = options.method === "DELETE" ? {} : await readJsonResponse(response);

  if (options.method === "DELETE") {
    await response.arrayBuffer().catch(() => {});
  }

  return { response, payload };
}

async function lookupAuthUsers(projectId, token, body) {
  const { response, payload } = await identityToolkit(projectId, token, "/accounts:lookup", body);
  const code = safeAuthCode(payload);

  if (!response.ok || payload?.error) {
    if (code === "USER_NOT_FOUND" || code === "EMAIL_NOT_FOUND") {
      return [];
    }

    throw authError(
      `Impossible de vérifier le compte d'authentification (${code || response.status}).`,
      502,
      code || "AUTH_LOOKUP_FAILED",
    );
  }

  return Array.isArray(payload.users) ? payload.users : [];
}

async function lookupAuthByUid(projectId, token, uid) {
  const users = await lookupAuthUsers(projectId, token, { localId: [uid] });
  return users.find((user) => user.localId === uid) ?? null;
}

async function lookupAuthByEmail(projectId, token, email) {
  const users = await lookupAuthUsers(projectId, token, { email: [email] });
  return users.find((user) => String(user.email ?? "").toLowerCase() === email.toLowerCase()) ?? null;
}

async function deleteAuthAccount(projectId, token, uid) {
  const existing = await lookupAuthByUid(projectId, token, uid);

  if (!existing) {
    return;
  }

  const deleted = await identityToolkit(projectId, token, "/accounts:delete", { localId: uid });
  let stillThere = await lookupAuthByUid(projectId, token, uid);

  if (!stillThere) {
    return;
  }

  const forced = await identityToolkit(projectId, token, "/accounts:batchDelete", {
    localIds: [uid],
    force: true,
  });
  const batchErrors = Array.isArray(forced.payload?.errors) ? forced.payload.errors : [];
  const blocking = batchErrors.filter((entry) => !String(entry?.message ?? "").includes("USER_NOT_FOUND"));
  stillThere = await lookupAuthByUid(projectId, token, uid);

  if (!stillThere) {
    return;
  }

  const code = safeAuthCode(forced.payload)
    || safeAuthCode({ message: blocking[0]?.message ?? "" })
    || safeAuthCode(deleted.payload)
    || "AUTH_DELETE_FAILED";

  throw authError(
    `La suppression du compte d'authentification a échoué (${code}). Le compte existe toujours.`,
    502,
    code,
  );
}

async function listCollectionIds(projectId, token, documentPath) {
  const ids = [];
  let pageToken = "";

  do {
    const { response, payload } = await firestoreRequest(
      projectId,
      token,
      `documents/${encodeFirestorePath(documentPath)}:listCollectionIds`,
      {
        method: "POST",
        body: JSON.stringify({
          pageSize: 100,
          ...(pageToken ? { pageToken } : {}),
        }),
      },
    );

    if (response.status === 404) {
      return [];
    }

    if (!response.ok) {
      throw authError("Impossible de lire les données Firestore de cet utilisateur.", 502, "FIRESTORE_LIST_FAILED");
    }

    ids.push(...(payload.collectionIds ?? []));
    pageToken = payload.nextPageToken ?? "";
  } while (pageToken);

  return ids;
}

async function listChildDocuments(projectId, token, collectionPath) {
  const documents = [];
  let pageToken = "";

  do {
    const query = new URLSearchParams({ pageSize: "100" });

    if (pageToken) {
      query.set("pageToken", pageToken);
    }

    const { response, payload } = await firestoreRequest(
      projectId,
      token,
      `documents/${encodeFirestorePath(collectionPath)}?${query.toString()}`,
    );

    if (response.status === 404) {
      return documents;
    }

    if (!response.ok) {
      throw authError("Impossible de lire les données Firestore de cet utilisateur.", 502, "FIRESTORE_LIST_FAILED");
    }

    documents.push(...(payload.documents ?? []));
    pageToken = payload.nextPageToken ?? "";
  } while (pageToken);

  return documents;
}

async function firestoreDocumentExists(projectId, token, documentPath) {
  const { response } = await firestoreRequest(
    projectId,
    token,
    `documents/${encodeFirestorePath(documentPath)}`,
  );

  if (response.status === 404) {
    return false;
  }

  if (!response.ok) {
    throw authError("Impossible de lire les données Firestore de cet utilisateur.", 502, "FIRESTORE_READ_FAILED");
  }

  return true;
}

async function deleteFirestoreDocument(projectId, token, documentPath) {
  const { response } = await firestoreRequest(
    projectId,
    token,
    `documents/${encodeFirestorePath(documentPath)}`,
    { method: "DELETE" },
  );

  if (response.status !== 404 && !response.ok) {
    throw authError("Impossible de supprimer la fiche Firestore de cet utilisateur.", 502, "FIRESTORE_DELETE_FAILED");
  }
}

async function deleteFirestoreDocumentTree(projectId, token, documentPath) {
  const collectionIds = await listCollectionIds(projectId, token, documentPath);

  for (const collectionId of collectionIds) {
    const children = await listChildDocuments(projectId, token, `${documentPath}/${collectionId}`);

    for (const child of children) {
      const childPath = documentPathFromName(child.name);

      if (childPath) {
        await deleteFirestoreDocumentTree(projectId, token, childPath);
      }
    }
  }

  await deleteFirestoreDocument(projectId, token, documentPath);

  const remainingCollections = await listCollectionIds(projectId, token, documentPath);

  if (remainingCollections.length > 0 || await firestoreDocumentExists(projectId, token, documentPath)) {
    throw authError("La fiche Firestore de cet utilisateur n'a pas pu être supprimée.", 502, "FIRESTORE_STILL_EXISTS");
  }
}

async function queryCollectionByField(projectId, token, collectionId, fieldPath, value) {
  if (!USER_DATA_COLLECTIONS.includes(collectionId) || !value) {
    return [];
  }

  const { response, payload } = await firestoreRequest(projectId, token, "documents:runQuery", {
    method: "POST",
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId, allDescendants: false }],
        where: {
          fieldFilter: {
            field: { fieldPath },
            op: "EQUAL",
            value: { stringValue: value },
          },
        },
      },
    }),
  });

  if (response.status === 404) {
    return [];
  }

  if (!response.ok) {
    throw authError("Impossible de lire les données Firestore de cet utilisateur.", 502, "FIRESTORE_QUERY_FAILED");
  }

  const rows = Array.isArray(payload) ? payload : [];
  return rows.map((row) => row.document).filter(Boolean);
}

function documentTargetsUser(document, uid) {
  const path = documentPathFromName(document?.name);
  const documentId = path.split("/")[1] ?? "";
  const fieldUid = String(document?.fields?.uid?.stringValue ?? "");
  return isUserOwnedDocumentPath(path) && (documentId === uid || fieldUid === uid);
}

async function collectUserDocumentPaths(projectId, token, { uid, email, protectedUid }) {
  const paths = new Set();

  for (const collectionId of USER_DATA_COLLECTIONS) {
    paths.add(`${collectionId}/${uid}`);

    if (email?.includes("@") && !email.includes("/")) {
      paths.add(`${collectionId}/${email}`);
    }
  }

  const lookups = [];

  for (const collectionId of USER_DATA_COLLECTIONS) {
    lookups.push(queryCollectionByField(projectId, token, collectionId, "uid", uid));

    if (email) {
      lookups.push(queryCollectionByField(projectId, token, collectionId, "email", email));
    }
  }

  const documents = (await Promise.all(lookups)).flat();

  for (const document of documents) {
    if (documentTargetsUser(document, uid)) {
      paths.add(documentPathFromName(document.name));
    }
  }

  if (protectedUid) {
    for (const collectionId of USER_DATA_COLLECTIONS) {
      paths.delete(`${collectionId}/${protectedUid}`);
    }
  }

  return [...paths];
}

async function userHasFirestoreRecord(projectId, token, uid, email) {
  for (const collectionId of USER_DATA_COLLECTIONS) {
    if (await firestoreDocumentExists(projectId, token, `${collectionId}/${uid}`)) {
      return true;
    }

    const byUid = await queryCollectionByField(projectId, token, collectionId, "uid", uid);
    const byEmail = email
      ? await queryCollectionByField(projectId, token, collectionId, "email", email)
      : [];

    if (byUid.length > 0 || byEmail.length > 0) {
      return true;
    }
  }

  return false;
}

async function removeOrphanAuthUser(projectId, token, email) {
  const existing = await lookupAuthByEmail(projectId, token, email);

  if (!existing?.localId) {
    return false;
  }

  if (await userHasFirestoreRecord(projectId, token, existing.localId, email)) {
    return false;
  }

  await deleteAuthAccount(projectId, token, existing.localId);
  return true;
}

function throwCreateAuthError(message) {
  let code = "auth/unknown";
  let french = "Création utilisateur impossible.";

  if (message.includes("EMAIL_EXISTS")) {
    code = "auth/email-already-exists";
    french = "Un compte existe déjà avec cet email.";
  } else if (message.includes("INVALID_EMAIL")) {
    code = "auth/invalid-email";
    french = "Adresse email invalide.";
  } else if (message.includes("WEAK_PASSWORD")) {
    code = "auth/weak-password";
    french = "Le mot de passe doit contenir au moins 8 caractères.";
  }

  const error = new Error(french);
  error.code = code;
  throw error;
}

export async function createAdminUser({ email, password, createdBy }) {
  const projectId = getProjectId();
  const token = await getAccessToken();

  for (let attempt = 0; attempt < 2; attempt += 1) {
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
        cache: "no-store",
      },
    );
    const createPayload = await readJsonResponse(createResponse);

    if (!createResponse.ok) {
      const message = typeof createPayload?.error?.message === "string" ? createPayload.error.message : "";

      if (attempt === 0 && message.includes("EMAIL_EXISTS")) {
        const removed = await removeOrphanAuthUser(projectId, token, email);

        if (removed) {
          continue;
        }
      }

      throwCreateAuthError(message);
    }

    const uid = createPayload.localId;

    if (typeof uid !== "string" || !uid) {
      throw authError("Création utilisateur impossible.", 502, "AUTH_CREATE_FAILED");
    }

    const createdAt = new Date().toISOString();
    const writeResponse = await fetch(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/admins/${encodeURIComponent(uid)}`,
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
        cache: "no-store",
      },
    );

    if (!writeResponse.ok) {
      throw authError("Impossible d'enregistrer la fiche Firestore de ce compte.", 502, "FIRESTORE_WRITE_FAILED");
    }

    return {
      uid,
      email,
      role: "admin",
      createdAt,
    };
  }

  throw authError("Un compte existe déjà avec cet email.", 400, "auth/email-already-exists");
}

export async function updateAdminUserPassword(uid, password) {
  assertSafeUid(uid);

  if (typeof password !== "string" || password.length === 0) {
    throw authError("Le mot de passe ne peut pas être vide.", 400, "EMPTY_PASSWORD");
  }

  if (password.length < 8) {
    throw authError("Le mot de passe doit contenir au moins 8 caractères.", 400, "WEAK_PASSWORD");
  }

  const projectId = getProjectId();
  const token = await getAccessToken();
  const existing = await lookupAuthByUid(projectId, token, uid);

  if (!existing) {
    throw authError("Ce compte n'existe pas.", 404, "USER_NOT_FOUND");
  }

  let response;
  let payload;

  try {
    const updated = await identityToolkit(projectId, token, "/accounts:update", {
      localId: uid,
      password,
    });
    response = updated.response;
    payload = updated.payload;
  } catch {
    throw authError("Impossible de modifier le mot de passe.", 502, "AUTH_UPDATE_FAILED");
  }

  if (!response.ok || payload?.error) {
    const code = safeAuthCode(payload);

    if (code === "USER_NOT_FOUND") {
      throw authError("Ce compte n'existe pas.", 404, code);
    }

    if (code === "WEAK_PASSWORD") {
      throw authError("Le mot de passe doit contenir au moins 8 caractères.", 400, code);
    }

    throw authError("Impossible de modifier le mot de passe.", 400, code || "AUTH_UPDATE_FAILED");
  }
}

async function deleteUserFirestoreData(projectId, token, { uid, email, protectedUid }) {
  const paths = await collectUserDocumentPaths(projectId, token, { uid, email, protectedUid });

  for (const path of paths) {
    if (!isUserOwnedDocumentPath(path)) {
      continue;
    }

    await deleteFirestoreDocumentTree(projectId, token, path);
  }
}

export async function deleteAdminUser(uid, { protectedUid } = {}) {
  assertSafeUid(uid);

  if (protectedUid && uid === protectedUid) {
    throw authError("Vous ne pouvez pas supprimer votre propre accès.", 400, "SELF_DELETE");
  }

  const projectId = getProjectId();
  const token = await getAccessToken();
  const adminDoc = await getAdminDocument(uid, token);
  const email = String(adminDoc?.fields?.email?.stringValue ?? "").trim().toLowerCase();
  const authByUid = await lookupAuthByUid(projectId, token, uid);
  const authByEmail = email ? await lookupAuthByEmail(projectId, token, email) : null;
  const authIds = new Set();

  if (typeof authByUid?.localId === "string") {
    authIds.add(authByUid.localId);
  }

  if (typeof authByEmail?.localId === "string") {
    if (authByEmail.localId === uid) {
      authIds.add(authByEmail.localId);
    } else {
      const otherAdminDoc = await getAdminDocument(authByEmail.localId, token);

      if (!otherAdminDoc) {
        authIds.add(authByEmail.localId);
      }
    }
  }

  if (protectedUid && authIds.has(protectedUid)) {
    throw authError("Vous ne pouvez pas supprimer votre propre accès.", 400, "SELF_DELETE");
  }

  const firestoreLinked = await userHasFirestoreRecord(projectId, token, uid, email);

  if (!adminDoc && authIds.size === 0 && !firestoreLinked) {
    return { found: false };
  }

  for (const localId of authIds) {
    await deleteAuthAccount(projectId, token, localId);
  }

  if (email) {
    const remaining = await lookupAuthByEmail(projectId, token, email);
    const stillBlocksTarget = remaining && (remaining.localId === uid || authIds.has(remaining.localId));

    if (stillBlocksTarget) {
      throw authError(
        "La suppression du compte d'authentification a échoué. Le compte existe toujours.",
        502,
        "AUTH_STILL_EXISTS",
      );
    }
  }

  await deleteUserFirestoreData(projectId, token, { uid, email, protectedUid });

  for (const localId of authIds) {
    await deleteUserFirestoreData(projectId, token, { uid: localId, email, protectedUid });
  }

  if (await getAdminDocument(uid, token)) {
    throw authError("La fiche Firestore de cet utilisateur n'a pas pu être supprimée.", 502, "FIRESTORE_STILL_EXISTS");
  }

  return { found: true };
}
