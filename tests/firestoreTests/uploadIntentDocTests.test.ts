import { RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { doc, setDoc } from "firebase/firestore";
import { collectionNames, uploadIntentDoc1 } from "./mocks/mockData";
import { creatifyDoc } from "@/utils/firestoreUtils";
import { fbTestUtils } from "@/utils/firebaseTestUtils";

let testEnv: RulesTestEnvironment;

describe("balanceDocTests", () => {
  beforeAll(async () => {
    fbTestUtils.setDefaultLogLevel();
    testEnv = await fbTestUtils.createTestEnvironment({ projectId: "demo-project" });
  });
  beforeEach(async () => {
    await testEnv.clearFirestore();
  });
  afterAll(async () => {
    await testEnv.cleanup();
  });

  it(`UI.C.0.A - approve if valid (${collectionNames.uploadIntentDocs})`, async () => {
    const authedDb = testEnv.authenticatedContext(uploadIntentDoc1.uid).firestore();
    const docRef = doc(authedDb, collectionNames.uploadIntentDocs, uploadIntentDoc1.id);

    const result = await fbTestUtils.isRequestGranted(
      setDoc(docRef, creatifyDoc(uploadIntentDoc1))
    );
    expect(result.permissionGranted).toBe(true);
  });
});
