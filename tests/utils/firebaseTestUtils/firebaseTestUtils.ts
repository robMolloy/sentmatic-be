import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";
import { DocumentData, DocumentSnapshot, QuerySnapshot, setLogLevel } from "firebase/firestore";
import { readFileSync } from "fs";
import path from "path";

export const setDefaultLogLevel = () => setLogLevel("error");

export const createTestEnvironment = async (p: { projectId: string }) => {
  return initializeTestEnvironment({
    projectId: p.projectId,
    firestore: {
      rules: readFileSync(path.resolve("./firebase/firestore/firestore.rules"), "utf8"),
      host: "127.0.0.1",
      port: 8080,
    },
  });
};

export async function isRequestDenied(promise: Promise<unknown>) {
  try {
    const errorResult = await assertFails(promise);
    const permissionDenied = ["permission-denied", "PERMISSION_DENIED"].includes(errorResult.code);

    return {
      permissionDenied,
      permissionGranted: !permissionDenied,
      error: permissionDenied ? "PERMISSION_DENIED" : undefined,
    } as const;
  } catch (error) {
    return { permissionDenied: false, permissionGranted: true } as const;
  }
}
export async function isRequestGranted<T extends Promise<unknown>>(promise: T) {
  try {
    const response = (await assertSucceeds(promise)) as
      | QuerySnapshot<DocumentData, DocumentData>
      | DocumentSnapshot
      | unknown;
    const data =
      response instanceof QuerySnapshot
        ? response.docs.map((x) => x.data())
        : response instanceof DocumentSnapshot
        ? response.data()
        : response;
    return {
      permissionGranted: true,
      permissionDenied: false,
      data: data,
    } as const;
  } catch (error) {
    return { permissionDenied: true, permissionGranted: false } as const;
  }
}

export const removeKey = <T extends object, K extends keyof T>(key: K, object: T): Omit<T, K> => {
  const { [key]: _, ...rest } = object;
  return rest;
};
