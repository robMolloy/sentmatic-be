import { stripe } from "../../config/stripeInitialisation";
import { stripeSdk } from "./stripeSdk";

describe("createTestDocRouteTests", () => {
  beforeAll(async () => {});
  beforeEach(async () => {});
  afterAll(async () => {});
  it("stripeSdk should return a success response for createPaymentIntent and retrievePaymentIntent", async () => {
    const createResponse = await stripeSdk.createPaymentIntent({ stripe, amount: 100 });

    expect(createResponse.success).toBe(true);
    if (!createResponse.success) return;

    const id = createResponse.data.id;
    const retrieveResponse = await stripeSdk.retrievePaymentIntent({ stripe, id });

    expect(retrieveResponse.success).toBe(true);
    if (!retrieveResponse.success) return;

    expect(retrieveResponse.data.amount).toBe(100);
    expect(retrieveResponse.data.currency).toBe("gbp");
  });
});
