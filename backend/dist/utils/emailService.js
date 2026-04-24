"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWelcomeEmail = exports.sendPasswordResetEmail = exports.sendEmailVerificationEmail = exports.hashToken = exports.generateVerificationToken = void 0;
const crypto_1 = __importDefault(require("crypto"));
const resend_1 = require("resend");
const config_1 = require("../config");
const logger_1 = __importDefault(require("./logger"));
/**
 * ✅ Resend Client Singleton
 */
let resend = null;
const getResendClient = () => {
    if (!resend) {
        if (!config_1.config.resendApiKey) {
            throw new Error("RESEND_API_KEY is not configured");
        }
        resend = new resend_1.Resend(config_1.config.resendApiKey);
    }
    return resend;
};
/**
 * ✅ Shared Email Layout
 */
const brandColor = "#FF6B2C";
const emailLayout = (body) => `
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
const sendEmail = async (to, subject, html) => {
    try {
        const { error } = await getResendClient().emails.send({
            from: config_1.config.emailFrom,
            to,
            subject,
            html,
        });
        if (error) {
            throw error;
        }
        logger_1.default.info(`[EMAIL] "${subject}" sent to ${to}`);
    }
    catch (error) {
        logger_1.default.error(`[EMAIL] Failed: ${error instanceof Error ? error.message : String(error)}`);
        throw error;
    }
};
/**
 * ✅ TOKEN FUNCTIONS (from your old system)
 */
const generateVerificationToken = () => {
    const token = crypto_1.default.randomBytes(32).toString("hex");
    const hash = crypto_1.default.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return { token, hash, expiresAt };
};
exports.generateVerificationToken = generateVerificationToken;
const hashToken = (token) => {
    return crypto_1.default.createHash("sha256").update(token).digest("hex");
};
exports.hashToken = hashToken;
/**
 * ✅ EMAIL VERIFICATION
 */
const sendEmailVerificationEmail = async (to, verificationToken, name) => {
    const verificationUrl = `${config_1.config.frontendUrl}/verify-email?token=${verificationToken}`;
    await sendEmail(to, "Verify Your Email — Gadgify", emailLayout(`
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
    `));
};
exports.sendEmailVerificationEmail = sendEmailVerificationEmail;
/**
 * ✅ PASSWORD RESET
 */
const sendPasswordResetEmail = async (to, resetToken) => {
    const resetUrl = `${config_1.config.frontendUrl}/reset-password?token=${resetToken}`;
    await sendEmail(to, "Reset Your Password — Gadgify", emailLayout(`
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
    `));
};
exports.sendPasswordResetEmail = sendPasswordResetEmail;
/**
 * ✅ WELCOME EMAIL
 */
const sendWelcomeEmail = async (to, name) => {
    await sendEmail(to, "Welcome to Gadgify 🎉", emailLayout(`
      <h2>Welcome ${name}!</h2>
      <p>Your account is ready.</p>

      <div style="text-align:center;margin:24px 0;">
        <a href="${config_1.config.frontendUrl}" style="
          background:${brandColor};
          color:#fff;
          padding:12px 28px;
          border-radius:6px;
          text-decoration:none;
        ">
          Start Shopping
        </a>
      </div>
    `));
};
exports.sendWelcomeEmail = sendWelcomeEmail;
