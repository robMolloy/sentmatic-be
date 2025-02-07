export const success = <T>(p: { data: T }) => {
  return { success: true, data: p.data } as const;
};
export const fail = <T extends { message: string }>(p: { error: T }) => {
  return { success: false, error: p.error } as const;
};

export type TSuccess<T> = { success: true; data: T };
export type TFail = { success: false; error: { message: string } };
export type TSuccessOrFail<T> = TSuccess<T> | TFail;
