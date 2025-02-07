import { RulesTestEnvironment } from "@firebase/rules-unit-testing";
import Test from "firebase-functions-test";
import { admin } from "../../config/adminFirebaseInitialisations";
import { firebaseConfig } from "../../config/firebaseConfig";
import * as routes from "../../routes";
import { createTestDocRouteHandler } from "../../routes/routeHandlers/createTestDocRouteHandler";
import { fbTestUtils } from "../../utils/firebaseTestUtils";
import { v4 } from "uuid";

let testEnv: RulesTestEnvironment;

const test = Test();

describe("createTestDocRouteTests", () => {
  beforeAll(async () => {
    fbTestUtils.setDefaultLogLevel();
    testEnv = await fbTestUtils.createTestEnvironment({ projectId: firebaseConfig.projectId });
  });
  beforeEach(async () => {
    // await testEnv.clearFirestore();
  });
  afterAll(async () => {
    await testEnv.cleanup();
  });
  it("routeHandler should return a success response and create a testDoc", async () => {
    const resp = await createTestDocRouteHandler({ admin, data: { id: `id-${v4()}`, amount: 10 } });

    expect(resp.success).toBe(true);
  });
  it("route should return a success response and create a testDoc", async () => {
    const wrappedCreateTestDocRoute = test.wrap(routes.createTestDocRoute);
    const resp = await wrappedCreateTestDocRoute({
      data: { id: `id-${v4()}`, amount: 10 },
      // @ts-ignore
      auth: { uid: "test123" },
    });

    expect(resp.success).toBe(true);
  });
});
