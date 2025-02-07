import adminImport from "firebase-admin";
import { firebaseConfig } from "./firebaseConfig";

const { projectId } = firebaseConfig;
adminImport.initializeApp({ projectId });

const db = adminImport.firestore();
db.settings({ host: "localhost:8080", ssl: false });

export const admin = adminImport;
