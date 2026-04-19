/**
 * ✅ SECURITY: Email verification service
 * Generates tokens, sends verification emails, and validates verification
 */

import crypto from "crypto";
import nodemailer, { Transporter } from "nodemailer";
import { config } from "../config";
import logger from "./logger";

export interface EmailVerificationToken {
  token: string;
  hash: string; // Hash of token for secure storage
  expiresAt: Date;
}

export interface EmailServiceConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

class EmailService {
  private transporter: Transporter | null = null;
  private isConfigured = false;

  /**
   * Initialize email service with nodemailer
   */
  async initialize(): Promise<void> {
    try {
      // For development, use nodemailer test account
      if (config.nodeEnv === "development") {
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
        logger.info(
          "[EMAIL] Using test account for development (Ethereal Email)",
        );
      } else {
        // For production, use configured SMTP
        if (!config.emailProvider) {
          throw new Error("Email provider not configured for production");
        }

        this.transporter = nodemailer.createTransport(config.emailProvider);
      }

      // Verify connection
      await this.transporter.verify();
      this.isConfigured = true;
      logger.info("[EMAIL] Service initialized successfully");
    } catch (error) {
      logger.error(
        `[EMAIL] Failed to initialize: ${error instanceof Error ? error.message : String(error)}`,
      );
      // Don't throw - allow server to start without email service
    }
  }

  /**
   * Generate email verification token
   * Returns both the token (for sending to user) and hash (for storing in DB)
   */
  generateVerificationToken(): EmailVerificationToken {
    const token = crypto.randomBytes(32).toString("hex");
    const hash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    return { token, hash, expiresAt };
  }

  /**
   * Hash token for comparison with stored value
   */
  hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  /**
   * Send verification email
   */
  async sendVerificationEmail(
    email: string,
    verificationToken: string,
    userName: string = "",
  ): Promise<void> {
    if (!this.isConfigured || !this.transporter) {
      logger.warn(
        "[EMAIL] Service not configured, skipping verification email",
      );
      return;
    }

    try {
      const verificationUrl = `${config.frontendUrl}/verify-email?token=${verificationToken}`;

      const mailOptions = {
        from: `Gadgify <${config.emailFrom || "noreply@gadgify.com"}>`,
        to: email,
        subject: "Verify Your Email - Gadgify",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #333; margin-top: 0;">Welcome to Gadgify! 🎉</h2>
              <p style="color: #666; font-size: 14px;">Hi ${userName},</p>
              
              <p style="color: #666; line-height: 1.6;">
                Thank you for signing up. Please verify your email address to complete your account setup.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" style="
                  background-color: #007bff;
                  color: white;
                  padding: 12px 30px;
                  text-decoration: none;
                  border-radius: 4px;
                  display: inline-block;
                  font-weight: bold;
                ">
                  Verify Email Address
                </a>
              </div>
              
              <p style="color: #999; font-size: 12px;">
                Or copy this link: ${verificationUrl}
              </p>
              
              <p style="color: #666; font-size: 12px; line-height: 1.6;">
                This verification link will expire in 24 hours.
              </p>
            </div>
            
            <p style="color: #999; font-size: 12px; border-top: 1px solid #ddd; padding-top: 15px;">
              If you didn't create this account, please ignore this email.
            </p>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);

      // For development with test account, log preview URL
      if (config.nodeEnv === "development") {
        logger.info(`[EMAIL] Preview: ${nodemailer.getTestMessageUrl(info)}`);
      }

      logger.info(`[EMAIL] Verification email sent to ${email}`);
    } catch (error) {
      logger.error(
        `[EMAIL] Failed to send verification email: ${error instanceof Error ? error.message : String(error)}`,
      );
      // Don't throw - let signup complete even if email fails
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
    userName: string = "",
  ): Promise<void> {
    if (!this.isConfigured || !this.transporter) {
      logger.warn(
        "[EMAIL] Service not configured, skipping password reset email",
      );
      return;
    }

    try {
      const resetUrl = `${config.frontendUrl}/reset-password?token=${resetToken}`;

      const mailOptions = {
        from: `Gadgify <${config.emailFrom || "noreply@gadgify.com"}>`,
        to: email,
        subject: "Reset Your Password - Gadgify",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #333; margin-top: 0;">Password Reset Request</h2>
              <p style="color: #666; font-size: 14px;">Hi ${userName},</p>
              
              <p style="color: #666; line-height: 1.6;">
                We received a request to reset your password. Click the button below to set a new password.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="
                  background-color: #dc3545;
                  color: white;
                  padding: 12px 30px;
                  text-decoration: none;
                  border-radius: 4px;
                  display: inline-block;
                  font-weight: bold;
                ">
                  Reset Password
                </a>
              </div>
              
              <p style="color: #999; font-size: 12px;">
                Or copy this link: ${resetUrl}
              </p>
              
              <p style="color: #666; font-size: 12px; line-height: 1.6;">
                This reset link will expire in 1 hour. If you didn't request this, please ignore this email.
              </p>
            </div>
            
            <p style="color: #999; font-size: 12px; border-top: 1px solid #ddd; padding-top: 15px;">
              For security, never share this link with anyone.
            </p>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);

      if (config.nodeEnv === "development") {
        logger.info(`[EMAIL] Preview: ${nodemailer.getTestMessageUrl(info)}`);
      }

      logger.info(`[EMAIL] Password reset email sent to ${email}`);
    } catch (error) {
      logger.error(
        `[EMAIL] Failed to send password reset email: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}

// Singleton instance
let emailService: EmailService | null = null;

/**
 * Get or create email service instance
 */
export const getEmailService = (): EmailService => {
  if (!emailService) {
    emailService = new EmailService();
  }
  return emailService;
};

/**
 * Initialize email service (call during server startup)
 */
export const initializeEmailService = async (): Promise<void> => {
  const service = getEmailService();
  await service.initialize();
};

export default EmailService;
