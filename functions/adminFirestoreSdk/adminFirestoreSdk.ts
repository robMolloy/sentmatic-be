import adminSdk from "firebase-admin";
import z from "zod";
import { fail } from "../utils/devUtils";
import { firestoreCollectionNames } from "../tests/mocks/metadata";
import { adminTimestampSchema } from "./adminFirestoreUtils";

const balanceDocSchema = z.object({
  id: z.string(),
  uid: z.string(),
  value: z.number(),
  currentUploadIntentNumber: z.number(),
  uploadIntentIds: z.record(z.string(), z.boolean()),
  createdAt: adminTimestampSchema,
  updatedAt: adminTimestampSchema,
});
export type TBalanceDoc = z.infer<typeof balanceDocSchema>;
const balanceDocRequestSchema = z.object({
  id: z.string(),
  uid: z.string(),
  value: z.number(),
  currentUploadIntentNumber: z.number(),
  uploadIntentIds: z.record(z.string(), z.boolean()),
  createdAt: adminTimestampSchema,
  updatedAt: adminTimestampSchema,
});
export type TBalanceDocRequest = z.infer<typeof balanceDocRequestSchema>;

const paymentIntentDocSchema = z.object({
  id: z.string(),
  uid: z.string(),
  isAccountDebitted: z.boolean(),
  createdAt: adminTimestampSchema,
  updatedAt: adminTimestampSchema,
});
export type TPaymentIntentDoc = z.infer<typeof paymentIntentDocSchema>;

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
    console.log(`adminFirestoreSdk.ts:${/*LL*/ 67}`, { error });
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

    return paymentIntentDocSchema.safeParse(initDoc.data());
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
