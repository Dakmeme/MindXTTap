import admin from "firebase-admin";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "node:path";

const COMMON_PASSWORD = "MockUser123!";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const keyPath = resolve(__dirname, "serviceAccountKey.json");
console.log("Looking for service account key at:", keyPath);

if (!fs.existsSync(keyPath)) {
  console.error("Service account key not found at:", keyPath);
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();


async function syncMockUsers() {
  const snapshot = await db.collection("users").get();
  for (const doc of snapshot.docs) {
    const uid = doc.id;
    const data = doc.data();
    const email = data.email;
    const displayName = data.fullName || data.username || "";

    if (!email) {
      console.warn(`Skipping ${uid}: no email`);
      continue;
    }

    try {
      await admin.auth().getUser(uid);
      await admin.auth().updateUser(uid, {
        password: COMMON_PASSWORD,
        email,
        displayName,
      });
      console.log(`Updated ${uid}`);
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        await admin.auth().createUser({
          uid,
          email,
          password: COMMON_PASSWORD,
          displayName,
        });
        console.log(`Created ${uid}`);
      } else {
        console.error(`Error ${uid}:`, err);
      }
    }
  }
  console.log("Done.");
}

syncMockUsers().catch(e => {
  console.error("Fatal:", e);
  process.exit(1);
});
