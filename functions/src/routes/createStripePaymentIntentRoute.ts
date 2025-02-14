import { onCall } from "firebase-functions/v2/https";
import { stripe } from "../sdks/stripeInitialisations";
import { paymentIntentSchema, stripeSdk } from "../sdks/stripeSdk";
import Cors from "cors";
import { fail } from "../utils/devUtils";

const requestDataSchema = paymentIntentSchema.pick({ amount: true });

Cors({ origin: true });
export const createStripePaymentIntentRoute = onCall(async (request) => {
  const parseResponse = requestDataSchema.safeParse(request.data);
  if (!parseResponse.success) {
    return fail({
      error: { message: "The function must be called with argument: 'amount'" },
    });
  }
  if (!request.auth?.uid) {
    return fail({ error: { message: "user must be authenticated" } });
  }

  const response = await stripeSdk.createPaymentIntent({
    stripe,
    amount: parseResponse.data.amount,
  });

  return response;
});
