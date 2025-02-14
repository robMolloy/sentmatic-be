import adminSdk from "firebase-admin";
import z from "zod";
import { balanceDocSchema, TBalanceDoc } from "../modules/balanceDocs";
import { adminTimestampSchema } from "./adminFirestoreUtils";
import { paymentIntentDocSchema } from "../modules/paymentIntentDocs/paymentIntentDocs";
import { firestoreCollectionNames } from "../modules/firebaseMetadata";
import { fail } from "../../src/utils/devUtils";

const adminBalanceDocRequestSchema = balanceDocSchema.merge(
  z.object({
    createdAt: adminTimestampSchema,
    updatedAt: adminTimestampSchema,
  })
);
export type TAdminBalanceDocRequest = z.infer<typeof adminBalanceDocRequestSchema>;

const paymentIntentDocAdminRequestSchema = paymentIntentDocSchema.merge(
  z.object({
    createdAt: adminTimestampSchema,
    updatedAt: adminTimestampSchema,
  })
);
export type TAdminPaymentIntentDoc = z.infer<typeof paymentIntentDocAdminRequestSchema>;

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

const setPaymentIntentDoc = async (p: { admin: typeof adminSdk; data: TAdminPaymentIntentDoc }) => {
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
