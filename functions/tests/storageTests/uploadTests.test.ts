import { RulesTestEnvironment } from "@firebase/rules-unit-testing";

import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes } from "firebase/storage";

import { fbTestUtils } from "../../utils/firebaseTestUtils";
import { uploadIntentDoc1 } from "../mocks/mockData";
import { getQrCodeFileBlob } from "../mocks/storageMockData";
import { isRequestGranted } from "../../utils/firebaseTestUtils/firebaseTestUtils";
import { firestoreCollectionNames, storageCollectionNames } from "../mocks/metadata";

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
      const docRef = doc(db, firestoreCollectionNames.uploadIntentDocs, uploadIntentDoc1.id);
      await setDoc(docRef, uploadIntentDoc1);
    });
    const authedStorage = testEnv.authenticatedContext(uploadIntentDoc1.uid).storage();
    const qrCodeFileBlob = getQrCodeFileBlob();

    const storageRef = ref(authedStorage, `${storageCollectionNames.files}/${uploadIntentDoc1.id}`);
    const result = await isRequestGranted(uploadBytes(storageRef, qrCodeFileBlob));

    expect(result.permissionGranted).toBe(true);
  });
});
