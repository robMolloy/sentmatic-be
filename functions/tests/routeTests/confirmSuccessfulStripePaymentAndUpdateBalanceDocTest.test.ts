import { doc, getDoc, setDoc } from "@firebase/firestore";
import { RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { firestoreCollectionNames } from "../../adminFirestoreSdk/adminFirestoreSdk";
import { firebaseConfig } from "../../config/firebaseConfig";
import { creatifyDoc } from "../../utils/firestoreUtils/firestoreUtils";
import { wrappedConfirmSuccessfulStripePaymentAndUpdateBalanceDocRoute } from "./wrappedRoutes";
import { fbTestUtils } from "../../utils/firebaseTestUtils";

let testEnv: RulesTestEnvironment;

describe("confirmSuccessfulStripePaymentAndUpdateBalanceDoc", () => {
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
  it("route should return a success response and update balanceDoc", async () => {
    const uid = "test123";
    const paymentIntentId = "pi_3QnJlyIGFJRyk0Rh0wsj1vKD";

    await testEnv.withSecurityRulesDisabled(async (context) => {
      const fs = context.firestore();
      const docRef1 = doc(fs, firestoreCollectionNames.paymentIntentDocs, paymentIntentId);
      await setDoc(docRef1, creatifyDoc({ id: paymentIntentId, uid, isAccountDebitted: false }));
      const docRef2 = doc(fs, firestoreCollectionNames.balanceDocs, uid);
      await setDoc(
        docRef2,
        creatifyDoc({ id: uid, uid, value: 0, currentUploadIntentNumber: 0, uploadIntentIds: {} })
      );
    });

    const resp = await wrappedConfirmSuccessfulStripePaymentAndUpdateBalanceDocRoute({
      data: { paymentIntentId: paymentIntentId },
      auth: { uid },
    });

    expect(resp.success).toBe(true);

    await testEnv.withSecurityRulesDisabled(async (context) => {
      const fs = context.firestore();
      const resp = await getDoc(doc(fs, firestoreCollectionNames.balanceDocs, uid));

      expect(resp.data()?.value).toBe(345);
    });
  });
  it("route should return a success response on first run and fail on second run", async () => {
    const uid = "test123";
    const paymentIntentId = "pi_3QnJlyIGFJRyk0Rh0wsj1vKD";

    await testEnv.withSecurityRulesDisabled(async (context) => {
      const fs = context.firestore();
      const docRef1 = doc(fs, firestoreCollectionNames.paymentIntentDocs, paymentIntentId);
      await setDoc(docRef1, creatifyDoc({ id: paymentIntentId, uid, isAccountDebitted: false }));
      const docRef2 = doc(fs, firestoreCollectionNames.balanceDocs, uid);
      await setDoc(
        docRef2,
        creatifyDoc({ id: uid, uid, value: 0, currentUploadIntentNumber: 0, uploadIntentIds: {} })
      );
    });

    const resp1 = await wrappedConfirmSuccessfulStripePaymentAndUpdateBalanceDocRoute({
      data: { paymentIntentId },
      auth: { uid },
    });

    expect(resp1.success).toBe(true);

    const resp2 = await wrappedConfirmSuccessfulStripePaymentAndUpdateBalanceDocRoute({
      data: { paymentIntentId },
      auth: { uid },
    });
    expect(resp2.success).toBe(false);

    await testEnv.withSecurityRulesDisabled(async (context) => {
      const fs = context.firestore();
      const resp = await getDoc(doc(fs, firestoreCollectionNames.balanceDocs, uid));

      expect(resp.data()?.value).toBe(345);
    });
  });
});
