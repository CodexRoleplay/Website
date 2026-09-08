import { readFileSync } from "node:fs";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getFirestore, setDoc } from "firebase/firestore";

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

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.error("Usage: node scripts/seed-reglement.mjs <admin-email> <admin-password>");
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

  const credentials = await signInWithEmailAndPassword(auth, email, password);

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

  console.log("Règlement importé dans Firestore.");
  console.log(`Admin connecté: ${credentials.user.email}`);
  console.log("Ajoutez ce document dans Firestore si ce n'est pas déjà fait:");
  console.log(`  Collection: admins / Document ID: ${credentials.user.uid}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
