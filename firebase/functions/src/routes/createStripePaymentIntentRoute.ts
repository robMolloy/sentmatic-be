import { onCall } from "firebase-functions/v2/https";
import { fail } from "../utils/devUtils";

import { Stripe } from "stripe";
import z from "zod";
import { stripeSdk } from "../sdks/stripeSdk/stripeSdk";

const stripeSecretKey =
  "sk_test_51QhH4nIGFJRyk0RhUnRTVsXZICgwBLG5C6tiDecTJNR5MC40Skm1y3HMQt0HQA0dEdReAcEH3v2TozuJ9mlLHBQM00d3N3noeZ";
const stripe = new Stripe(stripeSecretKey);

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
