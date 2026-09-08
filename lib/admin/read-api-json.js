export async function readApiJson(response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    const preview = (await response.text()).slice(0, 80);

    if (preview.includes("<!DOCTYPE") || preview.includes("<html")) {
      throw new Error(
        "L'API admin a renvoyé une page HTML au lieu de JSON. Sur Vercel, vérifie FIREBASE_ADMIN_CLIENT_EMAIL et FIREBASE_ADMIN_PRIVATE_KEY, puis redéploie.",
      );
    }

    throw new Error(`Réponse serveur invalide (${response.status}).`);
  }

  return response.json();
}
