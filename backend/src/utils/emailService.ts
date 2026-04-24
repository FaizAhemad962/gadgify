import crypto from "crypto";
import { Resend } from "resend";
import { config } from "../config";
import logger from "./logger";

/**
 * ✅ Token interfaces (kept from your old code)
 */
export interface EmailVerificationToken {
  token: string;
  hash: string;
  expiresAt: Date;
}

/**
 * ✅ Resend Client Singleton
 */
let resend: Resend | null = null;

const getResendClient = (): Resend => {
  if (!resend) {
    if (!config.resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }
    resend = new Resend(config.resendApiKey);
  }
  return resend;
};

/**
 * ✅ Shared Email Layout
 */
const brandColor = "#FF6B2C";

const emailLayout = (body: string) => `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; background: #ffffff; border-radius: 12px;">
    <div style="text-align: center; margin-bottom: 24px;">
      <h1 style="color: #1B2A4A; font-size: 24px; margin: 0;">Gadgify</h1>
    </div>
    ${body}
    <hr style="border: none; border-top: 1px solid #E7E5E4; margin: 24px 0;" />
    <p style="color: #a8a29e; font-size: 11px; text-align: center;">
      © ${new Date().getFullYear()} Gadgify. All rights reserved.
    </p>
  </div>
`;

/**
 * ✅ Core Send Function
 */
const sendEmail = async (
  to: string,
  subject: string,
  html: string,
): Promise<void> => {
  try {
    const { error } = await getResendClient().emails.send({
      from: config.emailFrom,
      to,
      subject,
      html,
    });

    if (error) {
      throw error;
    }

    logger.info(`[EMAIL] "${subject}" sent to ${to}`);
  } catch (error) {
    logger.error(
      `[EMAIL] Failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    throw error;
  }
};

/**
 * ✅ TOKEN FUNCTIONS (from your old system)
 */
export const generateVerificationToken = (): EmailVerificationToken => {
  const token = crypto.randomBytes(32).toString("hex");
  const hash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  return { token, hash, expiresAt };
};

export const hashToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

/**
 * ✅ EMAIL VERIFICATION
 */
export const sendEmailVerificationEmail = async (
  to: string,
  verificationToken: string,
  name: string,
): Promise<void> => {
  const verificationUrl = `${config.frontendUrl}/verify-email?token=${verificationToken}`;

  await sendEmail(
    to,
    "Verify Your Email — Gadgify",
    emailLayout(`
      <h2 style="color: #1B2A4A;">Verify Your Email</h2>
      <p>Hi ${name}, please verify your email.</p>

      <div style="text-align:center;margin:24px 0;">
        <a href="${verificationUrl}" style="
          background:${brandColor};
          color:#fff;
          padding:12px 28px;
          border-radius:6px;
          text-decoration:none;
        ">
          Verify Email
        </a>
      </div>

      <p>${verificationUrl}</p>
    `),
  );
};

/**
 * ✅ PASSWORD RESET
 */
export const sendPasswordResetEmail = async (
  to: string,
  resetToken: string,
): Promise<void> => {
  const resetUrl = `${config.frontendUrl}/reset-password?token=${resetToken}`;

  await sendEmail(
    to,
    "Reset Your Password — Gadgify",
    emailLayout(`
      <h2>Password Reset</h2>
      <p>Click below to reset your password (valid for 1 hour)</p>

      <div style="text-align:center;margin:24px 0;">
        <a href="${resetUrl}" style="
          background:${brandColor};
          color:#fff;
          padding:12px 28px;
          border-radius:6px;
          text-decoration:none;
        ">
          Reset Password
        </a>
      </div>
    `),
  );
};

/**
 * ✅ WELCOME EMAIL
 */
export const sendWelcomeEmail = async (
  to: string,
  name: string,
): Promise<void> => {
  await sendEmail(
    to,
    "Welcome to Gadgify 🎉",
    emailLayout(`
      <h2>Welcome ${name}!</h2>
      <p>Your account is ready.</p>

      <div style="text-align:center;margin:24px 0;">
        <a href="${config.frontendUrl}" style="
          background:${brandColor};
          color:#fff;
          padding:12px 28px;
          border-radius:6px;
          text-decoration:none;
        ">
          Start Shopping
        </a>
      </div>
    `),
  );
};
