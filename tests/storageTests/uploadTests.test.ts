import { fbTestUtils } from "@/utils/firebaseTestUtils";
import { RulesTestEnvironment } from "@firebase/rules-unit-testing";

import { uploadIntentDoc1 } from "@/mocks/mockData";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes } from "firebase/storage";

import { convertPngArrayBufferToBlob } from "@/utils/dataTypeUtils";
import { isRequestGranted } from "@/utils/firebaseTestUtils/firebaseTestUtils";
import { readFileSync } from "fs";
import path from "path";
import { firestoreCollectionNames } from "@/mocks/metadata";

let testEnv: RulesTestEnvironment;

let qrCodeFileBlob: Blob;
const getQrCodeFileBlob = () => {
  if (qrCodeFileBlob) return qrCodeFileBlob;
  const buffer = readFileSync(path.resolve("./tests/mocks/qrcode.png"));
  qrCodeFileBlob = convertPngArrayBufferToBlob({ buffer, mimeType: "image/png" });
  return qrCodeFileBlob;
};

describe("uploadTests", () => {
  beforeAll(async () => {
    fbTestUtils.setDefaultLogLevel();
    testEnv = await fbTestUtils.createTestEnvironment({ projectId: "demo-project" });
  });
  beforeEach(async () => {
    await testEnv.clearFirestore();
    await testEnv.clearStorage();
  });
  afterAll(async () => {
    await testEnv.cleanup();
  });

  it(`expect true to be true`, async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      const docRef = doc(db, firestoreCollectionNames.uploadIntentDocs, uploadIntentDoc1.id);
      await setDoc(docRef, uploadIntentDoc1);
    });
    const authedStorage = testEnv.authenticatedContext(uploadIntentDoc1.uid).storage();
    const qrCodeFileBlob = getQrCodeFileBlob();

    const storageRef = ref(authedStorage, `uploadFiles/${uploadIntentDoc1.id}`);
    const result = await isRequestGranted(uploadBytes(storageRef, qrCodeFileBlob));

    expect(result.permissionGranted).toBe(true);
  });
});
