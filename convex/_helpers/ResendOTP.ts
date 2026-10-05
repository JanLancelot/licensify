import { Email } from "@convex-dev/auth/providers/Email";
import { Resend } from "resend";

/**
 * Generates a 6-digit one-time code from a cryptographically secure source.
 * Rejection sampling keeps every code equally likely.
 */
export function generateOtp(): string {
  const limit = Math.floor(0x100000000 / 1_000_000) * 1_000_000;
  const buffer = new Uint32Array(1);
  do {
    crypto.getRandomValues(buffer);
  } while (buffer[0] >= limit);
  return (buffer[0] % 1_000_000).toString().padStart(6, "0");
}

export const ResendOTP = Email({
  id: "resend-otp",
  apiKey: process.env.RESEND_API_KEY,
  maxAge: 60 * 15, // 15 minutes
  async generateVerificationToken() {
    return generateOtp();
  },
  async sendVerificationRequest({ identifier: email, token }) {
    if (!process.env.RESEND_API_KEY) {
      console.log(`[DEV OTP SIMULATION] Verification OTP for ${email}: ${token}`);
      return;
    }
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: "Licensify <noreply@adrianmorrisseybelo.website>",
      to: [email],
      subject: "Your Verification Code",
      text: `Your verification code is ${token}. It expires in 20 minutes.`,
    });

    if (error) {
      throw new Error(`Could not send email: ${error.message}`);
    }
  },
});
