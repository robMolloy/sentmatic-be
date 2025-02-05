import { convertPngArrayBufferToBlob } from "@/utils/dataTypeUtils";
import { readFileSync } from "fs";
import path from "path";

let qrCodeFileBlob: Blob;
export const getQrCodeFileBlob = () => {
  if (qrCodeFileBlob) return qrCodeFileBlob;
  const buffer = readFileSync(path.resolve("./tests/mocks/qrcode.png"));
  qrCodeFileBlob = convertPngArrayBufferToBlob({ buffer, mimeType: "image/png" });
  return qrCodeFileBlob;
};
