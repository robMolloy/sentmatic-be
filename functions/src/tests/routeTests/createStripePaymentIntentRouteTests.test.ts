import { RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { wrappedCreateStripePaymentIntentRoute } from "./wrappedRoutes";
import { fbTestUtils } from "../testUtils/firebaseTestUtils";
import { firebaseConfig } from "../../config/firebaseConfig";

let testEnv: RulesTestEnvironment;

describe("createTestDocRouteTests", () => {
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
  it("route should return a success response and create a testDoc", async () => {
    const resp = await wrappedCreateStripePaymentIntentRoute({
      data: { amount: 100 },
      // @ts-ignore
      auth: { uid: "test123" },
    });

    expect(resp.success).toBe(true);
  });
});
