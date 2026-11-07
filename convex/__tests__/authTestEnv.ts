/**
 * Configures the signing keys Convex Auth needs so tests can drive the real
 * sign-up and sign-in flows through `api.auth.signIn`.
 */
export async function configureAuthEnv() {
  const { privateKey, publicKey } = await crypto.subtle.generateKey(
    {
      name: "RSASSA-PKCS1-v1_5",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["sign", "verify"]
  );
  const pkcs8 = new Uint8Array(await crypto.subtle.exportKey("pkcs8", privateKey));
  const base64 = btoa(String.fromCharCode(...pkcs8));
  process.env.JWT_PRIVATE_KEY = `-----BEGIN PRIVATE KEY----- ${base64} -----END PRIVATE KEY-----`;
  process.env.JWKS = JSON.stringify({
    keys: [{ use: "sig", ...(await crypto.subtle.exportKey("jwk", publicKey)) }],
  });
  process.env.CONVEX_SITE_URL = "https://test.convex.site";
}
