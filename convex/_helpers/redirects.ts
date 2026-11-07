// Deep-link schemes registered by the mobile app (current and legacy builds).
const APP_SCHEMES = ["thepapp://", "licensify://", "reactnativerepo://"];

const DEV_HOSTS = new Set(["localhost", "127.0.0.1"]);

function parse(url: string): URL | null {
  try {
    return new URL(url);
  } catch {
    return null;
  }
}

/**
 * Decides whether an auth flow may send the user (and their one-time sign-in
 * code) back to `redirectTo`. Web targets must share SITE_URL's origin.
 * Localhost and Expo Go targets are accepted only on deployments that opt in
 * with AUTH_ALLOW_DEV_REDIRECTS=true.
 */
export function isAllowedRedirect(
  redirectTo: string,
  env: Record<string, string | undefined> = process.env
): boolean {
  if (APP_SCHEMES.some((scheme) => redirectTo.startsWith(scheme))) return true;

  const target = parse(redirectTo);
  if (!target) return false;

  const site = env.SITE_URL ? parse(env.SITE_URL) : null;
  if (site && target.origin === site.origin) return true;

  if (env.AUTH_ALLOW_DEV_REDIRECTS === "true") {
    if (target.protocol === "exp:") return true;
    if (target.protocol === "http:" && DEV_HOSTS.has(target.hostname)) return true;
  }
  return false;
}
