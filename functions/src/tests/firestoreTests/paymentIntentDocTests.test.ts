import { RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { doc, setDoc } from "firebase/firestore";
import { fbTestUtils } from "../testUtils/firebaseTestUtils";
import { creatifyDoc, getNotNowTimestamp, removeKey } from "../../../src/utils/firestoreUtils";
import { paymentIntentDoc1 } from "./mocks/mockData";
import { firestoreCollectionNames } from "../../modules/firebaseMetadata";
import { TPaymentIntentDoc } from "../../modules/paymentIntentDocs/paymentIntentDocs";
import { firebaseConfig } from "../../config/firebaseConfig";

let testEnv: RulesTestEnvironment;

describe("paymentIntentDocTests", () => {
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

  it(`PI.C.0.A - approve create access if valid (${firestoreCollectionNames.paymentIntentDocs})`, async () => {
    const authedDb = testEnv.authenticatedContext(paymentIntentDoc1.uid).firestore();
    const docRef = doc(authedDb, firestoreCollectionNames.paymentIntentDocs, paymentIntentDoc1.id);

    const successDoc = creatifyDoc(paymentIntentDoc1);
    const result = await fbTestUtils.isRequestGranted(setDoc(docRef, successDoc));

    expect(result.permissionGranted).toBe(true);
  });
  it(`PI.CDT.1.D.C - deny create access if "incoming.keys().hasAll(keys)" is not met (${firestoreCollectionNames.paymentIntentDocs})`, async () => {
    const authedDb = testEnv.authenticatedContext(paymentIntentDoc1.uid).firestore();
    const docRef = doc(authedDb, firestoreCollectionNames.paymentIntentDocs, paymentIntentDoc1.id);

    const successDoc = creatifyDoc(paymentIntentDoc1);
    const createDocKeys = Object.keys(paymentIntentDoc1) as (keyof TPaymentIntentDoc)[];
    const missingKeyDocs = createDocKeys.map((key) => removeKey(key, successDoc));

    const promises = missingKeyDocs.map((x) => fbTestUtils.isRequestDenied(setDoc(docRef, x)));
    const results = await Promise.all(promises);
    const isAllDenied = results.every((x) => x.permissionDenied);
    expect(isAllDenied).toBe(true);
  });

  it(`PI.CDT.2.D.C - deny create access if "incoming.keys().hasOnly(keys)" is not met (${firestoreCollectionNames.paymentIntentDocs})`, async () => {
    const authedDb = testEnv.authenticatedContext(paymentIntentDoc1.uid).firestore();
    const docRef = doc(authedDb, firestoreCollectionNames.paymentIntentDocs, paymentIntentDoc1.id);

    const successDoc = creatifyDoc(paymentIntentDoc1);
    const newDoc = { ...successDoc, addKey: "" };

    const result = await fbTestUtils.isRequestDenied(setDoc(docRef, newDoc));
    expect(result.permissionDenied).toBe(true);
  });

  it(`PI.CDT.3.D.C - deny create access if "incoming.id == getIncomingId()" is not met (${firestoreCollectionNames.paymentIntentDocs})`, async () => {
    const authedDb = testEnv.authenticatedContext(paymentIntentDoc1.uid).firestore();
    const docRef = doc(authedDb, firestoreCollectionNames.paymentIntentDocs, paymentIntentDoc1.id);

    const successDoc = creatifyDoc(paymentIntentDoc1);
    const newDoc = { ...successDoc, id: `${successDoc.id}_` };

    const result = await fbTestUtils.isRequestDenied(setDoc(docRef, newDoc));
    expect(result.permissionDenied).toBe(true);
  });

  it(`PI.CDT.4.D.C - deny create access if "incoming.uid == getIncomingAuth().uid" is not met (${firestoreCollectionNames.paymentIntentDocs})`, async () => {
    const authedDb = testEnv.authenticatedContext(paymentIntentDoc1.uid).firestore();
    const docRef = doc(authedDb, firestoreCollectionNames.paymentIntentDocs, paymentIntentDoc1.id);

    const successDoc = creatifyDoc(paymentIntentDoc1);
    const newDoc = { ...successDoc, uid: `${successDoc.uid}_` };

    const result = await fbTestUtils.isRequestDenied(setDoc(docRef, newDoc));
    expect(result.permissionDenied).toBe(true);
  });
  it(`UI.CDT.5.D.C - deny create access if "incoming.createdAt is timestamp" is not met (${firestoreCollectionNames.paymentIntentDocs})`, async () => {
    const authedDb = testEnv.authenticatedContext(paymentIntentDoc1.uid).firestore();
    const docRef = doc(authedDb, firestoreCollectionNames.paymentIntentDocs, paymentIntentDoc1.id);

    const successDoc = creatifyDoc(paymentIntentDoc1);
    const newDoc = { ...successDoc, isAccountDebitted: "false" };

    const result = await fbTestUtils.isRequestDenied(setDoc(docRef, newDoc));
    expect(result.permissionDenied).toBe(true);
  });
  it(`PI.CDT.6.D.C - deny create access if "incoming.createdAt is timestamp" is not met (${firestoreCollectionNames.paymentIntentDocs})`, async () => {
    const authedDb = testEnv.authenticatedContext(paymentIntentDoc1.uid).firestore();
    const docRef = doc(authedDb, firestoreCollectionNames.paymentIntentDocs, paymentIntentDoc1.id);

    const successDoc = creatifyDoc(paymentIntentDoc1);
    const { seconds, nanoseconds } = paymentIntentDoc1.createdAt;
    const newDoc = { ...successDoc, createdAt: { seconds, nanoseconds } };

    const result = await fbTestUtils.isRequestDenied(setDoc(docRef, newDoc));
    expect(result.permissionDenied).toBe(true);
  });
  it(`PI.CDT.7.D.C - deny create access if "incoming.updatedAt is timestamp" is not met (${firestoreCollectionNames.paymentIntentDocs})`, async () => {
    const authedDb = testEnv.authenticatedContext(paymentIntentDoc1.uid).firestore();
    const docRef = doc(authedDb, firestoreCollectionNames.paymentIntentDocs, paymentIntentDoc1.id);

    const successDoc = creatifyDoc(paymentIntentDoc1);
    const { seconds, nanoseconds } = paymentIntentDoc1.updatedAt;
    const newDoc = { ...successDoc, updatedAt: { seconds, nanoseconds } };

    const result = await fbTestUtils.isRequestDenied(setDoc(docRef, newDoc));
    expect(result.permissionDenied).toBe(true);
  });
  it(`PI.C.1.D - deny create access if "incoming.isAccountDebitted == false" is not met (${firestoreCollectionNames.paymentIntentDocs})`, async () => {
    const authedDb = testEnv.authenticatedContext(paymentIntentDoc1.uid).firestore();
    const docRef = doc(authedDb, firestoreCollectionNames.paymentIntentDocs, paymentIntentDoc1.id);

    const successDoc = creatifyDoc(paymentIntentDoc1);
    const newDoc = { ...successDoc, isAccountDebitted: true };

    const result = await fbTestUtils.isRequestDenied(setDoc(docRef, newDoc));
    expect(result.permissionDenied).toBe(true);
  });
  it(`PI.C.2.D - deny create access if "isNow(incoming.createdAt)" is not met (${firestoreCollectionNames.paymentIntentDocs})`, async () => {
    const authedDb = testEnv.authenticatedContext(paymentIntentDoc1.uid).firestore();
    const docRef = doc(authedDb, firestoreCollectionNames.paymentIntentDocs, paymentIntentDoc1.id);

    const successDoc = creatifyDoc(paymentIntentDoc1);
    const newDoc = { ...successDoc, createdAt: getNotNowTimestamp() };

    const result = await fbTestUtils.isRequestDenied(setDoc(docRef, newDoc));
    expect(result.permissionDenied).toBe(true);
  });
  it(`PI.C.3.D - deny create access if "isNow(incoming.updatedAt)" is not met (${firestoreCollectionNames.paymentIntentDocs})`, async () => {
    const authedDb = testEnv.authenticatedContext(paymentIntentDoc1.uid).firestore();
    const docRef = doc(authedDb, firestoreCollectionNames.paymentIntentDocs, paymentIntentDoc1.id);

    const successDoc = creatifyDoc(paymentIntentDoc1);
    const newDoc = { ...successDoc, updatedAt: getNotNowTimestamp() };

    const result = await fbTestUtils.isRequestDenied(setDoc(docRef, newDoc));
    expect(result.permissionDenied).toBe(true);
  });
});
