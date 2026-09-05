/**
 * Deterministic SHA-256 answer hashing utility using standard Web Crypto API.
 * Ensures identical hashing between question write-time, offline sync bundles,
 * and client-side anti-tamper verification.
 */
export async function hashAnswer(questionId: string, choiceId: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${questionId}:${choiceId}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const bytes = new Uint8Array(hashBuffer);
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += (bytes[i] < 16 ? "0" : "") + bytes[i].toString(16);
  }
  return hex;
}
