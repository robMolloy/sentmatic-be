import { RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import z from "zod";
import * as fsUtils from "./firebaseTestUtils/firebaseTestUtils";
import { creatifyDoc, timestampSchema } from "./firebaseTestUtils/firestoreUtils";

let testEnv: RulesTestEnvironment;
const uploadIntentDocSchema = z.object({
  id: z.string(),
  uid: z.string(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});
type TUploadIntentDoc = z.infer<typeof uploadIntentDocSchema>;
const uploadIntentDoc1 = {
  id: "uid123_1",
  uid: "uid123",
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
} as const satisfies TUploadIntentDoc;

const collectionNames = {
  balanceDocs: "balanceDocs",
  uploadIntentDocs: "uploadIntentDocs",
};

describe("balanceDocTests", () => {
  beforeAll(async () => {
    fsUtils.setDefaultLogLevel();
    testEnv = await fsUtils.createTestEnvironment({ projectId: "demo-project" });
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

    const result = await fsUtils.isRequestGranted(setDoc(docRef, creatifyDoc(uploadIntentDoc1)));
    expect(result.permissionGranted).toBe(true);
  });
});
