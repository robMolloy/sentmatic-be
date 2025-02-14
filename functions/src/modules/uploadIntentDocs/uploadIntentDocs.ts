import { z } from "zod";
import { timestampSchema } from "../../../src/utils/firestoreUtils";

const uploadIntentDocSchema = z.object({
  id: z.string(),
  uid: z.string(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});
export type TUploadIntentDoc = z.infer<typeof uploadIntentDocSchema>;
