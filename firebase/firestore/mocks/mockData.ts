import { Timestamp } from "firebase/firestore";
import { z } from "zod";
import { timestampSchema } from "../firebaseTestUtils/firestoreUtils";

export const collectionNames = {
  balanceDocs: "balanceDocs",
};

const balanceDocSchema = z.object({
  id: z.string(),
  uid: z.string(),
  value: z.number(),
  currentUploadIntentNumber: z.number(),
  uploadIntentIds: z.record(z.string(), z.boolean()),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});
type TBalanceDoc = z.infer<typeof balanceDocSchema>;
export const balanceDoc1 = {
  id: "uid123",
  uid: "uid123",
  value: 0,
  currentUploadIntentNumber: 0,
  uploadIntentIds: {},
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
} as const satisfies TBalanceDoc;
export const balanceDoc2 = {
  id: "uid124",
  uid: "uid124",
  value: 1000,
  currentUploadIntentNumber: 1,
  uploadIntentIds: { uid124_1: true },
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
} as const satisfies TBalanceDoc;
export const balanceDoc3 = {
  id: "uid125",
  uid: "uid125",
  value: 200,
  currentUploadIntentNumber: 1,
  uploadIntentIds: { uid125_1: true },
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
} as const satisfies TBalanceDoc;
