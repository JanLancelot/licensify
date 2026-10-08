import { describe, expect, it } from "vitest";
import { isAllowedRedirect } from "../_helpers/redirects";

const prod = { SITE_URL: "https://app.example.com" };
const dev = { ...prod, AUTH_ALLOW_DEV_REDIRECTS: "true" };

describe("isAllowedRedirect", () => {
  it("allows the app's deep-link schemes", () => {
    expect(isAllowedRedirect("thepapp://auth", prod)).toBe(true);
    expect(isAllowedRedirect("licensify://", prod)).toBe(true);
  });

  it("allows only SITE_URL's exact origin for web targets", () => {
    expect(isAllowedRedirect("https://app.example.com/dashboard", prod)).toBe(true);
    expect(isAllowedRedirect("https://app.example.com.evil.com/", prod)).toBe(false);
    expect(isAllowedRedirect("https://evil.com/?https://app.example.com", prod)).toBe(false);
    expect(isAllowedRedirect("http://app.example.com/", prod)).toBe(false);
  });

  it("rejects localhost and Expo Go targets unless dev redirects are enabled", () => {
    for (const url of ["http://localhost:8081", "http://127.0.0.1:3001/", "exp://192.168.1.5:8081"]) {
      expect(isAllowedRedirect(url, prod)).toBe(false);
      expect(isAllowedRedirect(url, dev)).toBe(true);
    }
  });

  it("does not treat lookalike hosts as localhost", () => {
    expect(isAllowedRedirect("http://localhost.evil.com:80/", dev)).toBe(false);
    expect(isAllowedRedirect("https://evil.com", { AUTH_ALLOW_DEV_REDIRECTS: "true" })).toBe(false);
  });
});
