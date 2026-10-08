import { afterEach, expect, test, vi } from "vitest";
import { generateOtp, ResendOTP } from "../_helpers/ResendOTP";

afterEach(() => vi.restoreAllMocks());

test("OTPs are six digits drawn from the secure RNG", () => {
  const mathRandom = vi.spyOn(Math, "random");
  const secureRandom = vi.spyOn(crypto, "getRandomValues");

  for (let i = 0; i < 200; i++) {
    expect(generateOtp()).toMatch(/^\d{6}$/);
  }
  expect(secureRandom).toHaveBeenCalled();
  expect(mathRandom).not.toHaveBeenCalled();
});

test("OTPs keep leading zeros", () => {
  vi.spyOn(crypto, "getRandomValues").mockImplementation((array) => {
    (array as Uint32Array)[0] = 42;
    return array;
  });
  expect(generateOtp()).toBe("000042");
});

test("codes are not logged unless explicitly enabled for development", async () => {
  vi.stubEnv("RESEND_API_KEY", "");
  vi.stubEnv("AUTH_LOG_OTP", "");
  const log = vi.spyOn(console, "log").mockImplementation(() => {});
  const send = (ResendOTP as any).sendVerificationRequest;

  await expect(send({ identifier: "a@example.com", token: "123456" })).rejects.toThrow(
    "Email delivery is not configured."
  );
  expect(log).not.toHaveBeenCalled();

  vi.stubEnv("AUTH_LOG_OTP", "true");
  await send({ identifier: "a@example.com", token: "123456" });
  expect(log).toHaveBeenCalledOnce();
  vi.unstubAllEnvs();
});
