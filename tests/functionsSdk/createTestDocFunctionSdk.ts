import { httpsCallable } from "@firebase/functions";
import { Timestamp } from "@firebase/firestore";
import z from "zod";
import { functions } from "../config/firebaseInitialisations";
import { fail, success } from "@/utils/devUtils";

type TTimestamp = Timestamp;
type TTimestampValue = Pick<TTimestamp, "seconds" | "nanoseconds">;

const getTimestampFromTimestampValue = (x: TTimestampValue) => {
  return new Timestamp(x.seconds, x.nanoseconds);
};

export const timestampSchema = z
  .object({ seconds: z.number(), nanoseconds: z.number() })
  .transform((x) => getTimestampFromTimestampValue(x));

export const testDocSchema = z.object({
  id: z.string(),
  amount: z.number(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});
export type TTestDoc = z.infer<typeof testDocSchema>;

const createTestDocFn = httpsCallable(functions, "createTestDocRoute");
const successResponseDataSchema = z.object({
  success: z.literal(true),
  data: z.object({ id: z.string(), amount: z.number() }),
});

export const createTestDoc = async (p: Pick<TTestDoc, "id" | "amount">) => {
  const response = await createTestDocFn(p);
  const parsedResponse = successResponseDataSchema.safeParse(response.data);

  if (!parsedResponse.success)
    return fail({ error: { message: JSON.stringify(parsedResponse.error) } });
  if (!parsedResponse.success) return fail({ error: { message: "createTestDoc failed" } });
  return success({ data: parsedResponse.data.data });
};
