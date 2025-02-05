import { RulesTestEnvironment } from "@firebase/rules-unit-testing";
import Test from "firebase-functions-test";
import { firebaseConfig } from "../../config/firebaseConfig";
import * as routes from "../../routes";
import { fbTestUtils } from "../firebaseTestUtils";

let testEnv: RulesTestEnvironment;

const test = Test();

describe("createTestDocRouteTests", () => {
  beforeAll(async () => {
    fbTestUtils.setDefaultLogLevel();
    testEnv = await fbTestUtils.createTestEnvironment({ projectId: firebaseConfig.projectId });
    // await testEnv.clearFirestore();
  });
  beforeEach(async () => {});
  afterAll(async () => {
    await testEnv.cleanup();
  });
  // it("routeHandler should return a success response and create a testDoc", async () => {
  //   const resp = await createTestDocRouteHandler({ admin, data: { id: `id-${v4()}`, amount: 10 } });

  //   expect(resp.success).toBe(true);
  // });
  it("route should return a success response and create a testDoc", async () => {
    const wrappedCreateStripePaymentIntentRoute = test.wrap(routes.createStripePaymentIntentRoute);
    const resp = await wrappedCreateStripePaymentIntentRoute({
      data: { amount: 100 },
      // @ts-ignore
      auth: { uid: "test123" },
    });

    expect(resp.success).toBe(true);
  });
});
