import { env } from "../../../env";
const emulatorProjectId = "demo-project";

export const firebaseConfig =
  env.NODE_ENV === "development" || env.NODE_ENV === "test"
    ? {
        apiKey: emulatorProjectId,
        authDomain: emulatorProjectId,
        projectId: emulatorProjectId,
        storageBucket: emulatorProjectId,
        messagingSenderId: emulatorProjectId,
        appId: emulatorProjectId,
      }
    : {
        apiKey: "AIzaSyA61NIJz0jlvOgV4jiOsObyj1KnMuogdwE",
        authDomain: "sentmatic-8f347.firebaseapp.com",
        projectId: "sentmatic-8f347",
        storageBucket: "sentmatic-8f347.firebasestorage.app",
        messagingSenderId: "358918603243",
        appId: "1:358918603243:web:d1b117d89d491d31eb99ae",
        measurementId: "G-RLQ59Q9BES",
      };
