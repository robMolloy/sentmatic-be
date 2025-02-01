import adminSdk from "firebase-admin";
import z from "zod";
import { fail, success } from "../utils/devUtils";
import { timestampSchema } from "./adminFirestoreUtils";
import { adminCreatifyDoc } from "../utils/firestoreUtils";

const collectionNames = { testDocs: "testDocs" };

export const testDocSchema = z.object({
  id: z.string(),
  amount: z.number(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});
export type TTestDoc = z.infer<typeof testDocSchema>;

const getTestDoc = async (p: { admin: typeof adminSdk; id: string }) => {
  try {
    const initDoc = await p.admin.firestore().collection(collectionNames.testDocs).doc(p.id).get();

    return testDocSchema.safeParse(initDoc.data());
  } catch (e) {
    const error = e as { message: string };
    return fail({ error });
  }
};

const createTestDoc = async (p: {
  admin: typeof adminSdk;
  data: Pick<TTestDoc, "id" | "amount">;
}) => {
  try {
    await p.admin
      .firestore()
      .collection(collectionNames.testDocs)
      .doc(p.data.id)
      .set(adminCreatifyDoc({ ...p.data }));
    return success({ data: undefined });
  } catch (e) {
    const error = e as { message: string };
    return fail({ error });
  }
};

export const adminFirestoreSdk = { createTestDoc, getTestDoc };
