import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import crypto from "crypto";
import { config } from "../config";

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string,
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

export const generateToken = (payload: {
  id: string;
  email: string;
  role: string;
}): string => {
  return jwt.sign(payload, String(config.jwtSecret), {
    expiresIn: String(config.jwtExpiresIn),
  } as SignOptions);
};

// ✅ SECURITY: Email verification token generation and hashing
export interface EmailVerificationToken {
  token: string;
  hash: string;
  expiresAt: Date;
}

export const generateEmailVerificationToken = (): EmailVerificationToken => {
  const token = crypto.randomBytes(32).toString("hex");
  const hash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  return { token, hash, expiresAt };
};

export const hashEmailToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};
