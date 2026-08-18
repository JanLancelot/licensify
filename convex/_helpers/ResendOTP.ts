import { ConvexError } from "convex/values";
import { Email } from "@convex-dev/auth/providers/Email";
import { Resend } from "resend";

export const ResendOTP = Email({
  id: "resend-otp",
  apiKey: process.env.RESEND_API_KEY,
  maxAge: 60 * 15, // 15 minutes
  async generateVerificationToken() {
    // Generate a 6-digit OTP
    return Math.floor(100000 + Math.random() * 900000).toString();
  },
  async sendVerificationRequest({ identifier: email, token }) {
    if (!process.env.RESEND_API_KEY) {
      throw new ConvexError(
        "RESEND_API_KEY is not configured in the Convex Dashboard. Please add it to send verification emails."
      );
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
