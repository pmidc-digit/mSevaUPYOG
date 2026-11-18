import CryptoJS from "crypto-js";

// Repair base64 that got damaged in a URL query string
const normalizeBase64 = (value) => {
  let v = decodeURIComponent(value.trim()) // handles %2B, %2F, %3D if double-encoded
    .replace(/ /g, "+")                    // URLSearchParams turns "+" into " "
    .replace(/-/g, "+")                    // URL-safe base64 -> standard
    .replace(/_/g, "/");
  while (v.length % 4 !== 0) v += "=";     // restore stripped padding
  return v;
};

export const Decryption = (encryptedValue) => {
  if (!encryptedValue) return null;
  try {
    const password = "N78I99C8t--L0008";
    const key = CryptoJS.enc.Utf8.parse(password);

    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: CryptoJS.enc.Base64.parse(normalizeBase64(encryptedValue)) },
      key,
      { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
    );

    return decrypted.toString(CryptoJS.enc.Utf8) || null;
  } catch (e) {
    console.error("Decryption failed:", e.message);
    return null;
  }
};
