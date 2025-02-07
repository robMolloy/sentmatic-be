import { auth } from "../../config/firebaseInitialisations";
import { fbTestUtils } from "../../utils/firebaseTestUtils";
import { RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { firebaseConfig } from "../../config/firebaseConfig";
import { functionsSdk } from "../../functionsSdk";
import { v4 as uuid } from "uuid";

let testEnv: RulesTestEnvironment;
let email: string;
const password = "test123";

describe("createTestDocFunctionSdkTests", () => {
  beforeAll(async () => {
    fbTestUtils.setDefaultLogLevel();
    testEnv = await fbTestUtils.createTestEnvironment({
      projectId: firebaseConfig.projectId,
    });
    email = `${uuid()}@test.com`;
    await createUserWithEmailAndPassword(auth, email, password);
  });
  beforeEach(async () => {
    // await testEnv.clearFirestore();
  });
  afterEach(async () => {
    auth.signOut();
  });
  afterAll(async () => {
    await testEnv.cleanup();
  });
  it("should return a success response", async () => {
    await signInWithEmailAndPassword(auth, email, password);
    const result2 = await functionsSdk.createTestDoc({ id: `id-${uuid()}`, amount: 100 });
    expect(result2.success).toBe(true);
  });
  it("should return a success response2", async () => {
    await signInWithEmailAndPassword(auth, email, password);
    const result2 = await functionsSdk.createTestDoc({ id: `id-${uuid()}`, amount: 100 });
    expect(result2.success).toBe(true);
  });
});
