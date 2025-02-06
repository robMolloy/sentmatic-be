import adminSdk from "firebase-admin";
import { serverTimestamp } from "firebase/firestore";
import z from "zod";
import { fail } from "../utils/devUtils";
import { timestampSchema } from "./adminFirestoreUtils";

const firestoreCollectionNames = { balanceDocs: "balanceDocs" };

const balanceDocSchema = z.object({
  id: z.string(),
  uid: z.string(),
  value: z.number(),
  currentUploadIntentNumber: z.number(),
  uploadIntentIds: z.record(z.string(), z.boolean()),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});
export type TBalanceDoc = z.infer<typeof balanceDocSchema>;
const balanceDocRequestSchema = z.object({
  id: z.string(),
  uid: z.string(),
  value: z.number(),
  currentUploadIntentNumber: z.number(),
  uploadIntentIds: z.record(z.string(), z.boolean()),
  createdAt: z.custom<ReturnType<typeof serverTimestamp>>((x) => {
    return serverTimestamp().isEqual(x);
  }),
  updatedAt: z.custom<ReturnType<typeof serverTimestamp>>((x) => {
    return serverTimestamp().isEqual(x);
  }),
});
export type TBalanceDocRequest = z.infer<typeof balanceDocRequestSchema>;

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

const setBalanceDoc = async (p: { admin: typeof adminSdk; data: TBalanceDocRequest }) => {
  try {
    await p.admin
      .firestore()
      .collection(firestoreCollectionNames.balanceDocs)
      .doc(p.data.id)
      .set(p.data);

    return getBalanceDoc({ admin: p.admin, id: p.data.id });
  } catch (e) {
    const error = e as { message: string };
    return fail({ error });
  }
};

export const adminFirestoreSdk = { getBalanceDoc, setBalanceDoc };
