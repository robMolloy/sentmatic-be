import { fbTestUtils } from "@/utils/firebaseTestUtils";
import { RulesTestEnvironment } from "@firebase/rules-unit-testing";

import { collectionNames, uploadIntentDoc1 } from "@/mocks/mockData";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes } from "firebase/storage";

import { convertArrayBufferToBlob } from "@/utils/dataTypeUtils";
import { isRequestGranted } from "@/utils/firebaseTestUtils/firebaseTestUtils";
import { readFileSync } from "fs";
import path from "path";

let testEnv: RulesTestEnvironment;

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
      const docRef = doc(db, collectionNames.uploadIntentDocs, uploadIntentDoc1.id);
      await setDoc(docRef, uploadIntentDoc1);
    });

    const authedStorage = testEnv.authenticatedContext(uploadIntentDoc1.uid).storage();

    const fileBuffer = readFileSync(path.resolve("./tests/mocks/qrcode.png"));
    const blob = convertArrayBufferToBlob(fileBuffer);

    const storageRef = ref(authedStorage, `uploadFiles/${uploadIntentDoc1.id}`);
    const result = await isRequestGranted(uploadBytes(storageRef, blob));

    expect(result.permissionGranted).toBe(true);
  });
});
