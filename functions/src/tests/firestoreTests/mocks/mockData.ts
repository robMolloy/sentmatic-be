import { Timestamp } from "firebase/firestore";
import { TAdminPaymentIntentDoc } from "../../../adminFirestoreSdk/adminFirestoreSdk";
import { TUploadIntentDoc } from "../../../modules/uploadIntentDocs/uploadIntentDocs";
import { TBalanceDoc } from "../../../modules/balanceDocs";

export const paymentIntentDoc1 = {
  id: "pi_id_123",
  uid: "id_123",
  isAccountDebitted: false,
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
} as const satisfies TAdminPaymentIntentDoc;

export const uploadIntentDoc1 = {
  id: "uid124_1",
  uid: "uid124",
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
} as const satisfies TUploadIntentDoc;

export const balanceDoc1 = {
  id: "uid123",
  uid: "uid123",
  value: 0,
  currentUploadIntentNumber: 0,
  uploadIntentIds: {},
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
} as const satisfies TBalanceDoc;
export const balanceDoc2 = {
  id: "uid124",
  uid: "uid124",
  value: 1000,
  currentUploadIntentNumber: 1,
  uploadIntentIds: { uid124_1: true },
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
} as const satisfies TBalanceDoc;
export const balanceDoc3 = {
  id: "uid125",
  uid: "uid125",
  value: 200,
  currentUploadIntentNumber: 1,
  uploadIntentIds: { uid125_1: true },
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
} as const satisfies TBalanceDoc;
