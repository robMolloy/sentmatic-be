import { RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { z } from "zod";
import * as fsUtils from "./firebaseTestUtils/firebaseTestUtils";
import {
  creatifyDoc,
  getNotNowTimestamp,
  timestampSchema,
} from "./firebaseTestUtils/firestoreUtils";

export const removeKey = <T extends object, K extends keyof T>(key: K, object: T): Omit<T, K> => {
  const { [key]: _, ...rest } = object;
  return rest;
};

let testEnv: RulesTestEnvironment;
const balanceDocSchema = z.object({
  id: z.string(),
  uid: z.string(),
  value: z.number(),
  currentUploadIntentNumber: z.number(),
  uploadIntentIds: z.record(z.string(), z.boolean()),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});
type TBalanceDoc = z.infer<typeof balanceDocSchema>;
const balanceDoc1 = {
  id: "uid123",
  uid: "uid123",
  value: 0,
  currentUploadIntentNumber: 0,
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
  it(`BL.CDT.0.A.C - approve if valid (${collectionNames.balanceDocs})`, async () => {
    const authedDb = testEnv.authenticatedContext(balanceDoc1.id).firestore();
    const docRef = doc(authedDb, collectionNames.balanceDocs, balanceDoc1.id);
    const response = await fsUtils.isRequestGranted(
      setDoc(docRef, creatifyDoc({ ...balanceDoc1 }))
    );
    expect(response.permissionGranted).toBe(true);
  });
  it(`BL.CDT.1.D.C - deny create access if missing a key (${collectionNames.balanceDocs})`, async () => {
    const authedDb = testEnv.authenticatedContext(balanceDoc1.id).firestore();
    const docRef = doc(authedDb, collectionNames.balanceDocs, balanceDoc1.id);

    const createDocKeys = Object.keys(balanceDoc1) as (keyof TBalanceDoc)[];
    const missingKeyDocs = createDocKeys.map((key) => removeKey(key, creatifyDoc(balanceDoc1)));

    const promises = missingKeyDocs.map((x) => fsUtils.isRequestDenied(setDoc(docRef, x)));
    const results = await Promise.all(promises);
    const isAllDenied = results.every((x) => x.permissionDenied);
    expect(isAllDenied).toBe(true);
  });
  it(`BL.CDT.2.D.C - deny create access if additional key (${collectionNames.balanceDocs})`, async () => {
    const authedDb = testEnv.authenticatedContext(balanceDoc1.id).firestore();
    const docRef = doc(authedDb, collectionNames.balanceDocs, balanceDoc1.id);

    const additionalKeyDoc = { ...creatifyDoc(balanceDoc1), addKey: "addKey" };

    const result = await fsUtils.isRequestDenied(setDoc(docRef, additionalKeyDoc));
    expect(result.permissionDenied).toBe(true);
  });
  it(`BL.CDT.3.D.C - deny create access if docData.id doesn't match docId (${collectionNames.balanceDocs})`, async () => {
    const authedDb = testEnv.authenticatedContext(balanceDoc1.id).firestore();

    const docRef1 = doc(authedDb, collectionNames.balanceDocs, balanceDoc1.id);
    const newDoc1 = { ...creatifyDoc(balanceDoc1), id: "randomId" };

    const docRef2 = doc(authedDb, collectionNames.balanceDocs, "randomId");
    const newDoc2 = creatifyDoc(balanceDoc1);

    const promises = [
      fsUtils.isRequestDenied(setDoc(docRef1, newDoc1)),
      fsUtils.isRequestDenied(setDoc(docRef2, newDoc2)),
    ];
    const results = await Promise.all(promises);
    const isAllDenied = results.every((x) => x.permissionDenied);
    expect(isAllDenied).toBe(true);
  });
  it(`BL.CDT.4.D.C - deny create access if docData.id doesn't match uid (${collectionNames.balanceDocs})`, async () => {
    const authedDb = testEnv.authenticatedContext("randomId").firestore();
    const docRef = doc(authedDb, collectionNames.balanceDocs, balanceDoc1.id);

    const newDoc = creatifyDoc(balanceDoc1);

    const result = await fsUtils.isRequestDenied(setDoc(docRef, newDoc));
    expect(result.permissionDenied).toBe(true);
  });
  it(`BL.CDT.5.D.C - deny create access if docData.uid doesn't match uid (${collectionNames.balanceDocs})`, async () => {
    const authedDb = testEnv.authenticatedContext(balanceDoc1.uid).firestore();
    const docRef = doc(authedDb, collectionNames.balanceDocs, balanceDoc1.id);

    const newDoc = creatifyDoc({ ...balanceDoc1, uid: `${balanceDoc1.uid}_` });

    const result = await fsUtils.isRequestDenied(setDoc(docRef, newDoc));
    expect(result.permissionDenied).toBe(true);
  });
  it(`BL.CDT.6.D.C - deny create access if docData.value is not a number (${collectionNames.balanceDocs})`, async () => {
    const authedDb = testEnv.authenticatedContext(balanceDoc1.uid).firestore();
    const docRef = doc(authedDb, collectionNames.balanceDocs, balanceDoc1.id);

    const newDoc = creatifyDoc({ ...balanceDoc1, value: `0` });

    const result = await fsUtils.isRequestDenied(setDoc(docRef, newDoc));
    expect(result.permissionDenied).toBe(true);
  });
  it(`BL.CDT.7.D.C - deny create access if docData.uploadIntentIds is not an empty object (${collectionNames.balanceDocs})`, async () => {
    const authedDb = testEnv.authenticatedContext(balanceDoc1.id).firestore();

    const docRef1 = doc(authedDb, collectionNames.balanceDocs, balanceDoc1.id);
    const newDoc1 = { ...creatifyDoc(balanceDoc1), uploadIntentIds: "" };
    const docRef2 = doc(authedDb, collectionNames.balanceDocs, balanceDoc1.id);
    const newDoc2 = { ...creatifyDoc(balanceDoc1), uploadIntentIds: { id1: true } };

    const promises = [
      fsUtils.isRequestDenied(setDoc(docRef1, newDoc1)),
      fsUtils.isRequestDenied(setDoc(docRef2, newDoc2)),
    ];
    const results = await Promise.all(promises);
    const isAllDenied = results.every((x) => x.permissionDenied);
    expect(isAllDenied).toBe(true);
  });
  it(`BL.CDT.8.D.C - deny create access if docData.createdAt is not timestamp (${collectionNames.balanceDocs})`, async () => {
    const authedDb = testEnv.authenticatedContext(balanceDoc1.id).firestore();

    const docRef1 = doc(authedDb, collectionNames.balanceDocs, balanceDoc1.id);
    const newDoc1 = { ...creatifyDoc(balanceDoc1), createdAt: "" };
    const docRef2 = doc(authedDb, collectionNames.balanceDocs, balanceDoc1.id);
    const newDoc2 = { ...creatifyDoc(balanceDoc1), createdAt: getNotNowTimestamp() };

    const promises = [
      fsUtils.isRequestDenied(setDoc(docRef1, newDoc1)),
      fsUtils.isRequestDenied(setDoc(docRef2, newDoc2)),
    ];
    const results = await Promise.all(promises);
    const isAllDenied = results.every((x) => x.permissionDenied);
    expect(isAllDenied).toBe(true);
  });
  it(`BL.CDT.9.D.C - deny create access if docData.updatedAt is not timestamp (${collectionNames.balanceDocs})`, async () => {
    const authedDb = testEnv.authenticatedContext(balanceDoc1.id).firestore();

    const docRef1 = doc(authedDb, collectionNames.balanceDocs, balanceDoc1.id);
    const newDoc1 = { ...creatifyDoc(balanceDoc1), updatedAt: "" };
    const docRef2 = doc(authedDb, collectionNames.balanceDocs, balanceDoc1.id);
    const newDoc2 = { ...creatifyDoc(balanceDoc1), updatedAt: getNotNowTimestamp() };

    const promises = [
      fsUtils.isRequestDenied(setDoc(docRef1, newDoc1)),
      fsUtils.isRequestDenied(setDoc(docRef2, newDoc2)),
    ];
    const results = await Promise.all(promises);
    const isAllDenied = results.every((x) => x.permissionDenied);
    expect(isAllDenied).toBe(true);
  });
  it(`BL.CDT.10.D.C - deny create access if docData.currentUploadIntentNumber is not a number (${collectionNames.balanceDocs})`, async () => {
    const authedDb = testEnv.authenticatedContext(balanceDoc1.id).firestore();

    const docRef1 = doc(authedDb, collectionNames.balanceDocs, balanceDoc1.id);
    const newDoc1 = { ...creatifyDoc(balanceDoc1), currentUploadIntentNumber: "0" };

    const results = await fsUtils.isRequestDenied(setDoc(docRef1, newDoc1));
    expect(results.permissionDenied).toBe(true);
  });
  it(`BL.C.1.D - deny create access if docData.value is not 0 (${collectionNames.balanceDocs})`, async () => {
    const authedDb = testEnv.authenticatedContext(balanceDoc1.id).firestore();

    const docRef1 = doc(authedDb, collectionNames.balanceDocs, balanceDoc1.id);
    const newDoc1 = { ...creatifyDoc(balanceDoc1), value: 1 };
    const docRef2 = doc(authedDb, collectionNames.balanceDocs, balanceDoc1.id);
    const newDoc2 = { ...creatifyDoc(balanceDoc1), value: -1 };

    const promises = [
      fsUtils.isRequestDenied(setDoc(docRef1, newDoc1)),
      fsUtils.isRequestDenied(setDoc(docRef2, newDoc2)),
    ];
    const results = await Promise.all(promises);
    const isAllDenied = results.every((x) => x.permissionDenied);
    expect(isAllDenied).toBe(true);
  });
  it(`BL.C.2.D - deny create access if docData.uploadIntentIds is not {} (${collectionNames.balanceDocs})`, async () => {
    const authedDb = testEnv.authenticatedContext(balanceDoc1.id).firestore();

    const docRef = doc(authedDb, collectionNames.balanceDocs, balanceDoc1.id);
    const newDoc = { ...creatifyDoc(balanceDoc1), uploadIntentIds: { id1: true } };

    const result = await fsUtils.isRequestDenied(setDoc(docRef, newDoc));
    expect(result.permissionDenied).toBe(true);
  });
  it(`BL.C.3.D - deny create access if docData.createdAt is not now (${collectionNames.balanceDocs})`, async () => {
    const authedDb = testEnv.authenticatedContext(balanceDoc1.id).firestore();

    const docRef = doc(authedDb, collectionNames.balanceDocs, balanceDoc1.id);
    const newDoc = { ...creatifyDoc(balanceDoc1), createdAt: getNotNowTimestamp() };

    const result = await fsUtils.isRequestDenied(setDoc(docRef, newDoc));
    expect(result.permissionDenied).toBe(true);
  });
  it(`BL.C.4.D - deny create access if docData.updatedAt is not now (${collectionNames.balanceDocs})`, async () => {
    const authedDb = testEnv.authenticatedContext(balanceDoc1.id).firestore();

    const docRef = doc(authedDb, collectionNames.balanceDocs, balanceDoc1.id);
    const newDoc = { ...creatifyDoc(balanceDoc1), updatedAt: getNotNowTimestamp() };

    const result = await fsUtils.isRequestDenied(setDoc(docRef, newDoc));
    expect(result.permissionDenied).toBe(true);
  });
  it(`BL.C.5.D - deny create access if docData.currentUploadIntentNumber is not 0 (${collectionNames.balanceDocs})`, async () => {
    const authedDb = testEnv.authenticatedContext(balanceDoc1.id).firestore();

    const docRef1 = doc(authedDb, collectionNames.balanceDocs, balanceDoc1.id);
    const newDoc1 = { ...creatifyDoc(balanceDoc1), currentUploadIntentNumber: 1 };

    const results = await fsUtils.isRequestDenied(setDoc(docRef1, newDoc1));
    expect(results.permissionDenied).toBe(true);
  });
});
