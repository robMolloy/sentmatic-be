import { readFileSync } from "fs";
import path from "path";
import { convertPngArrayBufferToBlob } from "../../utils/dataTypeUtils";

let qrCodeFileBlob: Blob;
export const getQrCodeFileBlob = () => {
  if (qrCodeFileBlob) return qrCodeFileBlob;
  const buffer = readFileSync(path.resolve("./tests/mocks/qrcode.png"));
  qrCodeFileBlob = convertPngArrayBufferToBlob({ buffer, mimeType: "image/png" });
  return qrCodeFileBlob;
};
