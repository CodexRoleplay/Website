import { readFileSync } from "node:fs";
import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";

function loadEnv() {
  try {
    const raw = readFileSync(".env.local", "utf8");
    const env = {};

    for (const line of raw.split("\n")) {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const [key, ...rest] = trimmed.split("=");
      env[key] = rest.join("=").replace(/^"|"$/g, "");
    }

    return env;
  } catch {
    return process.env;
  }
}

const env = loadEnv();

const firebaseConfig = {
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

async function ensureAuthUser(auth, email, password) {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    if (error.code === "auth/invalid-credential" || error.code === "auth/user-not-found") {
      return createUserWithEmailAndPassword(auth, email, password);
    }

    throw error;
  }
}

async function main() {
  const email = process.argv[2] ?? "yoann.roy63@gmail.com";
  const password = process.argv[3];

  if (!password) {
    console.error("Usage: node scripts/setup-firebase.mjs <email> <mot-de-passe>");
    process.exit(1);
  }

  if (!firebaseConfig.projectId) {
    console.error("Configurez d'abord .env.local avec vos clés Firebase.");
    process.exit(1);
  }

  const { ruleCategories } = await import("../data/reglement.js");
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  const credentials = await ensureAuthUser(auth, email, password);
  const uid = credentials.user.uid;

  await setDoc(doc(db, "admins", uid), {
    email,
    role: "admin",
    createdAt: new Date().toISOString(),
  });

  await setDoc(doc(db, "site", "reglement"), {
    categories: ruleCategories.map((category) => ({
      ...category,
      sections: category.sections.map((section) => ({
        ...section,
        blocks: [],
        rules: section.rules ?? [],
      })),
    })),
    updatedAt: new Date().toISOString(),
  });

  console.log("Setup terminé.");
  console.log(`Admin: ${email}`);
  console.log(`UID admin: ${uid}`);
  console.log("Règlement importé dans Firestore.");
  console.log("Panel admin: http://localhost:3000/admin");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
