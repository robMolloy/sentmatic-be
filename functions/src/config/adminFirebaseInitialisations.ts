import adminImport from "firebase-admin";
import { firebaseConfig } from "./firebaseConfig";
import { env } from "../../../env";

adminImport.initializeApp({ projectId: firebaseConfig.projectId });

if (env.NODE_ENV === "development" || env.NODE_ENV === "test") {
  const db = adminImport.firestore();
  db.settings({ host: "localhost:8080", ssl: false });
}

export const admin = adminImport;
