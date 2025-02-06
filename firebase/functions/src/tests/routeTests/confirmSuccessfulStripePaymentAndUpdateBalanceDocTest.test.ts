import { doc, setDoc, getDoc } from "@firebase/firestore";
import { RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { firestoreCollectionNames } from "../../adminFirestoreSdk/adminFirestoreSdk";
import { firebaseConfig } from "../../config/firebaseConfig";
import { creatifyDoc } from "../../utils/firestoreUtils/firestoreUtils";
import { fbTestUtils } from "../firebaseTestUtils";
import {
  wrappedConfirmSuccessfulStripePaymentAndUpdateBalanceDocRoute,
  wrappedCreateStripePaymentIntentRoute,
} from "./wrappedRoutes";

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
    const createPaymentIntentResponse = await wrappedCreateStripePaymentIntentRoute({
      data: { amount: 100 },
      auth: { uid },
    });
    expect(createPaymentIntentResponse.success).toBe(true);
    if (!createPaymentIntentResponse.success) return;

    const paymentIntent = createPaymentIntentResponse.data;
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const fs = context.firestore();
      const docRef1 = doc(fs, firestoreCollectionNames.paymentIntentDocs, paymentIntent.id);
      await setDoc(docRef1, creatifyDoc({ id: paymentIntent.id, uid, isAccountDebitted: false }));
      const docRef2 = doc(fs, firestoreCollectionNames.balanceDocs, uid);
      await setDoc(
        docRef2,
        creatifyDoc({ id: uid, uid, value: 0, currentUploadIntentNumber: 0, uploadIntentIds: {} })
      );
    });

    const resp = await wrappedConfirmSuccessfulStripePaymentAndUpdateBalanceDocRoute({
      data: { paymentIntentId: paymentIntent.id },
      auth: { uid },
    });

    expect(resp.success).toBe(true);

    await testEnv.withSecurityRulesDisabled(async (context) => {
      const fs = context.firestore();
      const resp = await getDoc(doc(fs, firestoreCollectionNames.balanceDocs, uid));

      expect(resp.data()?.value).toBe(100);
    });
  });
});
