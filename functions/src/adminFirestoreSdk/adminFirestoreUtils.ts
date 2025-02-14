import { Timestamp as adminTimestamp } from "firebase-admin/firestore";
import z from "zod";

type TTimestamp = ReturnType<typeof adminTimestamp.now>;
type TTimestampValue = Pick<TTimestamp, "seconds" | "nanoseconds">;

const getAdminTimestampFromTimestampValue = (x: TTimestampValue) => {
  return new adminTimestamp(x.seconds, x.nanoseconds);
};

export const adminTimestampSchema = z
  .object({ seconds: z.number(), nanoseconds: z.number() })
  .transform((x) => getAdminTimestampFromTimestampValue(x));

export const adminServerTimestamp = adminTimestamp.now;

export const adminCreatifyDoc = <T extends object>(obj: T) => {
  return { ...obj, createdAt: adminServerTimestamp(), updatedAt: adminServerTimestamp() };
};

export const adminUpdatifyDoc = <T extends { createdAt: TTimestampValue }>(object: T) => {
  return {
    ...object,
    createdAt: getAdminTimestampFromTimestampValue(object.createdAt),
    updatedAt: adminServerTimestamp(),
  };
};
