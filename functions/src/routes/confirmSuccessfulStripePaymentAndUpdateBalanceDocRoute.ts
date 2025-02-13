import { onCall } from "firebase-functions/v2/https";
import z from "zod";
import { adminFirestoreSdk } from "../adminFirestoreSdk/adminFirestoreSdk";
import { adminUpdatifyDoc } from "../adminFirestoreSdk/adminFirestoreUtils";
import { admin } from "../config/adminFirebaseInitialisations";
import { stripe } from "../config/stripeInitialisation";
import { stripeSdk } from "../sdks/stripeSdk";
import Cors from "cors";
import { fail } from "../../src/utils/devUtils";

const requestDataSchema = z.object({ paymentIntentId: z.string() });

Cors({ origin: true });
export const confirmSuccessfulStripePaymentAndUpdateBalanceDocRoute = onCall(async (request) => {
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
  if (!paymentIntentResponse.success)
    return fail({
      error: {
        message: `could not find paymentIntent: ${paymentIntentId}`,
        details: paymentIntentResponse.error.message,
      },
    });

  const paymentIntentDocResponse = await adminFirestoreSdk.getPaymentIntentDoc({
    admin,
    id: paymentIntentId,
  });

  if (!paymentIntentDocResponse.success)
    return fail({ error: { message: "could not find paymentIntentDoc" } });

  const paymentIntent = paymentIntentResponse.data;
  const paymentIntentDoc = paymentIntentDocResponse.data;

  if (paymentIntentDoc.uid != request.auth.uid)
    return fail({ error: { message: "user id does not match the paymentIntentDoc" } });

  if (paymentIntent.currency != "usd")
    return fail({ error: { message: "currency must be 'usd'" } });

  if (paymentIntent.amount <= 0)
    return fail({ error: { message: "amount must be greater than 0" } });

  if (paymentIntentDoc.isAccountDebitted)
    return fail({ error: { message: "amount already debitted" } });

  const getBalanceDocResponse = await adminFirestoreSdk.getBalanceDoc({
    admin,
    id: request.auth.uid,
  });
  if (!getBalanceDocResponse.success)
    return fail({ error: { message: "Could not get balanceDoc" } });

  const setBalanceDocResponse = await adminFirestoreSdk.setBalanceDoc({
    admin,
    data: adminUpdatifyDoc({
      ...getBalanceDocResponse.data,
      value: getBalanceDocResponse.data.value + paymentIntent.amount,
    }),
  });

  if (!setBalanceDocResponse.success)
    return fail({ error: { message: "Could not set balanceDoc" } });

  const setPaymentIntentDocResponse = await adminFirestoreSdk.setPaymentIntentDoc({
    admin,
    data: adminUpdatifyDoc({ ...paymentIntentDoc, isAccountDebitted: true }),
  });

  if (!setPaymentIntentDocResponse.success)
    return fail({ error: { message: "Could not set paymentIntentDoc isAccountDebitted:true" } });

  return { success: true } as const;
});
