import { z } from "zod";
import { timestampSchema } from "../../../src/utils/firestoreUtils";

export const paymentIntentDocSchema = z.object({
  id: z.string(),
  uid: z.string(),
  isAccountDebitted: z.boolean(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});
export type TPaymentIntentDoc = z.infer<typeof paymentIntentDocSchema>;
