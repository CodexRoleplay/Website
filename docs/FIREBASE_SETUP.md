# Configuration Firebase — Projet Codex

## 1. Créer le projet Firebase

```bash
npx -y firebase-tools@latest login
npx -y firebase-tools@latest projects:create codex-rp --display-name "Codex"
npx -y firebase-tools@latest use codex-rp
```

> Si `codex-rp` est déjà pris, choisissez un ID unique (ex. `codex-rp-fr`).

## 2. Initialiser Firestore et Auth

```bash
npx -y firebase-tools@latest init firestore
npx -y firebase-tools@latest deploy --only firestore:rules
npx -y firebase-tools@latest deploy --only auth
```

## 3. Créer l'app Web et récupérer la config

Dans la [console Firebase](https://console.firebase.google.com/) :

1. Projet **Codex** → Paramètres → Ajouter une app **Web**
2. Copiez la config SDK dans `.env.local` :

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=codex-rp.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=codex-rp
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=codex-rp.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

## 4. Activer l'authentification

Console → Authentication → Sign-in method :

- **Email/Password** : activé
- **Google** : activé (optionnel)

Ajoutez `localhost` dans **Authorized domains**.

## 5. Créer le premier admin

1. Authentication → Users → **Add user** (email + mot de passe)
2. Copiez l'**UID** de l'utilisateur
3. Firestore → Créez la collection `admins` avec un document :
   - **Document ID** : `{UID de l'utilisateur}`
   - **Champs** : `email` (string), `role` = `admin`

## 6. Importer le règlement existant

```bash
npm run seed:reglement -- votre@email.com votre-mot-de-passe
```

## 7. Lancer le site

```bash
npm run dev
```

- Panel admin : http://localhost:3000/admin
- Règlement public : http://localhost:3000/reglement

## Choix technique : Firestore vs SQL

Pour ce panel v1, **Firestore** est utilisé car le contenu règlement est hiérarchique et flexible (blocs type GitBook : warnings, cartes, citations). Firebase SQL Connect (PostgreSQL) pourra être ajouté plus tard pour des données relationnelles (joueurs, sanctions, logs).
