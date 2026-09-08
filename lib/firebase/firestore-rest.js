export function jsToFirestoreValue(value) {
  if (value === null || value === undefined) {
    return { nullValue: null };
  }

  if (typeof value === "string") {
    return { stringValue: value };
  }

  if (typeof value === "boolean") {
    return { booleanValue: value };
  }

  if (typeof value === "number") {
    if (Number.isInteger(value)) {
      return { integerValue: String(value) };
    }

    return { doubleValue: value };
  }

  if (Array.isArray(value)) {
    return {
      arrayValue: {
        values: value.map((item) => jsToFirestoreValue(item)),
      },
    };
  }

  if (typeof value === "object") {
    const fields = {};

    for (const [key, entry] of Object.entries(value)) {
      if (entry !== undefined) {
        fields[key] = jsToFirestoreValue(entry);
      }
    }

    return { mapValue: { fields } };
  }

  return { stringValue: String(value) };
}

export function jsToFirestoreFields(object) {
  const fields = {};

  for (const [key, value] of Object.entries(object)) {
    if (value !== undefined) {
      fields[key] = jsToFirestoreValue(value);
    }
  }

  return fields;
}

export function firestoreValueToJs(value) {
  if (!value || typeof value !== "object") {
    return null;
  }

  if ("stringValue" in value) {
    return value.stringValue;
  }

  if ("booleanValue" in value) {
    return value.booleanValue;
  }

  if ("integerValue" in value) {
    return Number(value.integerValue);
  }

  if ("doubleValue" in value) {
    return value.doubleValue;
  }

  if ("nullValue" in value) {
    return null;
  }

  if ("timestampValue" in value) {
    return value.timestampValue;
  }

  if ("arrayValue" in value) {
    return (value.arrayValue.values ?? []).map((entry) => firestoreValueToJs(entry));
  }

  if ("mapValue" in value) {
    const result = {};

    for (const [key, entry] of Object.entries(value.mapValue.fields ?? {})) {
      result[key] = firestoreValueToJs(entry);
    }

    return result;
  }

  return null;
}

export function firestoreDocumentToJs(document) {
  if (!document?.fields) {
    return null;
  }

  const result = {};

  for (const [key, value] of Object.entries(document.fields)) {
    result[key] = firestoreValueToJs(value);
  }

  return result;
}

export async function firestoreGetDocument(projectId, documentPath, accessToken) {
  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${documentPath}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
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

export async function firestorePatchDocument(projectId, documentPath, accessToken, data) {
  const mask = Object.keys(data)
    .filter((key) => data[key] !== undefined)
    .map((key) => `updateMask.fieldPaths=${encodeURIComponent(key)}`)
    .join("&");
  const query = mask
    ? `currentDocument.exists=true&${mask}`
    : "currentDocument.exists=true";
  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${documentPath}?${query}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields: jsToFirestoreFields(data) }),
    },
  );

  if (response.status === 404) {
    return firestoreCreateDocument(projectId, documentPath, accessToken, data);
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Firestore: ${response.status} ${errorText}`);
  }

  return response.json();
}

export async function firestoreCreateDocument(projectId, documentPath, accessToken, data) {
  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${documentPath}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields: jsToFirestoreFields(data) }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Firestore: ${response.status} ${errorText}`);
  }

  return response.json();
}

export async function firestoreAddDocument(projectId, collectionPath, accessToken, data) {
  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collectionPath}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields: jsToFirestoreFields(data) }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Firestore: ${response.status} ${errorText}`);
  }

  return response.json();
}

export async function firestoreListDocuments(projectId, collectionPath, accessToken, pageSize = 100) {
  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collectionPath}?pageSize=${pageSize}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    },
  );

  if (response.status === 404) {
    return [];
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Firestore: ${response.status} ${errorText}`);
  }

  const payload = await response.json();
  return payload.documents ?? [];
}
