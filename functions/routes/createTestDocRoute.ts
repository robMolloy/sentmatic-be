import { onCall } from "firebase-functions/v2/https";
import { adminFirestoreSdk, testDocSchema } from "../adminFirestoreSdk/adminFirestoreSdk";
import { admin } from "../config/adminFirebaseInitialisations";
import { fail } from "../utils/devUtils";

const requestDataSchema = testDocSchema.pick({ id: true, amount: true });

export const createTestDocRoute = onCall(async (request) => {
  const parseResponse = requestDataSchema.safeParse(request.data);
  if (!parseResponse.success)
    return fail({
      error: { message: "The function must be called with arguments: " },
    });
  if (!request.auth?.uid) return fail({ error: { message: "user must be authenticated" } });

  await adminFirestoreSdk.createTestDoc({ admin: admin, data: parseResponse.data });

  return await adminFirestoreSdk.getTestDoc({ admin: admin, id: parseResponse.data.id });
});
