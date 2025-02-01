import z from "zod";
import { adminFirestoreSdk, testDocSchema } from "../../adminFirestoreSdk/adminFirestoreSdk";
import { admin } from "../../config/adminFirebaseInitialisations";

const requestDataSchema = testDocSchema.pick({ id: true, amount: true });

export const createTestDocRouteHandler = (p: {
  admin: typeof admin;
  data: z.infer<typeof requestDataSchema>;
}) => {
  return adminFirestoreSdk.createTestDoc({ admin: admin, data: p.data });
};
