import { Resend } from "resend";
import { config } from "../config";
import logger from "./logger";

let resend: Resend | null = null;

const getResendClient = (): Resend => {
  if (!resend) {
    if (!config.resendApiKey) {
      throw new Error(
        "RESEND_API_KEY is not configured. Set it in your .env file.",
      );
    }
    resend = new Resend(config.resendApiKey);
  }
  return resend;
};

export const sendPasswordResetEmail = async (
  to: string,
  resetToken: string,
): Promise<void> => {
  const resetUrl = `${config.frontendUrl}/reset-password?token=${resetToken}`;

  const { error } = await getResendClient().emails.send({
    from: config.emailFrom,
    to,
    subject: "Reset Your Password — Gadgify",
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #ffffff; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #1B2A4A; font-size: 24px; margin: 0;">Gadgify</h1>
        </div>
        <h2 style="color: #1B2A4A; font-size: 20px; margin-bottom: 12px;">Reset Your Password</h2>
        <p style="color: #57534e; font-size: 14px; line-height: 1.6;">
          We received a request to reset your password. Click the button below to choose a new one. This link expires in <strong>1 hour</strong>.
        </p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${resetUrl}" style="background: #FF6B2C; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="color: #a8a29e; font-size: 12px; line-height: 1.5;">
          If you didn't request this, you can safely ignore this email. Your password will remain unchanged.
        </p>
        <hr style="border: none; border-top: 1px solid #E7E5E4; margin: 24px 0;" />
        <p style="color: #a8a29e; font-size: 11px; text-align: center;">
          &copy; ${new Date().getFullYear()} Gadgify. All rights reserved.
        </p>
      </div>
    `,
  });

  if (error) {
    logger.error(
      `Failed to send password reset email to ${to}: ${error.message}`,
    );
    throw new Error("Failed to send password reset email");
  }

  logger.info(`Password reset email sent to ${to}`);
};
