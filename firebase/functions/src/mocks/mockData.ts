import { Timestamp } from "firebase-admin/firestore";
import { TPaymentIntentDoc } from "../adminFirestoreSdk/adminFirestoreSdk";

export const paymentIntentDoc1 = {
  id: "pi_id_123",
  uid: "id_123",
  isAccountDebitted: false,
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
} as const satisfies TPaymentIntentDoc;
