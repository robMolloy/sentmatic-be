import { z } from "zod";
import { timestampSchema } from "../../utils/firestoreUtils/firestoreUtils";

const uploadIntentDocSchema = z.object({
  id: z.string(),
  uid: z.string(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});
export type TUploadIntentDoc = z.infer<typeof uploadIntentDocSchema>;
