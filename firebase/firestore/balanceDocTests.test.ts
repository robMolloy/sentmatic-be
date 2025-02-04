import { RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { z } from "zod";
import * as fsUtils from "./firebaseTestUtils/firebaseTestUtils";
import {
  creatifyDoc,
  getNotNowTimestamp,
  timestampSchema,
  updatifyDoc,
} from "./firebaseTestUtils/firestoreUtils";

export const removeKey = <T extends object, K extends keyof T>(key: K, object: T): Omit<T, K> => {
  const { [key]: _, ...rest } = object;
  return rest;
};

const incrementBalanceDoc = (p: TBalanceDoc) => {
  const nextUploadIntentNumber = p.currentUploadIntentNumber + 1;
  const nextUploadIntentId = `${p.uid}_${nextUploadIntentNumber}`;

  return {
    ...p,
    value: p.value - 300,
    currentUploadIntentNumber: nextUploadIntentNumber,
    uploadIntentIds: { ...p.uploadIntentIds, [nextUploadIntentId]: false },
  };
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
} as const satisfies TBalanceDoc;
const balanceDoc2 = {
  id: "uid124",
  uid: "uid124",
  value: 1000,
  currentUploadIntentNumber: 1,
  uploadIntentIds: { uid124_1: true },
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
} as const satisfies TBalanceDoc;

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
  it(`BL.C.0.A - approve if valid (${collectionNames.balanceDocs})`, async () => {
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
  it(`BL.U.0.A - approve update access if valid (${collectionNames.balanceDocs})`, async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const docRef = doc(context.firestore(), collectionNames.balanceDocs, balanceDoc2.id);
      await setDoc(docRef, balanceDoc2);
    });
    const authedDb = testEnv.authenticatedContext(balanceDoc2.id).firestore();
    const docRef = doc(authedDb, collectionNames.balanceDocs, balanceDoc2.id);

    const newDoc = incrementBalanceDoc(balanceDoc2);
    const response = await fsUtils.isRequestGranted(setDoc(docRef, updatifyDoc(newDoc)));
    expect(response.permissionGranted).toBe(true);
  });
  it(`BL.CDT.1.D.U - deny update access if missing a key (${collectionNames.balanceDocs})`, async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const docRef = doc(context.firestore(), collectionNames.balanceDocs, balanceDoc2.id);
      await setDoc(docRef, balanceDoc2);
    });
    const authedDb = testEnv.authenticatedContext(balanceDoc2.id).firestore();
    const docRef = doc(authedDb, collectionNames.balanceDocs, balanceDoc2.id);

    const updatedDoc = updatifyDoc(incrementBalanceDoc(balanceDoc2));
    const createDocKeys = Object.keys(updatedDoc) as (keyof TBalanceDoc)[];
    const missingKeyDocs = createDocKeys.map((key) => removeKey(key, updatedDoc));

    const promises = missingKeyDocs.map((x) => fsUtils.isRequestDenied(setDoc(docRef, x)));
    const results = await Promise.all(promises);
    const isAllDenied = results.every((x) => x.permissionDenied);
    expect(isAllDenied).toBe(true);
  });
  it(`BL.CDT.2.D.U - deny update access if additional key (${collectionNames.balanceDocs})`, async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const docRef = doc(context.firestore(), collectionNames.balanceDocs, balanceDoc2.id);
      await setDoc(docRef, balanceDoc2);
    });
    const authedDb = testEnv.authenticatedContext(balanceDoc2.id).firestore();
    const docRef = doc(authedDb, collectionNames.balanceDocs, balanceDoc2.id);
    const updatedDoc = updatifyDoc(incrementBalanceDoc(balanceDoc2));

    const additionalKeyDoc = { ...updatedDoc, addKey: "addKey" };

    const result = await fsUtils.isRequestDenied(setDoc(docRef, additionalKeyDoc));
    expect(result.permissionDenied).toBe(true);
  });
  it(`BL.CDT.3.D.U - deny update access if docData.id doesn't match docId (${collectionNames.balanceDocs})`, async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const docRef = doc(context.firestore(), collectionNames.balanceDocs, balanceDoc2.id);
      await setDoc(docRef, balanceDoc2);
    });
    const authedDb = testEnv.authenticatedContext(balanceDoc2.id).firestore();

    const updatedDoc = updatifyDoc(incrementBalanceDoc(balanceDoc2));
    const docRef1 = doc(authedDb, collectionNames.balanceDocs, balanceDoc2.id);
    const newDoc1 = { ...updatedDoc, id: "randomId" };

    const docRef2 = doc(authedDb, collectionNames.balanceDocs, "randomId");
    const newDoc2 = updatedDoc;

    const promises = [
      fsUtils.isRequestDenied(setDoc(docRef1, newDoc1)),
      fsUtils.isRequestDenied(setDoc(docRef2, newDoc2)),
    ];
    const results = await Promise.all(promises);
    const isAllDenied = results.every((x) => x.permissionDenied);
    expect(isAllDenied).toBe(true);
  });
  it(`BL.CDT.4.D.U - deny update access if docData.id doesn't match uid (${collectionNames.balanceDocs})`, async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const docRef = doc(context.firestore(), collectionNames.balanceDocs, balanceDoc2.id);
      await setDoc(docRef, balanceDoc2);
    });
    const authedDb = testEnv.authenticatedContext("randomId").firestore();
    const docRef = doc(authedDb, collectionNames.balanceDocs, balanceDoc2.id);

    const updatedDoc = updatifyDoc(incrementBalanceDoc(balanceDoc2));

    const result = await fsUtils.isRequestDenied(setDoc(docRef, updatedDoc));
    expect(result.permissionDenied).toBe(true);
  });
  it(`BL.CDT.5.D.U - deny update access if docData.uid doesn't match uid (${collectionNames.balanceDocs})`, async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const docRef = doc(context.firestore(), collectionNames.balanceDocs, balanceDoc2.id);
      await setDoc(docRef, balanceDoc2);
    });
    const authedDb = testEnv.authenticatedContext(balanceDoc2.uid).firestore();
    const docRef = doc(authedDb, collectionNames.balanceDocs, balanceDoc2.id);

    const updatedDoc = updatifyDoc(
      incrementBalanceDoc({ ...balanceDoc2, uid: `${balanceDoc2.uid}_` })
    );

    const result = await fsUtils.isRequestDenied(setDoc(docRef, updatedDoc));
    expect(result.permissionDenied).toBe(true);
  });
  it(`BL.CDT.6.D.U - deny update access if docData.value is not a number (${collectionNames.balanceDocs})`, async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const docRef = doc(context.firestore(), collectionNames.balanceDocs, balanceDoc2.id);
      await setDoc(docRef, balanceDoc2);
    });
    const authedDb = testEnv.authenticatedContext(balanceDoc2.uid).firestore();
    const docRef = doc(authedDb, collectionNames.balanceDocs, balanceDoc2.id);

    const updatedDoc = updatifyDoc({ ...incrementBalanceDoc({ ...balanceDoc2 }), value: `0` });

    const result = await fsUtils.isRequestDenied(setDoc(docRef, updatedDoc));
    expect(result.permissionDenied).toBe(true);
  });
  it(`BL.CDT.7.D.U - deny update access if docData.uploadIntentIds is not an empty object (${collectionNames.balanceDocs})`, async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const docRef = doc(context.firestore(), collectionNames.balanceDocs, balanceDoc2.id);
      await setDoc(docRef, balanceDoc2);
    });
    const authedDb = testEnv.authenticatedContext(balanceDoc2.id).firestore();

    const docRef1 = doc(authedDb, collectionNames.balanceDocs, balanceDoc2.id);
    const updatedDoc1 = updatifyDoc({ ...incrementBalanceDoc(balanceDoc2), uploadIntentIds: "" });
    const docRef2 = doc(authedDb, collectionNames.balanceDocs, balanceDoc2.id);
    const updatedDoc2 = updatifyDoc({
      ...incrementBalanceDoc(balanceDoc2),
      uploadIntentIds: { id1: true },
    });

    const promises = [
      fsUtils.isRequestDenied(setDoc(docRef1, updatedDoc1)),
      fsUtils.isRequestDenied(setDoc(docRef2, updatedDoc2)),
    ];
    const results = await Promise.all(promises);
    const isAllDenied = results.every((x) => x.permissionDenied);
    expect(isAllDenied).toBe(true);
  });
  it(`BL.CDT.8.D.U - deny update access if docData.createdAt is not timestamp (${collectionNames.balanceDocs})`, async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const docRef = doc(context.firestore(), collectionNames.balanceDocs, balanceDoc2.id);
      await setDoc(docRef, balanceDoc2);
    });
    const authedDb = testEnv.authenticatedContext(balanceDoc2.id).firestore();

    const docRef1 = doc(authedDb, collectionNames.balanceDocs, balanceDoc2.id);
    const updatedDoc1 = { ...updatifyDoc({ ...incrementBalanceDoc(balanceDoc2) }), createdAt: "" };
    const docRef2 = doc(authedDb, collectionNames.balanceDocs, balanceDoc2.id);
    const updatedDoc2 = {
      ...updatifyDoc({ ...incrementBalanceDoc(balanceDoc2) }),
      createdAt: getNotNowTimestamp(),
    };

    const promises = [
      fsUtils.isRequestDenied(setDoc(docRef1, updatedDoc1)),
      fsUtils.isRequestDenied(setDoc(docRef2, updatedDoc2)),
    ];
    const results = await Promise.all(promises);
    const isAllDenied = results.every((x) => x.permissionDenied);
    expect(isAllDenied).toBe(true);
  });
  it(`BL.CDT.9.D.U - deny update access if docData.updatedAt is not timestamp (${collectionNames.balanceDocs})`, async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const docRef = doc(context.firestore(), collectionNames.balanceDocs, balanceDoc2.id);
      await setDoc(docRef, balanceDoc2);
    });
    const authedDb = testEnv.authenticatedContext(balanceDoc2.id).firestore();

    const docRef1 = doc(authedDb, collectionNames.balanceDocs, balanceDoc2.id);
    const updatedDoc1 = { ...updatifyDoc({ ...incrementBalanceDoc(balanceDoc2) }), updatedAt: "" };
    const docRef2 = doc(authedDb, collectionNames.balanceDocs, balanceDoc2.id);
    const updatedDoc2 = {
      ...updatifyDoc({ ...incrementBalanceDoc(balanceDoc2) }),
      updatedAt: getNotNowTimestamp(),
    };

    const promises = [
      fsUtils.isRequestDenied(setDoc(docRef1, updatedDoc1)),
      fsUtils.isRequestDenied(setDoc(docRef2, updatedDoc2)),
    ];
    const results = await Promise.all(promises);
    const isAllDenied = results.every((x) => x.permissionDenied);
    expect(isAllDenied).toBe(true);
  });
  it(`BL.CDT.10.D.U - deny update access if docData.currentUploadIntentNumber is not a number (${collectionNames.balanceDocs})`, async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const docRef = doc(context.firestore(), collectionNames.balanceDocs, balanceDoc2.id);
      await setDoc(docRef, balanceDoc2);
    });
    const authedDb = testEnv.authenticatedContext(balanceDoc2.id).firestore();

    const docRef1 = doc(authedDb, collectionNames.balanceDocs, balanceDoc2.id);
    const newDoc1 = updatifyDoc({
      ...incrementBalanceDoc(balanceDoc2),
      currentUploadIntentNumber: "0",
    });

    const results = await fsUtils.isRequestDenied(setDoc(docRef1, newDoc1));
    expect(results.permissionDenied).toBe(true);
  });
});
