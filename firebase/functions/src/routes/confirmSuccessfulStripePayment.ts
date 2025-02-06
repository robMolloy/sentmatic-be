import { onCall } from "firebase-functions/v2/https";
import { fail } from "../utils/devUtils";

import z from "zod";
import { stripe } from "../config/stripeInitialisation";
import { stripeSdk } from "../sdks/stripeSdk/stripeSdk";

const requestDataSchema = z.object({ paymentIntentId: z.string() });

export const confirmSuccessfulStripePaymentAndUpdateBalanceDoc = onCall(async (request) => {
  const parseResponse = requestDataSchema.safeParse(request.data);
  if (!parseResponse.success)
    return fail({
      error: { message: "The function must be called with argument: 'paymentIntentId'" },
    });
  if (!request.auth?.uid) return fail({ error: { message: "user must be authenticated" } });

  const paymentIntentId = parseResponse.data.paymentIntentId;
  const paymentIntentResponse = await stripeSdk.retrievePaymentIntent({
    stripe,
    id: paymentIntentId,
  });

  return paymentIntentResponse;
});
