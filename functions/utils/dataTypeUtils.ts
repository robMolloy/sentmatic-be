export const convertPngArrayBufferToBlob = (p: { buffer: ArrayBuffer; mimeType: "image/png" }) => {
  return new Blob([p.buffer], { type: p.mimeType });
};
export const convertBlobToArrayBuffer = (blob: Blob) => {
  return blob.arrayBuffer();
};
