import adminSdk from "firebase-admin";
import z from "zod";
import { fail } from "../utils/devUtils";
import { firestoreCollectionNames } from "../tests/mocks/metadata";
import { adminTimestampSchema } from "./adminFirestoreUtils";
import { balanceDocSchema, TBalanceDoc } from "../tests/firestoreSdks/balanceDocFirestoreSdk";
import { paymentIntentDocSchema } from "../tests/firestoreSdks/paymentIntentDocFirestoreSdk";

const balanceDocAdminRequestSchema = balanceDocSchema.merge(
  z.object({
    createdAt: adminTimestampSchema,
    updatedAt: adminTimestampSchema,
  })
);
export type TBalanceDocAdminRequest = z.infer<typeof balanceDocAdminRequestSchema>;

const paymentIntentDocAdminRequestSchema = paymentIntentDocSchema.merge(
  z.object({
    createdAt: adminTimestampSchema,
    updatedAt: adminTimestampSchema,
  })
);
export type TPaymentIntentDoc = z.infer<typeof paymentIntentDocAdminRequestSchema>;

const getBalanceDoc = async (p: { admin: typeof adminSdk; id: string }) => {
  try {
    const initDoc = await p.admin
      .firestore()
      .collection(firestoreCollectionNames.balanceDocs)
      .doc(p.id)
      .get();

    return balanceDocSchema.safeParse(initDoc.data());
  } catch (e) {
    const error = e as { message: string };
    return fail({ error });
  }
};

const setBalanceDoc = async (p: { admin: typeof adminSdk; data: TBalanceDoc }) => {
  try {
    await p.admin
      .firestore()
      .collection(firestoreCollectionNames.balanceDocs)
      .doc(p.data.id)
      .set(p.data);

    return { success: true } as const;
  } catch (e) {
    const error = e as { message: string };
    return fail({ error });
  }
};

const getPaymentIntentDoc = async (p: { admin: typeof adminSdk; id: string }) => {
  try {
    const initDoc = await p.admin
      .firestore()
      .collection(firestoreCollectionNames.paymentIntentDocs)
      .doc(p.id)
      .get();

    return paymentIntentDocAdminRequestSchema.safeParse(initDoc.data());
  } catch (e) {
    const error = e as { message: string };
    return fail({ error });
  }
};

const setPaymentIntentDoc = async (p: { admin: typeof adminSdk; data: TPaymentIntentDoc }) => {
  try {
    await p.admin
      .firestore()
      .collection(firestoreCollectionNames.paymentIntentDocs)
      .doc(p.data.id)
      .set(p.data);

    return { success: true } as const;
  } catch (e) {
    const error = e as { message: string };
    return fail({ error });
  }
};

export const adminFirestoreSdk = {
  getBalanceDoc,
  setBalanceDoc,
  getPaymentIntentDoc,
  setPaymentIntentDoc,
};
