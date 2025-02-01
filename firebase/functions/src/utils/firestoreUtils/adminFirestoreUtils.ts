import adminSdk from "firebase-admin";

//
export const removeKey = <T extends object, K extends keyof T>(key: K, object: T): Omit<T, K> => {
  const { [key]: _, ...rest } = object;
  return rest;
};

const adminServerTimestamp = adminSdk.firestore.FieldValue.serverTimestamp;
export type TAdminServerTimestamp = ReturnType<typeof adminServerTimestamp>;

const adminTimestamp = adminSdk.firestore.Timestamp;
export type TAdminTimestamp = ReturnType<typeof adminTimestamp.now>;

export const adminCreatifyDoc = <T extends object>(obj: T) => {
  return {
    ...obj,
    createdAt: adminSdk.firestore.FieldValue.serverTimestamp(),
    updatedAt: adminSdk.firestore.FieldValue.serverTimestamp(),
  };
};

export const adminUpdatifyDoc = <T extends object>(object: T) => {
  return { ...object, updatedAt: adminSdk.firestore.FieldValue.serverTimestamp() };
};

export const getNotNowTimestamp = () => {
  const now = adminTimestamp.now();
  return { ...now, nanoseconds: now.nanoseconds - 1 };
};
