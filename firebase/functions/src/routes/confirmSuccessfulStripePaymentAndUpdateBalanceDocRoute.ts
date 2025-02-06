import { onCall } from "firebase-functions/v2/https";
import { fail } from "../utils/devUtils";

import { Timestamp } from "firebase-admin/firestore";
import z from "zod";
import { adminFirestoreSdk } from "../adminFirestoreSdk/adminFirestoreSdk";
import { adminUpdatifyDoc } from "../adminFirestoreSdk/adminFirestoreUtils";
import { admin } from "../config/adminFirebaseInitialisations";
import { stripe } from "../config/stripeInitialisation";
import { stripeSdk } from "../sdks/stripeSdk/stripeSdk";

const requestDataSchema = z.object({ paymentIntentId: z.string() });

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
  if (!paymentIntentResponse.success) return paymentIntentResponse;
  const paymentIntent = paymentIntentResponse.data;

  const paymentIntentDocResponse = await adminFirestoreSdk.getPaymentIntentDoc({
    admin,
    id: paymentIntentId,
  });

  if (!paymentIntentDocResponse.success) return paymentIntentDocResponse;
  const paymentIntentDoc = paymentIntentDocResponse.data;
  if (paymentIntentDoc.uid != request.auth.uid)
    return fail({ error: { message: "user id does not match the paymentIntentDoc" } });
  if (paymentIntent.currency != "gbp")
    return fail({ error: { message: "currency must be 'gbp'" } });
  if (paymentIntent.amount <= 0)
    return fail({ error: { message: "amount must be greater than 0" } });

  const balanceDocResponse = await adminFirestoreSdk.getBalanceDoc({
    admin,
    id: request.auth.uid,
  });
  if (!balanceDocResponse.success) return fail({ error: { message: "Could not get balanceDoc" } });

  const newBalanceDoc1 = adminUpdatifyDoc({
    ...balanceDocResponse.data,
    value: balanceDocResponse.data.value + paymentIntent.amount,
  });
  const newBalanceDoc2 = {
    ...balanceDocResponse.data,
    value: balanceDocResponse.data.value + paymentIntent.amount,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
  const newBalanceDoc = false ? newBalanceDoc1 : newBalanceDoc2;

  const setBalanceDocResponse = await adminFirestoreSdk.setBalanceDoc({
    admin,
    data: newBalanceDoc,
  });

  if (!setBalanceDocResponse.success)
    return fail({ error: { message: "Could not set balanceDoc" } });

  return { success: true };
});
