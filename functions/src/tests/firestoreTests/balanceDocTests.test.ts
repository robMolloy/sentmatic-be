import { RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc } from "firebase/firestore";
import {
  incrementBalanceDoc,
  TBalanceDoc,
  updatableBalanceDocKeys,
} from "../../modules/balanceDocs";

import { fbTestUtils } from "../testUtils/firebaseTestUtils";
import {
  creatifyDoc,
  getNotNowTimestamp,
  removeKey,
  updatifyDoc,
} from "../../../src/utils/firestoreUtils";
import { firestoreCollectionNames } from "../../modules/firebaseMetadata";
import { balanceDoc1, balanceDoc2, balanceDoc3 } from "./mocks/mockData";
import { firebaseConfig } from "../../config/firebaseConfig";

let testEnv: RulesTestEnvironment;

describe("balanceDocTests", () => {
  beforeAll(async () => {
    fbTestUtils.setDefaultLogLevel();
    testEnv = await fbTestUtils.createTestEnvironment({ projectId: firebaseConfig.projectId });
  });
  beforeEach(async () => {
    await testEnv.clearFirestore();
  });
  afterAll(async () => {
    await testEnv.cleanup();
  });
  it(`BL.C.0.A - approve if valid (${firestoreCollectionNames.balanceDocs})`, async () => {
    const authedDb = testEnv.authenticatedContext(balanceDoc1.id).firestore();
    const docRef = doc(authedDb, firestoreCollectionNames.balanceDocs, balanceDoc1.id);
    const response = await fbTestUtils.isRequestGranted(
      setDoc(docRef, creatifyDoc({ ...balanceDoc1 }))
    );
    expect(response.permissionGranted).toBe(true);
  });
  it(`BL.CDT.1.D.C - deny create access if missing a key (${firestoreCollectionNames.balanceDocs})`, async () => {
    const authedDb = testEnv.authenticatedContext(balanceDoc1.id).firestore();
    const docRef = doc(authedDb, firestoreCollectionNames.balanceDocs, balanceDoc1.id);

    const createDocKeys = Object.keys(balanceDoc1) as (keyof TBalanceDoc)[];
    const missingKeyDocs = createDocKeys.map((key) => removeKey(key, creatifyDoc(balanceDoc1)));

    const promises = missingKeyDocs.map((x) => fbTestUtils.isRequestDenied(setDoc(docRef, x)));
    const results = await Promise.all(promises);
    const isAllDenied = results.every((x) => x.permissionDenied);
    expect(isAllDenied).toBe(true);
  });
  it(`BL.CDT.2.D.C - deny create access if additional key (${firestoreCollectionNames.balanceDocs})`, async () => {
    const authedDb = testEnv.authenticatedContext(balanceDoc1.id).firestore();
    const docRef = doc(authedDb, firestoreCollectionNames.balanceDocs, balanceDoc1.id);

    const additionalKeyDoc = { ...creatifyDoc(balanceDoc1), addKey: "addKey" };

    const result = await fbTestUtils.isRequestDenied(setDoc(docRef, additionalKeyDoc));
    expect(result.permissionDenied).toBe(true);
  });
  it(`BL.CDT.3.D.C - deny create access if docData.id doesn't match docId (${firestoreCollectionNames.balanceDocs})`, async () => {
    const authedDb = testEnv.authenticatedContext(balanceDoc1.id).firestore();

    const docRef1 = doc(authedDb, firestoreCollectionNames.balanceDocs, balanceDoc1.id);
    const newDoc1 = { ...creatifyDoc(balanceDoc1), id: "randomId" };

    const docRef2 = doc(authedDb, firestoreCollectionNames.balanceDocs, "randomId");
    const newDoc2 = creatifyDoc(balanceDoc1);

    const promises = [
      fbTestUtils.isRequestDenied(setDoc(docRef1, newDoc1)),
      fbTestUtils.isRequestDenied(setDoc(docRef2, newDoc2)),
    ];
    const results = await Promise.all(promises);
    const isAllDenied = results.every((x) => x.permissionDenied);
    expect(isAllDenied).toBe(true);
  });
  it(`BL.CDT.4.D.C - deny create access if docData.id doesn't match uid (${firestoreCollectionNames.balanceDocs})`, async () => {
    const authedDb = testEnv.authenticatedContext("randomId").firestore();
    const docRef = doc(authedDb, firestoreCollectionNames.balanceDocs, balanceDoc1.id);

    const newDoc = creatifyDoc(balanceDoc1);

    const result = await fbTestUtils.isRequestDenied(setDoc(docRef, newDoc));
    expect(result.permissionDenied).toBe(true);
  });
  it(`BL.CDT.5.D.C - deny create access if docData.uid doesn't match uid (${firestoreCollectionNames.balanceDocs})`, async () => {
    const authedDb = testEnv.authenticatedContext(balanceDoc1.uid).firestore();
    const docRef = doc(authedDb, firestoreCollectionNames.balanceDocs, balanceDoc1.id);

    const newDoc = creatifyDoc({ ...balanceDoc1, uid: `${balanceDoc1.uid}_` });

    const result = await fbTestUtils.isRequestDenied(setDoc(docRef, newDoc));
    expect(result.permissionDenied).toBe(true);
  });
  it(`BL.CDT.6.D.C - deny create access if docData.value is not a number (${firestoreCollectionNames.balanceDocs})`, async () => {
    const authedDb = testEnv.authenticatedContext(balanceDoc1.uid).firestore();
    const docRef = doc(authedDb, firestoreCollectionNames.balanceDocs, balanceDoc1.id);

    const newDoc = creatifyDoc({ ...balanceDoc1, value: `0` });

    const result = await fbTestUtils.isRequestDenied(setDoc(docRef, newDoc));
    expect(result.permissionDenied).toBe(true);
  });
  it(`BL.CDT.7.D.C - deny create access if docData.uploadIntentIds is not an empty object (${firestoreCollectionNames.balanceDocs})`, async () => {
    const authedDb = testEnv.authenticatedContext(balanceDoc1.id).firestore();

    const docRef1 = doc(authedDb, firestoreCollectionNames.balanceDocs, balanceDoc1.id);
    const newDoc1 = { ...creatifyDoc(balanceDoc1), uploadIntentIds: "" };
    const docRef2 = doc(authedDb, firestoreCollectionNames.balanceDocs, balanceDoc1.id);
    const newDoc2 = { ...creatifyDoc(balanceDoc1), uploadIntentIds: { id1: true } };

    const promises = [
      fbTestUtils.isRequestDenied(setDoc(docRef1, newDoc1)),
      fbTestUtils.isRequestDenied(setDoc(docRef2, newDoc2)),
    ];
    const results = await Promise.all(promises);
    const isAllDenied = results.every((x) => x.permissionDenied);
    expect(isAllDenied).toBe(true);
  });
  it(`BL.CDT.8.D.C - deny create access if docData.createdAt is not timestamp (${firestoreCollectionNames.balanceDocs})`, async () => {
    const authedDb = testEnv.authenticatedContext(balanceDoc1.id).firestore();

    const docRef1 = doc(authedDb, firestoreCollectionNames.balanceDocs, balanceDoc1.id);
    const newDoc1 = { ...creatifyDoc(balanceDoc1), createdAt: "" };
    const docRef2 = doc(authedDb, firestoreCollectionNames.balanceDocs, balanceDoc1.id);
    const newDoc2 = { ...creatifyDoc(balanceDoc1), createdAt: getNotNowTimestamp() };

    const promises = [
      fbTestUtils.isRequestDenied(setDoc(docRef1, newDoc1)),
      fbTestUtils.isRequestDenied(setDoc(docRef2, newDoc2)),
    ];
    const results = await Promise.all(promises);
    const isAllDenied = results.every((x) => x.permissionDenied);
    expect(isAllDenied).toBe(true);
  });
  it(`BL.CDT.9.D.C - deny create access if docData.updatedAt is not timestamp (${firestoreCollectionNames.balanceDocs})`, async () => {
    const authedDb = testEnv.authenticatedContext(balanceDoc1.id).firestore();

    const docRef1 = doc(authedDb, firestoreCollectionNames.balanceDocs, balanceDoc1.id);
    const newDoc1 = { ...creatifyDoc(balanceDoc1), updatedAt: "" };
    const docRef2 = doc(authedDb, firestoreCollectionNames.balanceDocs, balanceDoc1.id);
    const newDoc2 = { ...creatifyDoc(balanceDoc1), updatedAt: getNotNowTimestamp() };

    const promises = [
      fbTestUtils.isRequestDenied(setDoc(docRef1, newDoc1)),
      fbTestUtils.isRequestDenied(setDoc(docRef2, newDoc2)),
    ];
    const results = await Promise.all(promises);
    const isAllDenied = results.every((x) => x.permissionDenied);
    expect(isAllDenied).toBe(true);
  });
  it(`BL.CDT.10.D.C - deny create access if docData.currentUploadIntentNumber is not a number (${firestoreCollectionNames.balanceDocs})`, async () => {
    const authedDb = testEnv.authenticatedContext(balanceDoc1.id).firestore();

    const docRef1 = doc(authedDb, firestoreCollectionNames.balanceDocs, balanceDoc1.id);
    const newDoc1 = { ...creatifyDoc(balanceDoc1), currentUploadIntentNumber: "0" };

    const results = await fbTestUtils.isRequestDenied(setDoc(docRef1, newDoc1));
    expect(results.permissionDenied).toBe(true);
  });
  it(`BL.C.1.D - deny create access if docData.value is not 0 (${firestoreCollectionNames.balanceDocs})`, async () => {
    const authedDb = testEnv.authenticatedContext(balanceDoc1.id).firestore();

    const docRef1 = doc(authedDb, firestoreCollectionNames.balanceDocs, balanceDoc1.id);
    const newDoc1 = { ...creatifyDoc(balanceDoc1), value: 1 };
    const docRef2 = doc(authedDb, firestoreCollectionNames.balanceDocs, balanceDoc1.id);
    const newDoc2 = { ...creatifyDoc(balanceDoc1), value: -1 };

    const promises = [
      fbTestUtils.isRequestDenied(setDoc(docRef1, newDoc1)),
      fbTestUtils.isRequestDenied(setDoc(docRef2, newDoc2)),
    ];
    const results = await Promise.all(promises);
    const isAllDenied = results.every((x) => x.permissionDenied);
    expect(isAllDenied).toBe(true);
  });
  it(`BL.C.2.D - deny create access if docData.uploadIntentIds is not {} (${firestoreCollectionNames.balanceDocs})`, async () => {
    const authedDb = testEnv.authenticatedContext(balanceDoc1.id).firestore();

    const docRef = doc(authedDb, firestoreCollectionNames.balanceDocs, balanceDoc1.id);
    const newDoc = { ...creatifyDoc(balanceDoc1), uploadIntentIds: { id1: true } };

    const result = await fbTestUtils.isRequestDenied(setDoc(docRef, newDoc));
    expect(result.permissionDenied).toBe(true);
  });
  it(`BL.C.3.D - deny create access if docData.createdAt is not now (${firestoreCollectionNames.balanceDocs})`, async () => {
    const authedDb = testEnv.authenticatedContext(balanceDoc1.id).firestore();

    const docRef = doc(authedDb, firestoreCollectionNames.balanceDocs, balanceDoc1.id);
    const newDoc = { ...creatifyDoc(balanceDoc1), createdAt: getNotNowTimestamp() };

    const result = await fbTestUtils.isRequestDenied(setDoc(docRef, newDoc));
    expect(result.permissionDenied).toBe(true);
  });
  it(`BL.C.4.D - deny create access if docData.updatedAt is not now (${firestoreCollectionNames.balanceDocs})`, async () => {
    const authedDb = testEnv.authenticatedContext(balanceDoc1.id).firestore();

    const docRef = doc(authedDb, firestoreCollectionNames.balanceDocs, balanceDoc1.id);
    const newDoc = { ...creatifyDoc(balanceDoc1), updatedAt: getNotNowTimestamp() };

    const result = await fbTestUtils.isRequestDenied(setDoc(docRef, newDoc));
    expect(result.permissionDenied).toBe(true);
  });
  it(`BL.C.5.D - deny create access if docData.currentUploadIntentNumber is not 0 (${firestoreCollectionNames.balanceDocs})`, async () => {
    const authedDb = testEnv.authenticatedContext(balanceDoc1.id).firestore();

    const docRef1 = doc(authedDb, firestoreCollectionNames.balanceDocs, balanceDoc1.id);
    const newDoc1 = { ...creatifyDoc(balanceDoc1), currentUploadIntentNumber: 1 };

    const results = await fbTestUtils.isRequestDenied(setDoc(docRef1, newDoc1));
    expect(results.permissionDenied).toBe(true);
  });
  it(`BL.U.0.A - approve update access if valid (${firestoreCollectionNames.balanceDocs})`, async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const docRef = doc(context.firestore(), firestoreCollectionNames.balanceDocs, balanceDoc2.id);
      await setDoc(docRef, balanceDoc2);
    });
    const authedDb = testEnv.authenticatedContext(balanceDoc2.id).firestore();
    const docRef = doc(authedDb, firestoreCollectionNames.balanceDocs, balanceDoc2.id);

    const newDoc = incrementBalanceDoc(balanceDoc2);
    const response = await fbTestUtils.isRequestGranted(setDoc(docRef, updatifyDoc(newDoc)));
    expect(response.permissionGranted).toBe(true);
  });
  it(`BL.CDT.1.D.U - deny update access if missing a key (${firestoreCollectionNames.balanceDocs})`, async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const docRef = doc(context.firestore(), firestoreCollectionNames.balanceDocs, balanceDoc2.id);
      await setDoc(docRef, balanceDoc2);
    });
    const authedDb = testEnv.authenticatedContext(balanceDoc2.id).firestore();
    const docRef = doc(authedDb, firestoreCollectionNames.balanceDocs, balanceDoc2.id);

    const updatedDoc = updatifyDoc(incrementBalanceDoc(balanceDoc2));
    const createDocKeys = Object.keys(updatedDoc) as (keyof TBalanceDoc)[];
    const missingKeyDocs = createDocKeys.map((key) => removeKey(key, updatedDoc));

    const promises = missingKeyDocs.map((x) => fbTestUtils.isRequestDenied(setDoc(docRef, x)));
    const results = await Promise.all(promises);
    const isAllDenied = results.every((x) => x.permissionDenied);
    expect(isAllDenied).toBe(true);
  });
  it(`BL.CDT.2.D.U - deny update access if additional key (${firestoreCollectionNames.balanceDocs})`, async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const docRef = doc(context.firestore(), firestoreCollectionNames.balanceDocs, balanceDoc2.id);
      await setDoc(docRef, balanceDoc2);
    });
    const authedDb = testEnv.authenticatedContext(balanceDoc2.id).firestore();
    const docRef = doc(authedDb, firestoreCollectionNames.balanceDocs, balanceDoc2.id);
    const updatedDoc = updatifyDoc(incrementBalanceDoc(balanceDoc2));

    const additionalKeyDoc = { ...updatedDoc, addKey: "addKey" };

    const result = await fbTestUtils.isRequestDenied(setDoc(docRef, additionalKeyDoc));
    expect(result.permissionDenied).toBe(true);
  });
  it(`BL.CDT.3.D.U - deny update access if docData.id doesn't match docId (${firestoreCollectionNames.balanceDocs})`, async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const docRef = doc(context.firestore(), firestoreCollectionNames.balanceDocs, balanceDoc2.id);
      await setDoc(docRef, balanceDoc2);
    });
    const authedDb = testEnv.authenticatedContext(balanceDoc2.id).firestore();

    const updatedDoc = updatifyDoc(incrementBalanceDoc(balanceDoc2));
    const docRef1 = doc(authedDb, firestoreCollectionNames.balanceDocs, balanceDoc2.id);
    const newDoc1 = { ...updatedDoc, id: "randomId" };

    const docRef2 = doc(authedDb, firestoreCollectionNames.balanceDocs, "randomId");
    const newDoc2 = updatedDoc;

    const promises = [
      fbTestUtils.isRequestDenied(setDoc(docRef1, newDoc1)),
      fbTestUtils.isRequestDenied(setDoc(docRef2, newDoc2)),
    ];
    const results = await Promise.all(promises);
    const isAllDenied = results.every((x) => x.permissionDenied);
    expect(isAllDenied).toBe(true);
  });
  it(`BL.CDT.4.D.U - deny update access if docData.id doesn't match uid (${firestoreCollectionNames.balanceDocs})`, async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const docRef = doc(context.firestore(), firestoreCollectionNames.balanceDocs, balanceDoc2.id);
      await setDoc(docRef, balanceDoc2);
    });
    const authedDb = testEnv.authenticatedContext("randomId").firestore();
    const docRef = doc(authedDb, firestoreCollectionNames.balanceDocs, balanceDoc2.id);

    const updatedDoc = updatifyDoc(incrementBalanceDoc(balanceDoc2));

    const result = await fbTestUtils.isRequestDenied(setDoc(docRef, updatedDoc));
    expect(result.permissionDenied).toBe(true);
  });
  it(`BL.CDT.5.D.U - deny update access if docData.uid doesn't match uid (${firestoreCollectionNames.balanceDocs})`, async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const docRef = doc(context.firestore(), firestoreCollectionNames.balanceDocs, balanceDoc2.id);
      await setDoc(docRef, balanceDoc2);
    });
    const authedDb = testEnv.authenticatedContext(balanceDoc2.uid).firestore();
    const docRef = doc(authedDb, firestoreCollectionNames.balanceDocs, balanceDoc2.id);

    const updatedDoc = updatifyDoc(
      incrementBalanceDoc({ ...balanceDoc2, uid: `${balanceDoc2.uid}_` })
    );

    const result = await fbTestUtils.isRequestDenied(setDoc(docRef, updatedDoc));
    expect(result.permissionDenied).toBe(true);
  });
  it(`BL.CDT.6.D.U - deny update access if docData.value is not a number (${firestoreCollectionNames.balanceDocs})`, async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const docRef = doc(context.firestore(), firestoreCollectionNames.balanceDocs, balanceDoc2.id);
      await setDoc(docRef, balanceDoc2);
    });
    const authedDb = testEnv.authenticatedContext(balanceDoc2.uid).firestore();
    const docRef = doc(authedDb, firestoreCollectionNames.balanceDocs, balanceDoc2.id);

    const updatedDoc = updatifyDoc({ ...incrementBalanceDoc({ ...balanceDoc2 }), value: `0` });

    const result = await fbTestUtils.isRequestDenied(setDoc(docRef, updatedDoc));
    expect(result.permissionDenied).toBe(true);
  });
  it(`BL.CDT.7.D.U - deny update access if docData.uploadIntentIds is not an empty object (${firestoreCollectionNames.balanceDocs})`, async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const docRef = doc(context.firestore(), firestoreCollectionNames.balanceDocs, balanceDoc2.id);
      await setDoc(docRef, balanceDoc2);
    });
    const authedDb = testEnv.authenticatedContext(balanceDoc2.id).firestore();

    const docRef1 = doc(authedDb, firestoreCollectionNames.balanceDocs, balanceDoc2.id);
    const updatedDoc1 = updatifyDoc({ ...incrementBalanceDoc(balanceDoc2), uploadIntentIds: "" });
    const docRef2 = doc(authedDb, firestoreCollectionNames.balanceDocs, balanceDoc2.id);
    const updatedDoc2 = updatifyDoc({
      ...incrementBalanceDoc(balanceDoc2),
      uploadIntentIds: { id1: true },
    });

    const promises = [
      fbTestUtils.isRequestDenied(setDoc(docRef1, updatedDoc1)),
      fbTestUtils.isRequestDenied(setDoc(docRef2, updatedDoc2)),
    ];
    const results = await Promise.all(promises);
    const isAllDenied = results.every((x) => x.permissionDenied);
    expect(isAllDenied).toBe(true);
  });
  it(`BL.CDT.8.D.U - deny update access if docData.createdAt is not timestamp (${firestoreCollectionNames.balanceDocs})`, async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const docRef = doc(context.firestore(), firestoreCollectionNames.balanceDocs, balanceDoc2.id);
      await setDoc(docRef, balanceDoc2);
    });
    const authedDb = testEnv.authenticatedContext(balanceDoc2.id).firestore();

    const docRef1 = doc(authedDb, firestoreCollectionNames.balanceDocs, balanceDoc2.id);
    const updatedDoc1 = { ...updatifyDoc({ ...incrementBalanceDoc(balanceDoc2) }), createdAt: "" };
    const docRef2 = doc(authedDb, firestoreCollectionNames.balanceDocs, balanceDoc2.id);
    const updatedDoc2 = {
      ...updatifyDoc({ ...incrementBalanceDoc(balanceDoc2) }),
      createdAt: getNotNowTimestamp(),
    };

    const promises = [
      fbTestUtils.isRequestDenied(setDoc(docRef1, updatedDoc1)),
      fbTestUtils.isRequestDenied(setDoc(docRef2, updatedDoc2)),
    ];
    const results = await Promise.all(promises);
    const isAllDenied = results.every((x) => x.permissionDenied);
    expect(isAllDenied).toBe(true);
  });
  it(`BL.CDT.9.D.U - deny update access if docData.updatedAt is not timestamp (${firestoreCollectionNames.balanceDocs})`, async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const docRef = doc(context.firestore(), firestoreCollectionNames.balanceDocs, balanceDoc2.id);
      await setDoc(docRef, balanceDoc2);
    });
    const authedDb = testEnv.authenticatedContext(balanceDoc2.id).firestore();

    const docRef1 = doc(authedDb, firestoreCollectionNames.balanceDocs, balanceDoc2.id);
    const updatedDoc1 = { ...updatifyDoc({ ...incrementBalanceDoc(balanceDoc2) }), updatedAt: "" };
    const docRef2 = doc(authedDb, firestoreCollectionNames.balanceDocs, balanceDoc2.id);
    const updatedDoc2 = {
      ...updatifyDoc({ ...incrementBalanceDoc(balanceDoc2) }),
      updatedAt: getNotNowTimestamp(),
    };

    const promises = [
      fbTestUtils.isRequestDenied(setDoc(docRef1, updatedDoc1)),
      fbTestUtils.isRequestDenied(setDoc(docRef2, updatedDoc2)),
    ];
    const results = await Promise.all(promises);
    const isAllDenied = results.every((x) => x.permissionDenied);
    expect(isAllDenied).toBe(true);
  });
  it(`BL.CDT.10.D.U - deny update access if docData.currentUploadIntentNumber is not a number (${firestoreCollectionNames.balanceDocs})`, async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const docRef = doc(context.firestore(), firestoreCollectionNames.balanceDocs, balanceDoc2.id);
      await setDoc(docRef, balanceDoc2);
    });
    const authedDb = testEnv.authenticatedContext(balanceDoc2.id).firestore();

    const docRef1 = doc(authedDb, firestoreCollectionNames.balanceDocs, balanceDoc2.id);
    const updatedDoc1 = updatifyDoc({
      ...incrementBalanceDoc(balanceDoc2),
      currentUploadIntentNumber: "0",
    });

    const results = await fbTestUtils.isRequestDenied(setDoc(docRef1, updatedDoc1));
    expect(results.permissionDenied).toBe(true);
  });
  it(`BL.U.1.D - deny update access if docData has an updatable key missing (${firestoreCollectionNames.balanceDocs})`, async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const docRef = doc(context.firestore(), firestoreCollectionNames.balanceDocs, balanceDoc2.id);
      await setDoc(docRef, balanceDoc2);
    });
    const authedDb = testEnv.authenticatedContext(balanceDoc2.id).firestore();
    const docRef = doc(authedDb, firestoreCollectionNames.balanceDocs, balanceDoc2.id);

    const successDoc = updatifyDoc({ ...incrementBalanceDoc(balanceDoc2) });

    const missingKeyDocs = updatableBalanceDocKeys.map((key) => removeKey(key, successDoc));
    const promises = missingKeyDocs.map((x) => fbTestUtils.isRequestDenied(setDoc(docRef, x)));
    const results = await Promise.all(promises);

    const isAllDenied = results.every((x) => x.permissionDenied);
    expect(isAllDenied).toBe(true);
  });
  it(`BL.U.2.D - deny update access if docData has an additional key (${firestoreCollectionNames.balanceDocs})`, async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const docRef = doc(context.firestore(), firestoreCollectionNames.balanceDocs, balanceDoc2.id);
      await setDoc(docRef, balanceDoc2);
    });
    const authedDb = testEnv.authenticatedContext(balanceDoc2.id).firestore();
    const docRef = doc(authedDb, firestoreCollectionNames.balanceDocs, balanceDoc2.id);

    const successDoc = updatifyDoc({ ...incrementBalanceDoc(balanceDoc2) });
    const addKeyDoc = { ...successDoc, newKey: "newValue" };

    const result = await fbTestUtils.isRequestDenied(setDoc(docRef, addKeyDoc));
    expect(result.permissionDenied).toBe(true);
  });
  it(`BL.U.3.D - deny update access if docData.updatedAt is not now (${firestoreCollectionNames.balanceDocs})`, async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const docRef = doc(context.firestore(), firestoreCollectionNames.balanceDocs, balanceDoc2.id);
      await setDoc(docRef, balanceDoc2);
    });
    const authedDb = testEnv.authenticatedContext(balanceDoc2.id).firestore();
    const docRef = doc(authedDb, firestoreCollectionNames.balanceDocs, balanceDoc2.id);

    const successDoc = updatifyDoc({ ...incrementBalanceDoc(balanceDoc2) });
    const updatedDoc = { ...successDoc, updatedAt: getNotNowTimestamp() };

    const result = await fbTestUtils.isRequestDenied(setDoc(docRef, updatedDoc));
    expect(result.permissionDenied).toBe(true);
  });
  it(`BL.U.4.D - deny update access if docData.value is not existing.value-300 (${firestoreCollectionNames.balanceDocs})`, async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const docRef = doc(context.firestore(), firestoreCollectionNames.balanceDocs, balanceDoc2.id);
      await setDoc(docRef, balanceDoc2);
    });
    const authedDb = testEnv.authenticatedContext(balanceDoc2.id).firestore();
    const docRef = doc(authedDb, firestoreCollectionNames.balanceDocs, balanceDoc2.id);

    const successDoc = updatifyDoc({ ...incrementBalanceDoc(balanceDoc2) });
    const updatedDoc = { ...successDoc, value: successDoc.value + 1 };

    const result = await fbTestUtils.isRequestDenied(setDoc(docRef, updatedDoc));
    expect(result.permissionDenied).toBe(true);
  });
  it(`BL.U.5.D - deny update access if docData.value is < 0 (${firestoreCollectionNames.balanceDocs})`, async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const docRef = doc(context.firestore(), firestoreCollectionNames.balanceDocs, balanceDoc3.id);
      await setDoc(docRef, balanceDoc3);
    });
    const authedDb = testEnv.authenticatedContext(balanceDoc3.id).firestore();
    const docRef = doc(authedDb, firestoreCollectionNames.balanceDocs, balanceDoc3.id);

    const updatedDoc = updatifyDoc({ ...incrementBalanceDoc(balanceDoc3) });

    const result = await fbTestUtils.isRequestDenied(setDoc(docRef, updatedDoc));
    expect(result.permissionDenied).toBe(true);
  });
  it(`BL.U.6.D - deny update access if docData.currentUploadIntentNumber is not existing.currentUploadIntentNumber+1 (${firestoreCollectionNames.balanceDocs})`, async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const docRef = doc(context.firestore(), firestoreCollectionNames.balanceDocs, balanceDoc2.id);
      await setDoc(docRef, balanceDoc2);
    });
    const authedDb = testEnv.authenticatedContext(balanceDoc2.id).firestore();
    const docRef = doc(authedDb, firestoreCollectionNames.balanceDocs, balanceDoc2.id);

    const successDoc = updatifyDoc({ ...incrementBalanceDoc(balanceDoc2) });
    const updatedDoc = {
      ...successDoc,
      currentUploadIntentNumber: successDoc.currentUploadIntentNumber + 1,
    };

    const result = await fbTestUtils.isRequestDenied(setDoc(docRef, updatedDoc));
    expect(result.permissionDenied).toBe(true);
  });
  it(`BL.U.7.D - deny update access if docData.uploadIntentIds has additional key (${firestoreCollectionNames.balanceDocs})`, async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const docRef = doc(context.firestore(), firestoreCollectionNames.balanceDocs, balanceDoc2.id);
      await setDoc(docRef, balanceDoc2);
    });
    const authedDb = testEnv.authenticatedContext(balanceDoc2.id).firestore();
    const docRef = doc(authedDb, firestoreCollectionNames.balanceDocs, balanceDoc2.id);

    const successDocPreUpdate = { ...incrementBalanceDoc(balanceDoc2) };
    const successDoc = updatifyDoc({ ...successDocPreUpdate });
    const extraDocPreUpdate = { ...incrementBalanceDoc(successDocPreUpdate) };
    const updatedDoc = { ...successDoc, uploadIntentIds: extraDocPreUpdate.uploadIntentIds };

    const result = await fbTestUtils.isRequestDenied(setDoc(docRef, updatedDoc));
    expect(result.permissionDenied).toBe(true);
  });
  it(`BL.U.8.D - deny update access if docData.uploadIntentIds is missing key (${firestoreCollectionNames.balanceDocs})`, async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const docRef = doc(context.firestore(), firestoreCollectionNames.balanceDocs, balanceDoc2.id);
      await setDoc(docRef, balanceDoc2);
    });
    const authedDb = testEnv.authenticatedContext(balanceDoc2.id).firestore();
    const docRef = doc(authedDb, firestoreCollectionNames.balanceDocs, balanceDoc2.id);

    const successDoc = updatifyDoc({ ...incrementBalanceDoc(balanceDoc2) });
    const updatedDoc = { ...successDoc, uploadIntentIds: balanceDoc2.uploadIntentIds };

    const result = await fbTestUtils.isRequestDenied(setDoc(docRef, updatedDoc));
    expect(result.permissionDenied).toBe(true);
  });
  it(`BL.U.9.D - deny update access if docData.uploadIntentIds new key != false (${firestoreCollectionNames.balanceDocs})`, async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const docRef = doc(context.firestore(), firestoreCollectionNames.balanceDocs, balanceDoc2.id);
      await setDoc(docRef, balanceDoc2);
    });
    const authedDb = testEnv.authenticatedContext(balanceDoc2.id).firestore();
    const docRef = doc(authedDb, firestoreCollectionNames.balanceDocs, balanceDoc2.id);

    const successDoc = updatifyDoc({ ...incrementBalanceDoc(balanceDoc2) });
    const newUploadIntentId = `${balanceDoc2.uid}_${successDoc.currentUploadIntentNumber}`;
    const updatedDoc1 = {
      ...successDoc,
      uploadIntentIds: { ...successDoc.uploadIntentIds, [newUploadIntentId]: true },
    };
    const updatedDoc2 = {
      ...successDoc,
      uploadIntentIds: { ...successDoc.uploadIntentIds, [newUploadIntentId]: "false" },
    };

    const promises = [
      fbTestUtils.isRequestDenied(setDoc(docRef, updatedDoc1)),
      fbTestUtils.isRequestDenied(setDoc(docRef, updatedDoc2)),
    ];
    const results = await Promise.all(promises);

    const isAllDenied = results.every((x) => x.permissionDenied);
    expect(isAllDenied).toBe(true);
  });
  it(`BL.G.0.A - allow get access if id == auth.uid (${firestoreCollectionNames.balanceDocs})`, async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const docRef = doc(context.firestore(), firestoreCollectionNames.balanceDocs, balanceDoc2.id);
      await setDoc(docRef, balanceDoc2);
    });
    const authedDb = testEnv.authenticatedContext(balanceDoc2.id).firestore();
    const docRef = doc(authedDb, firestoreCollectionNames.balanceDocs, balanceDoc2.id);

    const result = await fbTestUtils.isRequestGranted(getDoc(docRef));
    expect(result.permissionGranted).toBe(true);
  });
  it(`BL.G.1.D - deny get access if id != auth.uid (${firestoreCollectionNames.balanceDocs})`, async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const docRef = doc(context.firestore(), firestoreCollectionNames.balanceDocs, balanceDoc2.id);
      await setDoc(docRef, balanceDoc2);
    });
    const authedDb = testEnv.authenticatedContext(`${balanceDoc2.id}_`).firestore();
    const docRef = doc(authedDb, firestoreCollectionNames.balanceDocs, balanceDoc2.id);

    const result = await fbTestUtils.isRequestDenied(getDoc(docRef));
    expect(result.permissionDenied).toBe(true);
  });
});
