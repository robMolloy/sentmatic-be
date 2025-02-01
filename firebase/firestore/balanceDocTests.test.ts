import { RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { z } from "zod";
import * as fsUtils from "./firebaseTestUtils/firebaseTestUtils";
import { creatifyDoc, timestampSchema } from "./firebaseTestUtils/firestoreUtils";

export const removeKey = <T extends object, K extends keyof T>(key: K, object: T): Omit<T, K> => {
  const { [key]: _, ...rest } = object;
  return rest;
};

let testEnv: RulesTestEnvironment;
const balanceDocSchema = z.object({
  id: z.string(),
  uid: z.string(),
  value: z.number(),
  uploadIntentIds: z.record(z.string(), z.boolean()),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});
type TBalanceDoc = z.infer<typeof balanceDocSchema>;
const balanceDoc1 = {
  id: "uid123",
  uid: "uid123",
  value: 0,
  uploadIntentIds: {},
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
} satisfies TBalanceDoc;
const collectionNames = {
  balanceDocs: "balanceDocs",
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
  it("BL.CDT.0.A", async () => {
    const authedDb = testEnv.authenticatedContext(balanceDoc1.id).firestore();
    const docRef = doc(authedDb, collectionNames.balanceDocs, balanceDoc1.id);
    const response = await fsUtils.isRequestGranted(
      setDoc(docRef, creatifyDoc({ ...balanceDoc1 }))
    );
    expect(response.permissionGranted).toBe(true);
  });
  it("BL.CDT.1.A", async () => {
    const authedDb = testEnv.authenticatedContext(balanceDoc1.id).firestore();
    const docRef = doc(authedDb, collectionNames.balanceDocs, balanceDoc1.id);

    const createDocKeys = Object.keys(balanceDoc1) as (keyof TBalanceDoc)[];
    const missingKeyDocs = createDocKeys.map((key) => removeKey(key, creatifyDoc(balanceDoc1)));

    const promises = missingKeyDocs.map((x) => fsUtils.isRequestDenied(setDoc(docRef, x)));
    const results = await Promise.all(promises);
    const isAllDenied = results.every((x) => x.permissionDenied);
    expect(isAllDenied).toBe(true);
  });
});
