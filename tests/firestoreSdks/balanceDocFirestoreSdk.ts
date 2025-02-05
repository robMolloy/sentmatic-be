import { timestampSchema } from "@/functionsSdk/createTestDocFunctionSdk";
import z from "zod";

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

export const updatableBalanceDocKeys = [
  "value",
  "currentUploadIntentNumber",
  "uploadIntentIds",
  "updatedAt",
] as const;

export const incrementBalanceDoc = (p: TBalanceDoc) => {
  const nextUploadIntentNumber = p.currentUploadIntentNumber + 1;
  const nextUploadIntentId = `${p.uid}_${nextUploadIntentNumber}`;

  return {
    ...p,
    value: p.value - 300,
    currentUploadIntentNumber: nextUploadIntentNumber,
    uploadIntentIds: { ...p.uploadIntentIds, [nextUploadIntentId]: false },
  };
};
