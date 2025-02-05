import { onCall } from "firebase-functions/v2/https";
import { fail } from "../utils/devUtils";

import z from "zod";
import { stripe } from "../config/stripeInitialisation";
import { stripeSdk } from "../sdks/stripeSdk/stripeSdk";

const requestDataSchema = z.object({ amount: z.number() });

export const createStripePaymentIntentRoute = onCall(async (request) => {
  const parseResponse = requestDataSchema.safeParse(request.data);
  if (!parseResponse.success)
    return fail({
      error: { message: "The function must be called with argument: 'amount'" },
    });
  if (!request.auth?.uid) return fail({ error: { message: "user must be authenticated" } });

  const response = await stripeSdk.createPaymentIntent({
    stripe,
    amount: parseResponse.data.amount,
  });

  return response;
});
