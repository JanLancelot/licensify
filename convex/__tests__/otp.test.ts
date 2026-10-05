import { afterEach, expect, test, vi } from "vitest";
import { generateOtp } from "../_helpers/ResendOTP";

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

