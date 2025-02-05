import { fbTestUtils, fsTestUtils } from "@/utils/firebaseTestUtils";
import { creatifyDoc } from "@/utils/firestoreUtils";
import { RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { doc, setDoc } from "firebase/firestore";
import { balanceDoc2, TUploadIntentDoc, uploadIntentDoc1 } from "@/mocks/mockData";
import { firestoreCollectionNames } from "@/mocks/metadata";

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

  it(`UI.C.0.A - approve create access if valid (${firestoreCollectionNames.uploadIntentDocs})`, async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const docRef = doc(context.firestore(), firestoreCollectionNames.balanceDocs, balanceDoc2.id);
      await setDoc(docRef, balanceDoc2);
    });
    const authedDb = testEnv.authenticatedContext(uploadIntentDoc1.uid).firestore();
    const docRef = doc(authedDb, firestoreCollectionNames.uploadIntentDocs, uploadIntentDoc1.id);

    const successDoc = creatifyDoc(uploadIntentDoc1);
    const result = await fbTestUtils.isRequestGranted(setDoc(docRef, successDoc));

    expect(result.permissionGranted).toBe(true);
  });
  it(`UI.CDT.1.D.C - deny create access if "incoming.keys().hasAll(keys)" is not met (${firestoreCollectionNames.uploadIntentDocs})`, async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const docRef = doc(context.firestore(), firestoreCollectionNames.balanceDocs, balanceDoc2.id);
      await setDoc(docRef, balanceDoc2);
    });
    const authedDb = testEnv.authenticatedContext(uploadIntentDoc1.uid).firestore();
    const docRef = doc(authedDb, firestoreCollectionNames.uploadIntentDocs, uploadIntentDoc1.id);

    const successDoc = creatifyDoc(uploadIntentDoc1);
    const createDocKeys = Object.keys(uploadIntentDoc1) as (keyof TUploadIntentDoc)[];
    const missingKeyDocs = createDocKeys.map((key) => fsTestUtils.removeKey(key, successDoc));

    const promises = missingKeyDocs.map((x) => fsTestUtils.isRequestDenied(setDoc(docRef, x)));
    const results = await Promise.all(promises);
    const isAllDenied = results.every((x) => x.permissionDenied);
    expect(isAllDenied).toBe(true);
  });
  it(`UI.CDT.2.D.C - deny create access if "incoming.keys().hasOnly(keys)" is not met (${firestoreCollectionNames.uploadIntentDocs})`, async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const docRef = doc(context.firestore(), firestoreCollectionNames.balanceDocs, balanceDoc2.id);
      await setDoc(docRef, balanceDoc2);
    });
    const authedDb = testEnv.authenticatedContext(uploadIntentDoc1.uid).firestore();
    const docRef = doc(authedDb, firestoreCollectionNames.uploadIntentDocs, uploadIntentDoc1.id);

    const successDoc = creatifyDoc(uploadIntentDoc1);
    const newDoc = { ...successDoc, addKey: "" };

    const result = await fbTestUtils.isRequestDenied(setDoc(docRef, newDoc));
    expect(result.permissionDenied).toBe(true);
  });
  it(`UI.CDT.3.D.C - deny create access if "incoming.id == getIncomingId()" is not met (${firestoreCollectionNames.uploadIntentDocs})`, async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const docRef = doc(context.firestore(), firestoreCollectionNames.balanceDocs, balanceDoc2.id);
      await setDoc(docRef, balanceDoc2);
    });
    const authedDb = testEnv.authenticatedContext(uploadIntentDoc1.uid).firestore();
    const docRef = doc(authedDb, firestoreCollectionNames.uploadIntentDocs, uploadIntentDoc1.id);

    const successDoc = creatifyDoc(uploadIntentDoc1);
    const newDoc = { ...successDoc, id: `${successDoc.id}_` };

    const result = await fbTestUtils.isRequestDenied(setDoc(docRef, newDoc));
    expect(result.permissionDenied).toBe(true);
  });
  it(`UI.CDT.4.D.C - deny create access if "incoming.uid == getIncomingAuth().uid" is not met (${firestoreCollectionNames.uploadIntentDocs})`, async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const docRef = doc(context.firestore(), firestoreCollectionNames.balanceDocs, balanceDoc2.id);
      await setDoc(docRef, balanceDoc2);
    });
    const authedDb = testEnv.authenticatedContext(uploadIntentDoc1.uid).firestore();
    const docRef = doc(authedDb, firestoreCollectionNames.uploadIntentDocs, uploadIntentDoc1.id);

    const successDoc = creatifyDoc(uploadIntentDoc1);
    const newDoc = { ...successDoc, uid: `${successDoc.uid}_` };

    const result = await fbTestUtils.isRequestDenied(setDoc(docRef, newDoc));
    expect(result.permissionDenied).toBe(true);
  });
  it(`UI.CDT.5.D.C - deny create access if "incoming.createdAt is timestamp" is not met (${firestoreCollectionNames.uploadIntentDocs})`, async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const fs = context.firestore();
      const docRef = doc(fs, firestoreCollectionNames.balanceDocs, balanceDoc2.id);
      await setDoc(docRef, balanceDoc2);
    });
    const authedDb = testEnv.authenticatedContext(uploadIntentDoc1.uid).firestore();
    const docRef = doc(authedDb, firestoreCollectionNames.uploadIntentDocs, uploadIntentDoc1.id);

    const successDoc = creatifyDoc(uploadIntentDoc1);
    const { seconds, nanoseconds } = uploadIntentDoc1.createdAt;
    const newDoc = { ...successDoc, createdAt: { seconds, nanoseconds } };

    const result = await fbTestUtils.isRequestDenied(setDoc(docRef, newDoc));
    expect(result.permissionDenied).toBe(true);
  });
  it(`UI.CDT.6.D.C - deny create access if "incoming.updatedAt is timestamp" is not met (${firestoreCollectionNames.uploadIntentDocs})`, async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const fs = context.firestore();
      const docRef = doc(fs, firestoreCollectionNames.balanceDocs, balanceDoc2.id);
      await setDoc(docRef, balanceDoc2);
    });
    const authedDb = testEnv.authenticatedContext(uploadIntentDoc1.uid).firestore();
    const docRef = doc(authedDb, firestoreCollectionNames.uploadIntentDocs, uploadIntentDoc1.id);

    const successDoc = creatifyDoc(uploadIntentDoc1);
    const { seconds, nanoseconds } = uploadIntentDoc1.updatedAt;
    const newDoc = { ...successDoc, updatedAt: { seconds, nanoseconds } };

    const result = await fbTestUtils.isRequestDenied(setDoc(docRef, newDoc));
    expect(result.permissionDenied).toBe(true);
  });
  it(`UI.C.1.D - deny create access if "id in balanceDoc.uploadIntentIds" is not met (${firestoreCollectionNames.uploadIntentDocs})`, async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const docRef = doc(context.firestore(), firestoreCollectionNames.balanceDocs, balanceDoc2.id);
      await setDoc(docRef, { ...balanceDoc2, uploadIntentIds: {} });
    });
    const authedDb = testEnv.authenticatedContext(uploadIntentDoc1.uid).firestore();

    const newDoc = creatifyDoc(uploadIntentDoc1);
    const docRef = doc(authedDb, firestoreCollectionNames.uploadIntentDocs, uploadIntentDoc1.id);

    const result = await fbTestUtils.isRequestDenied(setDoc(docRef, newDoc));
    expect(result.permissionDenied).toBe(true);
  });
});
